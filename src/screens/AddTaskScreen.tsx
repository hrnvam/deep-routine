import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Modal,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { X, Calendar as CalendarIcon, Clock } from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  addDoc,
  collection,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../utils/firebase";
import { categoryColors, priorityColors } from "../constants/Colors";

export default function AddTaskScreen({ navigation, route }: any) {
  const editTask = route.params?.task;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Work");
  const [priority, setPriority] = useState("Medium");
  const [date, setDate] = useState(new Date());

  const [showPicker, setShowPicker] = useState<"date" | "time" | null>(null);
  const [isTitleFocused, setIsTitleFocused] = useState(false);
  const [isDescFocused, setIsDescFocused] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (editTask) {
        setTitle(editTask.title || "");
        setDescription(editTask.description || "");
        setCategory(editTask.category || "Work");
        setPriority(editTask.priority || "Medium");
        setDate(editTask.dueDate ? new Date(editTask.dueDate) : new Date());
      } else {
        setTitle("");
        setDescription("");
        setCategory("Work");
        setPriority("Medium");
        setDate(new Date());
      }
      return () => {
        navigation.setParams({ task: undefined });
      };
    }, [editTask, navigation])
  );

  const handleSave = async () => {
    if (!title) return;
    const taskData = {
      title,
      description,
      category,
      priority,
      dueDate: date.getTime(),
      dateString: date.toISOString().split("T")[0],
      userId: auth.currentUser?.uid,
      updatedAt: serverTimestamp(),
    };

    try {
      if (editTask) {
        await updateDoc(doc(db, "tasks", editTask.id), taskData);
      } else {
        await addDoc(collection(db, "tasks"), {
          ...taskData,
          completed: false,
          createdAt: serverTimestamp(),
        });
      }
      navigation.navigate("Tasks");
    } catch (e) {
      console.log(e);
    }
  };

  const onChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowPicker(null);
    }
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {editTask ? "Edit Task" : "New Task"}
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.closeBtn}
        >
          <X color="#56577A" size={24} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.label}>Task name</Text>
          <TextInput
            style={[styles.input, isTitleFocused && styles.inputActive]}
            value={title}
            onChangeText={setTitle}
            onFocus={() => setIsTitleFocused(true)}
            onBlur={() => setIsTitleFocused(false)}
            placeholder="What needs to be done?"
            placeholderTextColor="#56577A"
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[
              styles.input,
              { height: 90, textAlignVertical: "top" },
              isDescFocused && styles.inputActive,
            ]}
            value={description}
            onChangeText={setDescription}
            onFocus={() => setIsDescFocused(true)}
            onBlur={() => setIsDescFocused(false)}
            placeholder="Add details..."
            placeholderTextColor="#56577A"
            multiline
          />

          <Text style={styles.label}>Category</Text>
          <View style={styles.chipRow}>
            {Object.keys(categoryColors).map((cat) => {
              if (cat === "All") return null;
              const isActive = category === cat;
              const catColor = (categoryColors as any)[cat];
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[
                    styles.chip,
                    isActive && {
                      backgroundColor: catColor,
                      borderColor: catColor,
                    },
                  ]}
                >
                  <Text
                    style={[styles.chipText, isActive && styles.chipTextActive]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Priority</Text>
          <View style={styles.chipRow}>
            {["High", "Medium", "Low"].map((pLabel) => {
              const pColor = (priorityColors as any)[pLabel];
              return (
                <TouchableOpacity
                  key={pLabel}
                  onPress={() => setPriority(pLabel)}
                  style={[
                    styles.priorityChip,
                    priority === pLabel && {
                      backgroundColor: `${pColor}20`,
                      borderColor: pColor,
                    },
                  ]}
                >
                  <View style={[styles.dot, { backgroundColor: pColor }]} />
                  <Text
                    style={[
                      styles.chipText,
                      priority === pLabel && {
                        color: pColor,
                        fontWeight: "bold",
                      },
                    ]}
                  >
                    {pLabel}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Due date & Time</Text>
          <View style={styles.dateTimeRow}>
            <TouchableOpacity
              style={styles.inputRow}
              onPress={() => setShowPicker("date")}
            >
              <Text style={styles.dateTimeText}>
                {date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </Text>
              <CalendarIcon size={18} color="#56577A" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.inputRow}
              onPress={() => setShowPicker("time")}
            >
              <Text style={styles.dateTimeText}>
                {date.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
              <Clock size={18} color="#56577A" />
            </TouchableOpacity>
          </View>

          {/* МОДАЛЬНОЕ ОКНО ДЛЯ iOS И ОБЫЧНЫЙ ПИКЕР ДЛЯ ANDROID */}
          {Platform.OS === "ios" ? (
            <Modal
              visible={!!showPicker}
              transparent={true}
              animationType="slide"
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={() => setShowPicker(null)}>
                      <Text style={styles.doneBtnText}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={date}
                    mode={showPicker || "date"}
                    is24Hour={true}
                    display="spinner"
                    onChange={onChange}
                    textColor="white"
                  />
                </View>
              </View>
            </Modal>
          ) : (
            showPicker && (
              <DateTimePicker
                value={date}
                mode={showPicker}
                is24Hour={true}
                display="default"
                onChange={onChange}
              />
            )
          )}

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>
              {editTask ? "Update Task" : "Create Task"}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020206" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 25,
    paddingTop: 15,
    paddingBottom: 10,
    alignItems: "center",
  },
  headerTitle: { color: "white", fontSize: 24, fontWeight: "bold" },
  closeBtn: { backgroundColor: "#1E2333", padding: 10, borderRadius: 12 },

  scrollContent: { paddingHorizontal: 25, paddingBottom: 20 },

  label: {
    fontSize: 10,
    letterSpacing: 0.3,
    color: "#56577A",
    marginBottom: 8,
    marginTop: 20,
    textTransform: "uppercase",
  },

  input: {
    backgroundColor: "#1E2333",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "white",
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#2A3050",
  },
  inputActive: {
    borderColor: "#5B4FFF",
  },

  dateTimeRow: { flexDirection: "row", gap: 12 },
  inputRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1E2333",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#2A3050",
  },
  dateTimeText: { color: "white", fontSize: 14 },

  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#1E2333",
    borderWidth: 1,
    borderColor: "#2A3050",
  },
  chipText: { color: "#56577A", fontSize: 13, fontWeight: "500" },
  chipTextActive: { color: "white", fontWeight: "bold" },

  priorityChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#1E2333",
    borderWidth: 1,
    borderColor: "#2A3050",
    gap: 8,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },

  saveBtn: {
    backgroundColor: "#5B4FFF",
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 40,
    alignItems: "center",
  },
  saveBtnText: { color: "white", fontWeight: "bold", fontSize: 16 },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalContent: {
    backgroundColor: "#1E2333",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    paddingTop: 8,
    width: "100%",
    alignItems: "center",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2A3050",
    width: "100%",
  },
  doneBtnText: {
    color: "#5B4FFF",
    fontSize: 17,
    fontWeight: "700",
  },
});
