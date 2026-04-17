import React, { useState, useEffect, useCallback } from "react";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Syne_800ExtraBold } from "@expo-google-fonts/syne";
import {
  View,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from "react-native";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  LayoutGrid,
  Calendar,
  CheckCircle2,
  Plus,
  Star,
} from "lucide-react-native";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./src/utils/firebase";

import { AppColors } from "./src/constants/Colors";
import HomeScreen from "./src/screens/HomeScreen";
import CalendarScreen from "./src/screens/CalendarScreen";
import TasksScreen from "./src/screens/TasksScreen";
import { AIAnalysisScreen } from "./src/screens/AIAnalysisScreen";
import AddTaskScreen from "./src/screens/AddTaskScreen";
import AuthNavigator from "./src/navigation/AuthNavigator";

SplashScreen.preventAutoHideAsync();
const Tab = createBottomTabNavigator();

const MyTheme = {
  ...DarkTheme,
  dark: true,
  colors: {
    ...DarkTheme.colors,
    primary: AppColors.primary,
    background: AppColors.background,
    card: AppColors.card,
    text: AppColors.text,
    border: AppColors.border,
    notification: AppColors.accent,
  },
};

const CustomTabBarButton = ({ children, onPress }: any) => (
  <TouchableOpacity
    style={styles.customButtonContainer}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={styles.customButtonView}>{children}</View>
  </TouchableOpacity>
);

const TAB_BAR_HEIGHT = 64;

const MainNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: AppColors.primary,
        tabBarInactiveTintColor: AppColors.textDim,

        tabBarStyle: {
          backgroundColor: AppColors.card,
          borderTopWidth: 0,
          position: "absolute",
          bottom: insets.bottom + 10,
          left: 20,
          right: 20,
          borderRadius: 25,
          height: TAB_BAR_HEIGHT,
          elevation: 0,
          paddingBottom: 0,
          paddingTop: 0,
        },

        tabBarItemStyle: {
          height: TAB_BAR_HEIGHT,
          justifyContent: "center",
          alignItems: "center",
          paddingTop: 0,
          paddingBottom: 0,
          marginTop: 0,
          marginBottom: 0,
        },

        tabBarIconStyle: {
          marginTop: 0,
          marginBottom: 0,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => <LayoutGrid color={color} size={24} />,
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarIcon: ({ color }) => <Calendar color={color} size={24} />,
        }}
      />

      <Tab.Screen
        name="AddTask"
        component={AddTaskScreen}
        options={{
          tabBarIcon: () => <Plus color="white" size={28} />,
          tabBarButton: (props) => <CustomTabBarButton {...props} />,
        }}
      />

      <Tab.Screen
        name="Tasks"
        component={TasksScreen}
        options={{
          tabBarIcon: ({ color }) => <CheckCircle2 color={color} size={24} />,
        }}
      />
      <Tab.Screen
        name="AIAnalysis"
        component={AIAnalysisScreen}
        options={{
          tabBarIcon: ({ color }) => <Star color={color} size={24} />,
        }}
      />
    </Tab.Navigator>
  );
};

export default function App() {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    "DM Sans": DMSans_500Medium,
    "DM Sans Bold": DMSans_700Bold,
    "DM Sans Regular": DMSans_400Regular,
    Syne: Syne_800ExtraBold,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) setUser({ email: firebaseUser.email || "" });
      else setUser(null);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <NavigationContainer theme={MyTheme}>
        {user ? <MainNavigator /> : <AuthNavigator />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: AppColors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  customButtonContainer: {
    top: -20,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  customButtonView: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: AppColors.primary,
    borderWidth: 4,
    borderColor: AppColors.background,
    justifyContent: "center",
    alignItems: "center",
  },
});