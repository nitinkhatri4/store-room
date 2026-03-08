import { useEffect } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, ActivityIndicator } from "react-native";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    AsyncStorage.getItem("token").then((token) => {
      SplashScreen.hideAsync(); // hide immediately
      if (token) {
        router.replace("/home");
      } else {
        router.replace("/login");
      }
    });
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#080909",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ActivityIndicator color="#f0f0f0" />
    </View>
  );
}
