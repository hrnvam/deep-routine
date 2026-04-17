import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db, auth } from '../utils/firebase';
import { GEMINI_API_KEY } from '@env';

const CACHE_KEY = '@ai_report_cache';
const CACHE_EXPIRY = 1000 * 60 * 60 * 4;

export interface AIReport {
  report: string;
  advice: Array<{ title: string; action: string }>;
  timestamp?: number;
}

async function gatherTaskMetrics() {
  const user = auth.currentUser;
  if (!user) throw new Error('A user must be logged in to gather task metrics');

  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

  const q = query(
    collection(db, 'tasks'),
    where('userId', '==', user.uid),
    where('dueDate', '>=', sevenDaysAgo),
    limit(50)
  );

  const snap = await getDocs(q);

  const tasks = snap.docs.map(d => {
    const data = d.data();
    return {
      completed: Boolean(data.completed),
      category: String(data.category || 'General'),
      dueDate: data.dueDate?.seconds
        ? data.dueDate.seconds * 1000
        : Number(data.dueDate),
    };
  });

  return {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    overdue: tasks.filter(t => !t.completed && t.dueDate < now).length,
    categories: tasks.reduce((acc: Record<string, number>, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    }, {}),
  };
}

export const getAIAnalysis = async (forceRefresh = false): Promise<AIReport> => {
  try {
    if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not found in .env');

    if (!forceRefresh) {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed: AIReport = JSON.parse(cached);
        if (Date.now() - (parsed.timestamp || 0) < CACHE_EXPIRY) {
          return parsed;
        }
      }
    }

    const metrics = await gatherTaskMetrics();

    const prompt = `You are a productivity expert. Analyze these user task metrics from the past 7 days: ${JSON.stringify(metrics)}.
Return ONLY a valid JSON object (no markdown, no backticks, no explanation) in this exact format:
{
  "report": "3-4 sentence progress summary in English",
  "advice": [
    {"title": "short title in English", "action": "actionable advice in English"},
    {"title": "short title in English", "action": "actionable advice in English"},
    {"title": "short title in English", "action": "actionable advice in English"}
  ]
}`;

    const MODEL = 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY.trim()}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('Gemini API error:', JSON.stringify(err, null, 2));
      throw new Error(
        `API Error ${response.status}: ${err?.error?.message ?? 'Unknown'}`
      );
    }

    const result = await response.json();
    const rawText: string | undefined =
      result?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) throw new Error('Empty message from Gemini');

    const cleaned = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const parsed = JSON.parse(cleaned);

    const reportData: AIReport = {
      report: parsed.report,
      advice: parsed.advice,
      timestamp: Date.now(),
    };

    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(reportData));
    return reportData;

  } catch (error: any) {
    console.error('AI Analysis error:', error.message);
    return {
      report: 'Analysis temporarily unavailable. Please refresh tasks and try again later.',
      advice: [
        { title: 'Tip', action: 'Keep working on tasks as scheduled!' },
      ],
      timestamp: 0,
    };
  }
};