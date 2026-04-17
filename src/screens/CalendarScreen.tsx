import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar } from "react-native-calendars";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { auth, db } from "../utils/firebase";
import { AppColors } from "../constants/Colors";
import { CheckCircle2, Circle, ChevronRight } from "lucide-react-native";

export default function CalendarScreen({ navigation }: any) {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [tasks, setTasks] = useState<any[]>([]);
  const [markedDates, setMarkedDates] = useState({});

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "tasks"),
      where("userId", "==", auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dots: any = {};
      const allTasks = snapshot.docs.map((doc) => {
        const data = doc.data();
        const taskDate = data.dateString;

        if (taskDate) {
          dots[taskDate] = {
            marked: true,
            dotColor: AppColors.primary,
          };
        }
        return { id: doc.id, ...data };
      });

      if (dots[selectedDate]) {
        dots[selectedDate] = {
          ...dots[selectedDate],
          selected: true,
          selectedColor: AppColors.primary,
        };
      } else {
        dots[selectedDate] = {
          selected: true,
          selectedColor: AppColors.primary,
        };
      }

      setMarkedDates({ ...dots });
      setTasks(allTasks);
    });

    return unsubscribe;
  }, [selectedDate]);

  const formatTime = (timestamp: number) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const filteredTasks = tasks.filter(
    (task) => task.dateString === selectedDate
  );
  const now = new Date().getTime();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Calendar</Text>
      </View>

      <Calendar
        current={selectedDate}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={markedDates}
        theme={{
          backgroundColor: "#020206",
          calendarBackground: "#020206",
          textSectionTitleColor: "#56577A",
          selectedDayBackgroundColor: AppColors.primary,
          selectedDayTextColor: "#ffffff",
          todayTextColor: AppColors.primary,
          dayTextColor: "#ffffff",
          textDisabledColor: "#2d4150",
          dotColor: AppColors.primary,
          monthTextColor: "white",
          indicatorColor: "white",
          arrowColor: AppColors.primary,
        }}
      />

      <View style={styles.taskListContainer}>
        <Text style={styles.subTitle}>Tasks for {selectedDate}</Text>

        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 120 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No tasks for this day</Text>
          }
          renderItem={({ item }) => {
            const isOverdue = !item.completed && item.dueDate < now;

            const getIndicatorColor = () => {
              if (item.completed) return "#00D2D3";
              switch (item.priority) {
                case "High":
                  return "#FF7675";
                case "Medium":
                  return "#FDCB6E";
                case "Low":
                  return "#00D2D3";
                default:
                  return "#56577A";
              }
            };

            return (
              <TouchableOpacity
                style={styles.taskCard}
                onPress={() => navigation.navigate("AddTask", { task: item })}
              >
                {/* Цвет индикатора строго по приоритету */}
                <View
                  style={[
                    styles.priorityIndicator,
                    { backgroundColor: getIndicatorColor() },
                  ]}
                />

                <View style={styles.taskContent}>
                  {/* ТЕКСТ: Становится красным только если просрочено */}
                  <Text
                    style={[
                      styles.taskTitle,
                      item.completed && styles.completedText,
                      isOverdue && styles.overdueText,
                    ]}
                  >
                    {item.title}
                  </Text>

                  <Text
                    style={[styles.taskMeta, isOverdue && styles.overdueText]}
                  >
                    {item.completed ? (
                      `Done • ${item.category}`
                    ) : (
                      <>
                        {/* Добавляем время из dueDate */}
                        {item.dueDate
                          ? `Due ${formatTime(item.dueDate)} • `
                          : ""}
                        {isOverdue
                          ? `Overdue • ${item.category}`
                          : `${item.category} • ${item.priority} priority`}
                      </>
                    )}
                  </Text>
                </View>
                <ChevronRight
                  size={18}
                  color="#56577A"
                  style={{ marginRight: 15 }}
                />
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020206" },
  header: { padding: 25 },
  title: { color: "white", fontSize: 24, fontWeight: "bold" },
  subTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 20,
    paddingHorizontal: 25,
  },
  taskListContainer: { flex: 1 },
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16172B",
    marginHorizontal: 25,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1E1F35",
    overflow: "hidden",
    minHeight: 80,
  },
  priorityIndicator: { width: 6, height: "100%" },
  taskContent: { flex: 1, paddingHorizontal: 15, paddingVertical: 12 },
  taskTitle: { color: "white", fontSize: 17, fontWeight: "600" },
  overdueText: { color: "#FF7675" },
  taskMeta: { color: "#56577A", fontSize: 13, marginTop: 4 },
  completedText: {
    textDecorationLine: "line-through",
    color: "#56577A",
    opacity: 0.7,
  },
  emptyText: { color: "#56577A", textAlign: "center", marginTop: 30 },
});
