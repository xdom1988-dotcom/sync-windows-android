import * as SecureStore from "expo-secure-store";
const url = "https://pmkxyqcfskpjklvxlbvg.supabase.co";
const key = "sb_publishable_b1c7USyiinDKs-14d3a_qA_8YdTM73u";
const tokenKey = "gestionale-windows-cloud-token";
type Values = Record<string, unknown>;
const object=(v:unknown):Values=>v&&typeof v==="object"&&!Array.isArray(v)?v as Values:{};
const parse=(v:unknown):Values=>{if(typeof v!=="string")return object(v);try{return object(JSON.parse(v));}catch{return {}}};
const text=(v:unknown)=>String(v??"").trim();
const amount=(v:unknown)=>Number(text(v).replace(/[€.\s]/g,"").replace(",","."))||0;
const type=(v:unknown)=>{const s=text(v)||"Ordine",n=s.toLowerCase().replace(/[ .-]/g,"");return n==="proforma"?"Proforma":n==="notadicredito"?"Nota di Credito":s};
const iso=(v:unknown)=>{const s=text(v),m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);return /^\d{4}-\d{2}-\d{2}$/.test(s)?s:m?m[3]+"-"+m[2].padStart(2,"0")+"-"+m[1].padStart(2,"0"):new Date().toISOString().slice(0,10)};
async function auth(){const t=await SecureStore.getItemAsync(tokenKey);if(!t)throw new Error("Accedi al cloud Windows dalle Impostazioni.");return t}
async function request(path:string,init:RequestInit={}){const t=await auth(),r=await fetch(url+path,{...init,headers:{apikey:key,Authorization:"Bearer "+t,"Content-Type":"application/json",...(init.headers||{})}}),body=await r.json().catch(()=>({}));if(!r.ok)throw new Error(body.message||"Errore cloud");return body}
export async function loginWindowsCloud(email:string,password:string){const r=await fetch(url+"/auth/v1/token?grant_type=password",{method:"POST",headers:{apikey:key,"Content-Type":"application/json"},body:JSON.stringify({email,password})}),data=await r.json();if(!r.ok||!data.access_token)throw new Error(data.error_description||"Accesso cloud non riuscito");await SecureStore.setItemAsync(tokenKey,data.access_token)}
export async function isWindowsCloudConnected(){return Boolean(await SecureStore.getItemAsync(tokenKey))}
export async function pullWindowsDocuments(){const rows=await request("/rest/v1/documenti?select=*,righe_documento(*)&order=data_documento.desc") as any[];return rows.map((raw,i)=>{const outer=parse(raw.dati),note=parse(outer.note),data=Object.keys(note).length?{...outer,...note}:outer,destination=object(raw.destinazione),lines=Array.isArray(raw.righe_documento)&&raw.righe_documento.length?raw.righe_documento:Array.isArray(data.righe)?data.righe:[];return {id:-1000000-i,cloudId:raw.id,cloudCompanyId:raw.azienda_id,cloudClientId:raw.cliente_id,tipo:type(raw.tipo||data.tipo),numero:raw.numero??amount(data.numero),data:iso(raw.data_documento||data.data),cliente:text(raw.cliente_nome||data.cliente)||"Cliente non indicato",stato:text(raw.stato||data.stato),righe:lines.map((line:any,n:number)=>({id:raw.id+"-"+n,descrizione:text(line.descrizione)||"Riga documento",quantita:amount(line.quantita)||1,prezzo:amount(line.prezzo),sconto:amount(line.sconto),iva:amount(line.iva||line.iva_natura)})),pagamento:text(data.pagamento),scadenza:text(data.scadenza),riferimento:text(data.riferimento),origineTipo:text(data.origine_tipo),origineNumero:data.origine_numero as any,causale:text(data.causale),vettore:text(data.corriere||data.vettore),colli:text(data.colli),porto:text(data.porto),commento:text(data.note_documento),destinatario:{nome:text(data.destinatario_nome||raw.cliente_nome)||"Cliente",indirizzo:text(data.destinatario)},destinazione:{nome:text(destination.nome||data.destinazione_nome)||"Destinazione",indirizzo:text(destination.indirizzo||data.destinazione)}}})}

export async function saveWindowsDocument(document: any) {
  const profiles = await request("/rest/v1/profili?select=azienda_id&limit=1") as any[];
  const azienda = document.cloudCompanyId || profiles[0]?.azienda_id;
  if (!azienda) throw new Error("Utente non associato all'azienda Windows.");
  const lines = document.righe || [];
  const total = lines.reduce((sum: number, line: any) => sum + Number(line.quantita || 0) * Number(line.prezzo || 0) * (1 - Number(line.sconto || 0) / 100) * (1 + Number(line.iva || 0) / 100), 0);
  const payload = { azienda_id: azienda, cliente_id: document.cloudClientId || null, tipo: type(document.tipo), numero: Math.max(1, Math.trunc(amount(document.numero))), anno: Number(iso(document.data).slice(0,4)), data_documento: iso(document.data), cliente_nome: document.cliente, stato: document.stato || "bozza", destinazione: document.destinazione || {}, dati: { note: JSON.stringify({ ...document, righe: lines.map(({ id, ...line }: any) => line) }) }, totale: total };
  const saved = (document.cloudId ? await request("/rest/v1/documenti?id=eq." + encodeURIComponent(document.cloudId), { method:"PATCH", headers:{Prefer:"return=representation"}, body:JSON.stringify(payload) }) : await request("/rest/v1/documenti", { method:"POST", headers:{Prefer:"return=representation"}, body:JSON.stringify(payload) }))[0];
  if (!saved?.id) throw new Error("Il cloud non ha confermato il salvataggio.");
  return { ...document, cloudId:saved.id, cloudCompanyId:azienda };
}
export async function deleteWindowsDocument(id?: string) { if (id) await request("/rest/v1/documenti?id=eq." + encodeURIComponent(id), { method:"DELETE" }); }
