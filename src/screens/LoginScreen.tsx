import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../utils/firebase";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      alert("Ошибка входа: " + error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.inner}>
        <View style={styles.logoSection}>
          <View style={styles.logoWrapper}>
            <Image
              source={require("../../assets/logo.png")}
              style={styles.logoIcon}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.eyebrow}>TASK MANAGER</Text>
          <Text style={styles.brandName}>DeepRoutine</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="anna@gmail.com"
            placeholderTextColor="#56577A"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#56577A"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={styles.linkText}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020206" },
  inner: { flex: 1, justifyContent: "center", padding: 30 },
  logoContainer: { alignItems: "center", marginBottom: 50 },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#6C5CE7",
    justifyContent: "center",
    alignItems: "center",
  },
  logoInner: {
    width: 20,
    height: 20,
    backgroundColor: "#6C5CE7",
    borderRadius: 10,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 60,
  },
  brandName: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 15,
    letterSpacing: 1,
    fontFamily: "Syne",
  },
  logoWrapper: {
    width: 64,
    height: 64,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  eyebrow: {
    color: '#56577A',
    fontSize: 12,
    letterSpacing: 3,
    fontFamily: "Syne",
    textTransform: "uppercase",
  },
  logoIcon: {
    width: "100%",
    height: "100%",
  },
  form: { width: "100%" },
  input: {
    backgroundColor: "#16172B",
    color: "white",
    padding: 18,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#1E1F35",
  },
  button: {
    backgroundColor: "#5B4FFF",
    padding: 18,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#4E4EFC",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  linkText: {
    color: "#6C5CE7",
    textAlign: "center",
    marginTop: 25,
    fontSize: 14,
  },
});
