# DeepRoutine — AI-Powered Task Manager

**DeepRoutine** is a high-performance mobile task manager built with React Native. It combines a futuristic "Deep Dark" aesthetic with intelligent AI insights to help users maintain focus and optimize their daily routines.
Figma [https://www.figma.com/design/pRu1yLxlpqCwDUG2haabUl/management?node-id=2-1111&t=BbwFYCaV5KNnuShA-1] 

## Key Features
* **Smart Task Orchestration:** Create, edit, and manage tasks with category-specific coloring and priority levels (High, Medium, Low).
* **AI Advisor:** A weekly overview system that analyzes your productivity trends and provides actionable recommendations using AI.
* **Cloud Sync:** Powered by **Firebase Firestore** for real-time data persistence and **Firebase Auth** for secure user sessions.
* **Native iOS/Android Feel:** Custom modal date-pickers for iOS and optimized inputs for a premium mobile experience.
* **Visual Priority:** Tasks are automatically sorted by priority and due date to ensure you never miss a deadline.

## Tech Stack
* **Framework:** React Native (Expo)
* **Database & Auth:** Firebase (Firestore / Auth)
* **Language:** TypeScript
* **Icons:** Lucide React Native
* **Styling:** StyleSheet (Custom Design System)
* **Fonts:** Syne (Headings), DM Sans (Body)

## Getting Started
### 1. Clone the repository
```bash
git clone [https://github.com/yourusername/deep-routine.git](https://github.com/yourusername/deep-routine.git)
cd deep-routine
```

### 2. Install dependencies
```bash
npm install
# or
yarn install
```

### 3. Firebase Configuration
Create a file at src/utils/firebase.ts and populate it with your Firebase project credentials:
```
TypeScript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 4. Run the App
```bash
npx expo start
```
