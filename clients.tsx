import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useLocalSearchParams, router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { BrandHeader, EmptyState, Field, Pill, PrimaryButton, SearchBox, SectionTitle, palette } from "@/components/gestionale-ui";
import { Client, useGestionale } from "@/lib/gestionale-context";
import { useColors } from "@/hooks/use-colors";

const blank = { denominazione: "", partita_iva: "", codice_fiscale: "", indirizzo: "", cap: "", citta: "", provincia: "", telefono: "", email: "", pec: "", note: "" };

export default function ClientsScreen() {
  const colors = useColors();
  const params = useLocalSearchParams<{ new?: string }>();
  const { clients, addClient, updateClient, removeClient } = useGestionale();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"all" | "clienti" | "fornitori">("all");
  const [selected, setSelected] = useState<Client | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(blank);

  useEffect(() => { if (params.new === "1") openForm(); }, [params.new]);
  const filtered = useMemo(() => clients.filter((client) => {
    const haystack = [client.denominazione, client.ragione_sociale, client.partita_iva, client.citta, client.email].join(" ").toLowerCase();
    const matchesQuery = haystack.includes(query.toLowerCase());
    const matchesMode = mode === "all" || (mode === "clienti" ? client.is_cliente !== 0 : client.is_fornitore === 1);
    return matchesQuery && matchesMode;
  }), [clients, query, mode]);

  function openForm(client?: Client) {
    setSelected(client || null);
    setForm(client ? { ...blank, denominazione: client.denominazione || client.ragione_sociale || "", partita_iva: client.partita_iva || "", codice_fiscale: client.codice_fiscale || "", indirizzo: client.indirizzo || "", cap: client.cap || "", citta: client.citta || "", provincia: client.provincia || "", telefono: client.telefono || client.cellulare || "", email: client.email || "", pec: client.pec || "", note: client.note || "" } : blank);
    setFormOpen(true);
  }
  async function save() {
    if (!form.denominazione.trim()) { Alert.alert("Dati mancanti", "Inserisci la denominazione del cliente."); return; }
    if (selected) await updateClient(selected.id, form);
    else await addClient({ ...form, is_cliente: 1, is_fornitore: 0 });
    setFormOpen(false);
  }
  function askRemove(client: Client) { Alert.alert("Elimina anagrafica", `Vuoi eliminare ${client.denominazione}?`, [{ text: "Annulla", style: "cancel" }, { text: "Elimina", style: "destructive", onPress: () => removeClient(client.id) }]); }

  return <ScreenContainer className="px-5 pt-5" edges={["top", "left", "right"]}>
    <BrandHeader title="Anagrafiche" subtitle={`${clients.length} record importati`} onMenu={() => router.push("/settings")} />
    <View style={{ flexDirection: "row", gap: 9, marginBottom: 12 }}><View style={{ flex: 1 }}><SearchBox value={query} onChangeText={setQuery} placeholder="Cerca per nome, P.IVA, città..." /></View><Pressable onPress={() => openForm()} style={({ pressed }) => [{ width: 46, height: 46, borderRadius: 13, backgroundColor: palette.blue, alignItems: "center", justifyContent: "center" }, pressed && { opacity: 0.75 }]}><MaterialIcons name="person-add-alt-1" size={21} color="white" /></Pressable></View>
    <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}><Filter label="Tutti" active={mode === "all"} onPress={() => setMode("all")} /><Filter label="Clienti" active={mode === "clienti"} onPress={() => setMode("clienti")} /><Filter label="Fornitori" active={mode === "fornitori"} onPress={() => setMode("fornitori")} /></View>
    <SectionTitle title={`${filtered.length} risultati`} action="Nuovo" onPress={() => openForm()} />
    <FlatList data={filtered} keyExtractor={(item) => String(item.id)} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }} ListEmptyComponent={<EmptyState icon="people-outline" title="Nessuna anagrafica" description="Modifica la ricerca o aggiungi il primo cliente." />} renderItem={({ item }) => <ClientRow client={item} onPress={() => openForm(item)} onRemove={() => askRemove(item)} />} />

    <Modal visible={formOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setFormOpen(false)}><ScreenContainer className="px-5 pt-5" edges={["top", "bottom", "left", "right"]}><View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}><Text style={{ color: colors.foreground, fontSize: 22, fontWeight: "800" }}>{selected ? "Modifica anagrafica" : "Nuovo cliente"}</Text><Pressable onPress={() => setFormOpen(false)}><MaterialIcons name="close" size={25} color={colors.muted} /></Pressable></View><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}><Field label="Denominazione *" value={form.denominazione} onChangeText={(v) => setForm({ ...form, denominazione: v })} placeholder="Ragione sociale o nome" /><Field label="Partita IVA" value={form.partita_iva} onChangeText={(v) => setForm({ ...form, partita_iva: v })} keyboardType="default" /><Field label="Codice fiscale" value={form.codice_fiscale} onChangeText={(v) => setForm({ ...form, codice_fiscale: v.toUpperCase() })} /><Field label="Indirizzo" value={form.indirizzo} onChangeText={(v) => setForm({ ...form, indirizzo: v })} /><View style={{ flexDirection: "row", gap: 10 }}><View style={{ flex: 0.35 }}><Field label="CAP" value={form.cap} onChangeText={(v) => setForm({ ...form, cap: v })} keyboardType="numeric" /></View><View style={{ flex: 0.65 }}><Field label="Città" value={form.citta} onChangeText={(v) => setForm({ ...form, citta: v })} /></View></View><View style={{ flexDirection: "row", gap: 10 }}><View style={{ flex: 1 }}><Field label="Telefono" value={form.telefono} onChangeText={(v) => setForm({ ...form, telefono: v })} keyboardType="phone-pad" /></View><View style={{ flex: 1 }}><Field label="Email" value={form.email} onChangeText={(v) => setForm({ ...form, email: v })} keyboardType="email-address" /></View></View><Field label="PEC" value={form.pec} onChangeText={(v) => setForm({ ...form, pec: v })} keyboardType="email-address" /><Field label="Note" value={form.note} onChangeText={(v) => setForm({ ...form, note: v })} multiline /><PrimaryButton label={selected ? "Salva modifiche" : "Salva anagrafica"} icon="save" onPress={save} /></ScrollView></ScreenContainer></Modal>
  </ScreenContainer>;
}

function Filter({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) { return <Pressable onPress={onPress} style={({ pressed }) => [{ borderRadius: 9, paddingHorizontal: 13, paddingVertical: 8, backgroundColor: active ? palette.blue : "#EAF1F4" }, pressed && { opacity: 0.75 }]}><Text style={{ color: active ? "white" : palette.muted, fontSize: 12, fontWeight: "800" }}>{label}</Text></Pressable>; }
function ClientRow({ client, onPress, onRemove }: { client: Client; onPress: () => void; onRemove: () => void }) { const colors = useColors(); return <Pressable onPress={onPress} style={({ pressed }) => [{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 15, padding: 14, marginBottom: 9, flexDirection: "row", alignItems: "center" }, pressed && { opacity: 0.72 }]}><View style={{ width: 43, height: 43, borderRadius: 14, backgroundColor: "#E5F2F7", alignItems: "center", justifyContent: "center", marginRight: 12 }}><Text style={{ color: palette.blue, fontSize: 16, fontWeight: "800" }}>{(client.denominazione || "?").slice(0, 1).toUpperCase()}</Text></View><View style={{ flex: 1 }}><Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 14 }} numberOfLines={1}>{client.denominazione}</Text><Text style={{ color: colors.muted, fontSize: 12, marginTop: 4 }} numberOfLines={1}>{[client.citta, client.partita_iva].filter(Boolean).join(" · ") || "Dati non indicati"}</Text><View style={{ flexDirection: "row", gap: 6, marginTop: 6 }}><Pill label={client.is_fornitore === 1 ? "Fornitore" : "Cliente"} tone={client.is_fornitore === 1 ? "amber" : "blue"} />{client.pec ? <Pill label="PEC" tone="green" /> : null}</View></View><Pressable onPress={onRemove} hitSlop={8} style={({ pressed }) => [pressed && { opacity: 0.5 }]}><MaterialIcons name="more-vert" size={21} color={colors.muted} /></Pressable></Pressable>; }
