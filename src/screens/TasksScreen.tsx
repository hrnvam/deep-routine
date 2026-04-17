import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CheckCircle2,
  Circle,
  Trash2,
  Edit3,
  Search,
} from "lucide-react-native";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  deleteDoc,
  orderBy,
} from "firebase/firestore";
import { auth, db } from "../utils/firebase";
import { AppColors, categoryColors, priorityColors } from "../constants/Colors";
import { Task } from "../interfaces/task";

export default function TasksScreen({ navigation }: any) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"todo" | "done">("todo");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Work", "Health", "Study", "Personal"];
  const now = new Date().getTime();

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "tasks"),
      where("userId", "==", auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const tasksData = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as Task)
        );

        const priorityWeights: Record<string, number> = {
          High: 1,
          Medium: 2,
          Low: 3,
        };

        const sortedTasks = tasksData.sort((a, b) => {
          const weightA = priorityWeights[a.priority] || 4;
          const weightB = priorityWeights[b.priority] || 4;

          if (weightA !== weightB) {
            return weightA - weightB;
          }

          return (a.dueDate || 0) - (b.dueDate || 0);
        });

        setTasks([...sortedTasks]);
        setLoading(false);
      },
      (error) => {
        console.error("Snapshot error:", error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const tasksInCategory = tasks.filter(
    (task) => selectedCategory === "All" || task.category === selectedCategory
  );

  const todoCount = tasksInCategory.filter((t) => !t.completed).length;
  const doneCount = tasksInCategory.filter((t) => t.completed).length;

  const filteredTasks = tasksInCategory.filter((task) =>
    filter === "todo" ? !task.completed : task.completed
  );

  const getPriorityColor = (priority: string) => {
    return priorityColors[priority] || "#56577A";
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>All Tasks</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, filter === "todo" && styles.activeTab]}
          onPress={() => setFilter("todo")}
        >
          <Text
            style={[styles.tabText, filter === "todo" && styles.activeTabText]}
          >
            Todo ({todoCount})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, filter === "done" && styles.activeTab]}
          onPress={() => setFilter("done")}
        >
          <Text
            style={[styles.tabText, filter === "done" && styles.activeTabText]}
          >
            Done ({doneCount})
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.categoriesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {categories.map((cat) => {
            const countInCat = tasks.filter(
              (t) => cat === "All" || t.category === cat
            ).length;
            const isActive = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[
                  styles.categoryChip,
                  isActive && styles.activeCategoryChip,
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    isActive && styles.activeCategoryText,
                  ]}
                >
                  {cat}
                  {countInCat > 0 && (
                    <Text style={{ fontSize: 12, opacity: 0.7 }}>
                      {" "}
                      ({countInCat})
                    </Text>
                  )}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator
          color={AppColors.primary}
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 25, paddingBottom: 150 }}
          renderItem={({ item }) => {
            const isOverdue = !item.completed && item.dueDate < now;
            const catColor = categoryColors[item.category] || "#56577A";
            const priorityColor = getPriorityColor(item.priority);

            return (
              <View style={styles.taskCard}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() =>
                    updateDoc(doc(db, "tasks", item.id), {
                      completed: !item.completed,
                    })
                  }
                >
                  {item.completed ? (
                    <CheckCircle2 size={22} color={AppColors.primary} />
                  ) : (
                    <Circle
                      size={22}
                      color={isOverdue ? "#FF7675" : "#33355A"}
                    />
                  )}
                </TouchableOpacity>

                <View style={styles.taskInfo}>
                  <Text
                    style={[
                      styles.taskTitle,
                      item.completed && styles.completedText,
                      isOverdue && styles.overdueText,
                    ]}
                  >
                    {item.title}
                  </Text>

                  <View style={styles.taskMetaRow}>
                    <View
                      style={[
                        styles.catBadge,
                        { backgroundColor: `${catColor}20` },
                      ]}
                    >
                      <Text style={[styles.taskCategory, { color: catColor }]}>
                        {item.category}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.priorityDot,
                        { backgroundColor: priorityColor },
                      ]}
                    />

                    <Text
                      numberOfLines={1}
                      style={[
                        styles.taskLabel,
                        isOverdue && { color: "#FF7675" },
                        { flex: 1 },
                      ]}
                    >
                      {isOverdue
                        ? "Overdue!"
                        : `${new Date(item.dueDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                            }
                          )}`}
                    </Text>
                  </View>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("AddTask", { task: item })
                    }
                  >
                    <Edit3 size={16} color="#56577A" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => deleteDoc(doc(db, "tasks", item.id))}
                  >
                    {/* Иконка теперь не красная, а в цвет остальных действий */}
                    <Trash2 size={16} color="#56577A" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020206" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    paddingTop: 10,
    alignItems: "center",
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "DM Sans",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#1E2333",
    marginHorizontal: 15,
    borderRadius: 12,
    padding: 5,
    marginBottom: 15,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  activeTab: { backgroundColor: "#5B4FFF" },
  tabText: {
    fontFamily: "DM Sans",
    color: "#555D7A",
    fontWeight: "500",
    fontSize: 13,
  },
  activeTabText: { color: "white" },

  categoriesContainer: {
    height: 55,
    marginBottom: 15,
    marginRight: 15,
  },
  categoriesScroll: {
    paddingHorizontal: 25,
    paddingRight: 40,
    gap: 12,
    alignItems: "center",
  },
  categoryChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#1E1F35",
    minWidth: 90,
    alignItems: "center",
    justifyContent: "center",
  },
  activeCategoryChip: {
    backgroundColor: "#1C1D3D",
    borderColor: "#555D7A",
  },
  categoryText: {
    color: "#555D7A",
    fontSize: 14,
    fontWeight: "600",
  },
  activeCategoryText: {
    color: "#E8EAF0",
  },

  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16172B",
    borderRadius: 16,
    marginBottom: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#1E1F35",
  },
  checkbox: {
    marginRight: 2,
  },
  taskInfo: {
    flex: 1,
    marginLeft: 8,
  },
  taskTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "DM Sans",
  },
  overdueText: {
    color: "#FF7675",
  },
  taskMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    flex: 1,
  },

  catBadge: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 20,
    marginRight: 8,
    alignSelf: "flex-start",
  },
  taskCategory: {
    fontFamily: "DM Sans",
    fontSize: 9,
    fontWeight: "500",
    lineHeight: 9,
    letterSpacing: 0,
    textTransform: "uppercase",
  },

  taskLabel: {
    fontFamily: "DM Sans",
    fontSize: 12,
    fontWeight: "500",
    color: "#56577A",
    letterSpacing: 0,
  },

  priorityDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 6,
  },

  completedText: {
    textDecorationLine: "line-through",
    opacity: 0.4,
    color: "#56577A",
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginLeft: 10,
  },
});
