import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import { Image, Pressable, Text, TextInput, View } from "react-native";
import { useColors } from "@/hooks/use-colors";

export const palette = {
  navy: "#12304A",
  blue: "#1677B7",
  cyan: "#2FA7C9",
  ink: "#12202D",
  muted: "#6B7B88",
  line: "#DDE7ED",
  soft: "#F3F7F9",
  green: "#168B65",
  amber: "#D98A17",
  red: "#B7424B",
  white: "#FFFFFF",
};

export function BrandHeader({ title, subtitle, onMenu }: { title: string; subtitle?: string; onMenu?: () => void }) {
  const colors = useColors();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Image source={require("@/assets/images/gestione-logo.png")} style={{ width: 38, height: 38, borderRadius: 10 }} resizeMode="contain" />
          <View>
            <Text style={{ color: colors.foreground, fontSize: 24, fontWeight: "800", letterSpacing: -0.5 }}>{title}</Text>
            {!!subtitle && <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>{subtitle}</Text>}
          </View>
        </View>
      </View>
      {onMenu && <Pressable onPress={onMenu} style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.65 }]}><MaterialIcons name="more-vert" size={23} color={colors.foreground} /></Pressable>}
    </View>
  );
}

export function SectionTitle({ title, action, onPress }: { title: string; action?: string; onPress?: () => void }) {
  const colors = useColors();
  return <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
    <Text style={{ color: colors.foreground, fontSize: 17, fontWeight: "800" }}>{title}</Text>
    {!!action && <Pressable onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.6 }}><Text style={{ color: palette.blue, fontSize: 13, fontWeight: "700" }}>{action}</Text></Pressable>}
  </View>;
}

export function StatCard({ icon, label, value, tint = palette.blue, onPress }: { icon: keyof typeof MaterialIcons.glyphMap; label: string; value: string | number; tint?: string; onPress?: () => void }) {
  const colors = useColors();
  return <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => [styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && { opacity: 0.72, transform: [{ scale: 0.98 }] }]}>
    <View style={[styles.statIcon, { backgroundColor: `${tint}18` }]}><MaterialIcons name={icon} size={20} color={tint} /></View>
    <Text style={{ color: colors.muted, fontSize: 12, marginTop: 12 }}>{label}</Text>
    <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 23, marginTop: 2 }}>{value}</Text>
  </Pressable>;
}

export function Pill({ label, tone = "blue" }: { label: string; tone?: "blue" | "green" | "amber" | "red" | "gray" }) {
  const tones = { blue: ["#E6F3FA", palette.blue], green: ["#E8F7F1", palette.green], amber: ["#FFF4DF", palette.amber], red: ["#FDEBEC", palette.red], gray: ["#EEF2F4", palette.muted] } as const;
  const [bg, fg] = tones[tone];
  return <View style={{ backgroundColor: bg, borderRadius: 7, paddingHorizontal: 8, paddingVertical: 4, alignSelf: "flex-start" }}><Text style={{ color: fg, fontSize: 11, fontWeight: "800" }}>{label}</Text></View>;
}

export function SearchBox({ value, onChangeText, placeholder = "Cerca..." }: { value: string; onChangeText: (value: string) => void; placeholder?: string }) {
  const colors = useColors();
  return <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border }]}><MaterialIcons name="search" size={21} color={colors.muted} /><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.muted} style={{ flex: 1, color: colors.foreground, fontSize: 15, paddingVertical: 10 }} returnKeyType="search" /></View>;
}

export function Field({ label, value, onChangeText, placeholder, keyboardType = "default", multiline = false }: { label: string; value: string; onChangeText: (value: string) => void; placeholder?: string; keyboardType?: "default" | "numeric" | "email-address" | "phone-pad"; multiline?: boolean }) {
  const colors = useColors();
  return <View style={{ marginBottom: 13 }}><Text style={{ color: colors.muted, fontSize: 12, fontWeight: "700", marginBottom: 6 }}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#9AAAB4" keyboardType={keyboardType} multiline={multiline} numberOfLines={multiline ? 3 : 1} style={[styles.input, { color: colors.foreground, backgroundColor: colors.surface, borderColor: colors.border }, multiline && { minHeight: 78, textAlignVertical: "top" }]} /></View>;
}

export function PrimaryButton({ label, icon, onPress, variant = "primary" }: { label: string; icon?: keyof typeof MaterialIcons.glyphMap; onPress: () => void; variant?: "primary" | "secondary" | "danger" }) {
  const backgroundColor = variant === "primary" ? palette.blue : variant === "danger" ? "#FDEBEC" : "#E9F3F8";
  const textColor = variant === "primary" ? palette.white : variant === "danger" ? palette.red : palette.blue;
  return <Pressable onPress={onPress} style={({ pressed }) => [{ backgroundColor, borderRadius: 12, minHeight: 48, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }, pressed && { opacity: 0.82, transform: [{ scale: 0.98 }] }]}>{icon && <MaterialIcons name={icon} size={19} color={textColor} />}<Text style={{ color: textColor, fontSize: 14, fontWeight: "800" }}>{label}</Text></Pressable>;
}

export function EmptyState({ icon, title, description }: { icon: keyof typeof MaterialIcons.glyphMap; title: string; description: string }) {
  const colors = useColors();
  return <View style={{ alignItems: "center", padding: 32 }}><MaterialIcons name={icon} size={40} color={colors.muted} /><Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "800", marginTop: 12 }}>{title}</Text><Text style={{ color: colors.muted, fontSize: 13, textAlign: "center", marginTop: 6, lineHeight: 19 }}>{description}</Text></View>;
}

export const styles = {
  iconButton: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#EAF2F6", alignItems: "center" as const, justifyContent: "center" as const },
  statCard: { width: "48%" as const, borderRadius: 16, padding: 14, borderWidth: 1, marginBottom: 12 },
  statIcon: { width: 36, height: 36, borderRadius: 11, alignItems: "center" as const, justifyContent: "center" as const },
  search: { borderWidth: 1, borderRadius: 13, minHeight: 45, paddingHorizontal: 13, flexDirection: "row" as const, alignItems: "center" as const, gap: 8 },
  input: { borderWidth: 1, borderRadius: 11, minHeight: 46, paddingHorizontal: 12, fontSize: 15 },
};
