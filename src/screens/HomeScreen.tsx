import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Pressable,
} from "react-native";
import { doc, updateDoc } from "firebase/firestore";
import { SafeAreaView } from "react-native-safe-area-context";
import { CheckCircle2, Circle, LogOut, X } from "lucide-react-native";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { auth, db } from "../utils/firebase";
import { signOut } from "firebase/auth";
import { AppColors, categoryColors } from "../constants/Colors";

export default function HomeScreen({ navigation }: any) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("User");
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, "tasks"),
      where("userId", "==", auth.currentUser.uid)
    );

    const user = auth.currentUser;
    const rawName = user.displayName || user.email?.split("@")[0] || "User";
    const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
    setUserName(formattedName);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTasks(tasksData);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleSignOut = async () => {
    setMenuVisible(false);
    await signOut(auth);
  };

  const now = new Date().getTime();
  const todayString = new Date().toISOString().split("T")[0];

  const stats = {
    total: tasks.length,
    today: tasks.filter((t) => !t.completed && t.dateString === todayString).length,
    done: tasks.filter((t) => t.completed).length,
    overdue: tasks.filter((t) => !t.completed && t.dueDate < now).length,
  };

  const renderSummaryBox = (
    label: string,
    value: number,
    isToday: boolean = false,
    isOverdue: boolean = false
  ) => (
    <View style={[styles.summaryBox, isToday && { backgroundColor: "#5B4FFF", borderColor: "#5B4FFF" }]}>
      <Text style={[styles.summaryNumber, isToday && { color: "#FFFFFF" }, isOverdue && { color: "#FF4D6A" }]}>
        {value}
      </Text>
      <Text style={[styles.summaryLabel, isToday && { color: "#FFFFFF", opacity: 0.8 }]}>
        {label}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingText}>Hello,</Text>
            <Text style={styles.nameText}>{userName} 👋</Text>
          </View>
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => setMenuVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.avatarPlaceholder}>
              <Text style={{ color: "#5B4FFF", fontWeight: "bold", fontSize: 18 }}>
                {userName.charAt(0)}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Summary */}
        <View style={styles.summaryContainer}>
          {renderSummaryBox("Total", stats.total)}
          {renderSummaryBox("Today", stats.today, true)}
          {renderSummaryBox("Done", stats.done)}
          {renderSummaryBox("Overdue", stats.overdue, false, true)}
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Tasks</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Tasks")}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {/* Task List */}
        {loading ? (
          <ActivityIndicator color={AppColors.primary} style={{ marginTop: 20 }} />
        ) : (
          tasks
            .filter((t) => t.dateString === todayString || (!t.completed && t.dueDate < now))
            .slice(0, 4)
            .map((item) => {
              const isOverdue = !item.completed && item.dueDate < now;
              const catColor = categoryColors[item.category] || "#56577A";

              return (
                <View key={item.id} style={styles.taskCard}>
                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => updateDoc(doc(db, "tasks", item.id), { completed: !item.completed })}
                  >
                    {item.completed ? (
                      <CheckCircle2 size={24} color="#5B4FFF" />
                    ) : (
                      <Circle size={24} color={isOverdue ? "#FF4D6A" : "#2A3050"} />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.taskContent}
                    onPress={() => navigation.navigate("AddTask", { task: item })}
                  >
                    <Text numberOfLines={1} style={[styles.taskTitle, item.completed && styles.completedText]}>
                      {item.title}
                    </Text>
                    <View style={styles.taskMetaRow}>
                      <View style={[styles.catBadge, { backgroundColor: `${catColor}15` }]}>
                        <Text style={[styles.taskCategory, { color: catColor }]}>{item.category}</Text>
                      </View>
                      <Text style={[styles.taskLabel, isOverdue && !item.completed && { color: "#FF4D6A" }]}>
                        {item.completed
                          ? `Done ${new Date(item.dueDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                          : isOverdue
                          ? "Overdue!"
                          : `Due ${new Date(item.dueDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })
        )}
      </ScrollView>

      {/* Profile Modal */}
      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <Pressable style={styles.menuCard} onPress={() => {}}>
            {/* User info */}
            <View style={styles.menuHeader}>
              <View style={styles.menuAvatar}>
                <Text style={styles.menuAvatarText}>{userName.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuName}>{userName}</Text>
                <Text style={styles.menuEmail}>{auth.currentUser?.email}</Text>
              </View>
              <TouchableOpacity onPress={() => setMenuVisible(false)} style={styles.closeBtn}>
                <X size={18} color="#56577A" />
              </TouchableOpacity>
            </View>

            <View style={styles.menuDivider} />

            {/* Sign out */}
            <TouchableOpacity style={styles.menuItem} onPress={handleSignOut} activeOpacity={0.7}>
              <LogOut size={18} color="#FF4D6A" />
              <Text style={styles.menuItemTextDanger}>Sign out</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020206" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 20,
  },
  greetingText: { color: "#56577A", fontSize: 14, fontFamily: "DM Sans" },
  nameText: { color: "white", fontSize: 26, fontWeight: "bold", fontFamily: "DM Sans" },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1E2333",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2A3050",
  },
  avatarPlaceholder: { justifyContent: "center", alignItems: "center" },

  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 30,
    gap: 10,
  },
  summaryBox: {
    flex: 1,
    backgroundColor: "#1E2333",
    borderWidth: 1,
    borderColor: "#2A3050",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryNumber: {
    fontFamily: "Syne",
    fontWeight: "800",
    fontSize: 24,
    lineHeight: 24,
    color: "white",
    marginBottom: 6,
  },
  summaryLabel: {
    fontFamily: "DM Sans",
    fontWeight: "400",
    fontSize: 10,
    lineHeight: 10,
    letterSpacing: 0.5,
    color: "#56577A",
    textTransform: "capitalize",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: { color: "white", fontSize: 18, fontWeight: "bold", fontFamily: "DM Sans" },
  seeAll: { color: "#5B4FFF", fontSize: 13, fontFamily: "DM Sans" },

  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16172B",
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#1E1F35",
  },
  checkboxContainer: { paddingRight: 10, justifyContent: "center", alignItems: "center" },
  taskContent: { flex: 1, justifyContent: "center" },
  taskTitle: { color: "white", fontSize: 16, fontWeight: "500", fontFamily: "DM Sans", marginBottom: 6 },
  completedText: { textDecorationLine: "line-through", color: "#56577A", opacity: 0.5 },
  taskMetaRow: { flexDirection: "row", alignItems: "center" },
  catBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 8, alignSelf: "flex-start" },
  taskCategory: { fontFamily: "DM Sans", fontSize: 10, fontWeight: "500" },
  taskLabel: { fontFamily: "DM Sans", fontSize: 12, fontWeight: "500", color: "#56577A" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 100,
    paddingRight: 20,
  },
  menuCard: {
    backgroundColor: "#13141F",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1F2133",
    width: 260,
    overflow: "hidden",
  },
  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  menuAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1E2333",
    borderWidth: 1,
    borderColor: "#2A3050",
    justifyContent: "center",
    alignItems: "center",
  },
  menuAvatarText: { color: "#5B4FFF", fontWeight: "bold", fontSize: 16 },
  menuName: { color: "white", fontSize: 15, fontWeight: "600", fontFamily: "DM Sans" },
  menuEmail: { color: "#56577A", fontSize: 12, fontFamily: "DM Sans", marginTop: 2 },
  closeBtn: { padding: 4 },
  menuDivider: { height: 1, backgroundColor: "#1F2133", marginHorizontal: 0 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
  },
  menuItemTextDanger: { color: "#FF4D6A", fontSize: 14, fontWeight: "600", fontFamily: "DM Sans" },
});