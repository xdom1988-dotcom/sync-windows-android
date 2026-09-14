import "@/global.css";
import "react-native-reanimated";
import "@/lib/_core/nativewind-pressable";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "@/lib/theme-provider";
import { GestionaleProvider } from "@/lib/gestionale-context";
import { createTRPCClient, trpc } from "@/lib/trpc";

export const unstable_settings = { anchor: "(tabs)" };
export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } } }));
  const [trpcClient] = useState(() => createTRPCClient());
  return <ThemeProvider><SafeAreaProvider><GestionaleProvider><GestureHandlerRootView style={{ flex: 1 }}><trpc.Provider client={trpcClient} queryClient={queryClient}><QueryClientProvider client={queryClient}><Stack screenOptions={{ headerShown: false }} /><StatusBar style="auto" /></QueryClientProvider></trpc.Provider></GestureHandlerRootView></GestionaleProvider></SafeAreaProvider></ThemeProvider>;
}
