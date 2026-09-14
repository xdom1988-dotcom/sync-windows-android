import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform } from "react-native";
import { HapticTab } from "@/components/haptic-tab";
import { useColors } from "@/hooks/use-colors";

type TabIconProps = { name: keyof typeof MaterialIcons.glyphMap; color: string };
function TabIcon({ name, color }: TabIconProps) { return <MaterialIcons size={24} name={name} color={color} />; }

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.tint, tabBarInactiveTintColor: colors.muted, tabBarButton: HapticTab, tabBarStyle: { paddingTop: 8, paddingBottom: bottomPadding, height: 56 + bottomPadding, backgroundColor: colors.background, borderTopColor: colors.border, borderTopWidth: 0.5 } }}>
    <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color }) => <TabIcon name="home" color={color} /> }} />
    <Tabs.Screen name="clients" options={{ title: "Clienti", tabBarIcon: ({ color }) => <TabIcon name="people-alt" color={color} /> }} />
    <Tabs.Screen name="documents" options={{ title: "Documenti", tabBarIcon: ({ color }) => <TabIcon name="description" color={color} /> }} />
    <Tabs.Screen name="finance" options={{ title: "Finanza", tabBarIcon: ({ color }) => <TabIcon name="account-balance-wallet" color={color} /> }} />
  </Tabs>;
}
