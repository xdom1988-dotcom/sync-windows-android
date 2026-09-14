import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { BrandHeader, SectionTitle, StatCard, Pill, palette } from "@/components/gestionale-ui";
import { useGestionale } from "@/lib/gestionale-context";
import { useColors } from "@/hooks/use-colors";

const euro = (value: number) => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(value);

export default function HomeScreen() {
  const colors = useColors();
  const { clients, documents, movements, companies, hydrated } = useGestionale();
  const company = companies[0];
  const totals = useMemo(() => ({
    income: movements.filter((m) => m.direzione === "entrata").reduce((sum, m) => sum + Number(m.importo || 0), 0),
    expenses: movements.filter((m) => m.direzione === "uscita").reduce((sum, m) => sum + Number(m.importo || 0), 0),
  }), [movements]);
  const recent = documents.slice(0, 4);
  const today = new Intl.DateTimeFormat("it-IT", { weekday: "long", day: "numeric", month: "long" }).format(new Date());

  return <ScreenContainer className="px-5 pt-5" edges={["top", "left", "right"]}>
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
      <BrandHeader title="Gestione Aziendale" subtitle={today.charAt(0).toUpperCase() + today.slice(1)} onMenu={() => router.push("/settings")} />
      <View style={{ backgroundColor: palette.navy, borderRadius: 20, padding: 18, overflow: "hidden", marginBottom: 20 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ flex: 1, paddingRight: 12 }}><Text style={{ color: "#A9D8E7", fontSize: 12, fontWeight: "700", letterSpacing: 0.5 }}>AZIENDA ATTIVA</Text><Text style={{ color: "white", fontSize: 20, fontWeight: "800", marginTop: 6 }} numberOfLines={2}>{company?.denominazione || "La tua azienda"}</Text><Text style={{ color: "#C7D9E5", fontSize: 12, marginTop: 5 }}>{company?.citta || "Configura i dati aziendali"}{company?.partita_iva ? ` · P.IVA ${company.partita_iva}` : ""}</Text></View>
          <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: "#2C7896", alignItems: "center", justifyContent: "center" }}><Image source={require("@/assets/images/gestione-logo.png")} style={{ width: 38, height: 38 }} resizeMode="contain" /></View>
        </View>
        <Pressable onPress={() => router.push("/settings")} style={({ pressed }) => [{ marginTop: 18, alignSelf: "flex-start", flexDirection: "row", gap: 5, alignItems: "center" }, pressed && { opacity: 0.7 }]}><Text style={{ color: "#8ED9EA", fontWeight: "800", fontSize: 13 }}>Gestisci azienda</Text><MaterialIcons name="arrow-forward" size={16} color="#8ED9EA" /></Pressable>
      </View>

      <SectionTitle title="Panoramica" />
      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
        <StatCard icon="people-alt" label="Clienti e fornitori" value={hydrated ? clients.length : "…"} tint={palette.blue} onPress={() => router.push("/clients")} />
        <StatCard icon="description" label="Documenti archiviati" value={hydrated ? documents.length : "…"} tint={palette.cyan} onPress={() => router.push("/documents")} />
        <StatCard icon="trending-up" label="Entrate registrate" value={euro(totals.income)} tint={palette.green} onPress={() => router.push("/finance")} />
        <StatCard icon="account-balance-wallet" label="Saldo movimenti" value={euro(totals.income - totals.expenses)} tint={palette.amber} onPress={() => router.push("/finance")} />
      </View>

      <SectionTitle title="Azioni rapide" />
      <View style={{ flexDirection: "row", gap: 10, marginBottom: 22 }}>
        <QuickAction icon="person-add-alt-1" label="Nuovo cliente" color={palette.blue} onPress={() => router.push("/clients?new=1")} />
        <QuickAction icon="note-add" label="Nuovo documento" color={palette.cyan} onPress={() => router.push("/documents?new=1")} />
        <QuickAction icon="add-card" label="Registra incasso" color={palette.green} onPress={() => router.push("/finance?new=1")} />
      </View>

      <SectionTitle title="Attività recente" action="Vedi tutto" onPress={() => router.push("/documents")} />
      <View style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 16, overflow: "hidden" }}>
        {recent.length === 0 ? <Text style={{ padding: 18, color: colors.muted }}>Nessun documento presente.</Text> : recent.map((doc, index) => <Pressable key={`${doc.id}-${index}`} onPress={() => router.push("/documents")} style={({ pressed }) => [{ padding: 14, flexDirection: "row", alignItems: "center", borderBottomWidth: index === recent.length - 1 ? 0 : 1, borderBottomColor: colors.border }, pressed && { opacity: 0.7 }]}>
          <View style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: "#EAF4F8", alignItems: "center", justifyContent: "center", marginRight: 11 }}><MaterialIcons name="description" size={19} color={palette.blue} /></View>
          <View style={{ flex: 1 }}><Text style={{ color: colors.foreground, fontWeight: "700", fontSize: 14 }} numberOfLines={1}>{doc.tipo} n. {doc.numero}</Text><Text style={{ color: colors.muted, fontSize: 12, marginTop: 3 }} numberOfLines={1}>{doc.cliente} · {doc.data}</Text></View>
          <Pill label={doc.stato || "archiviato"} tone={doc.stato?.includes("incass") ? "amber" : "green"} />
        </Pressable>)}
      </View>
    </ScrollView>
  </ScreenContainer>;
}

function QuickAction({ icon, label, color, onPress }: { icon: keyof typeof MaterialIcons.glyphMap; label: string; color: string; onPress: () => void }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [{ flex: 1, borderRadius: 14, padding: 12, backgroundColor: `${color}12`, borderWidth: 1, borderColor: `${color}30`, alignItems: "center", minHeight: 84 }, pressed && { opacity: 0.72, transform: [{ scale: 0.97 }] }]}><MaterialIcons name={icon} size={22} color={color} /><Text style={{ color: color, fontSize: 11, fontWeight: "800", textAlign: "center", marginTop: 8 }}>{label}</Text></Pressable>;
}
