import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, ScrollView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { ChevronLeft } from 'lucide-react-native';

export default function RegisterScreen({ navigation }: any) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      alert("Пароли не совпадают");
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      alert("Ошибка регистрации: " + error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollInner}>
          {/* Кнопка назад */}
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft color="#6C5CE7" size={28} />
          </TouchableOpacity>

          <Text style={styles.title}>Create Account</Text>

          <View style={styles.form}>
            <View style={styles.row}>
              <TextInput 
                style={[styles.input, { flex: 1, marginRight: 10 }]}
                placeholder="First name"
                placeholderTextColor="#56577A"
                value={firstName}
                onChangeText={setFirstName}
              />
              <TextInput 
                style={[styles.input, { flex: 1 }]}
                placeholder="Last name"
                placeholderTextColor="#56577A"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>

            <TextInput 
              style={styles.input}
              placeholder="anna@gmail.com"
              placeholderTextColor="#56577A"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <TextInput 
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#56577A"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TextInput 
              style={styles.input}
              placeholder="Confirm password"
              placeholderTextColor="#56577A"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            {/* Имитация выбора Time Zone как на макете */}
            <View style={styles.timeZoneBox}>
              <Text style={styles.timeZoneLabel}>Time zone</Text>
              <Text style={styles.timeZoneValue}>UTC+02:00 Kyiv</Text>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>Create Account</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => navigation.navigate('Login')}
              style={styles.footerLink}
            >
              <Text style={styles.linkText}>
                Already have an account? <Text style={{ color: '#6C5CE7' }}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020206' },
  scrollInner: { padding: 30, paddingTop: 60 },
  backButton: { marginBottom: 20, marginLeft: -10 },
  title: { 
    color: 'white', fontSize: 28, fontWeight: 'bold', 
    marginBottom: 40, textAlign: 'center' 
  },
  form: { width: '100%' },
  row: { flexDirection: 'row', marginBottom: 5 },
  input: { 
    backgroundColor: '#16172B', color: 'white', padding: 18, 
    borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: '#1E1F35' 
  },
  timeZoneBox: {
    backgroundColor: '#16172B', padding: 15, borderRadius: 15,
    borderWidth: 1, borderColor: '#1E1F35', marginBottom: 25
  },
  timeZoneLabel: { color: '#56577A', fontSize: 12, marginBottom: 5 },
  timeZoneValue: { color: 'white', fontSize: 14 },
  button: { 
    backgroundColor: '#4E4EFC', padding: 18, borderRadius: 15, 
    alignItems: 'center', shadowColor: '#4E4EFC', 
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 
  },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  footerLink: { marginTop: 25 },
  linkText: { color: '#56577A', textAlign: 'center', fontSize: 14 }
});