"""Sincronizzazione Gestione Aziendale Windows <-> cloud Android.

Uso:
  python sync_gestionale.py --server https://... --key DOMINIK_MAGIC_03636480828 --db ../gestionale.db push
  python sync_gestionale.py --server https://... --key DOMINIK_MAGIC_03636480828 --db ../gestionale.db pull --out cloud_snapshot.json

Il comando pull non sovrascrive il database: salva un JSON di sicurezza da verificare.
"""
import argparse, json, sqlite3, time, urllib.parse, urllib.request
from pathlib import Path


def rows(conn, table):
    try:
        conn.row_factory = sqlite3.Row
        return [dict(row) for row in conn.execute(f'SELECT * FROM "{table}"')]
    except sqlite3.Error:
        return []


def build_payload(db_path):
    conn = sqlite3.connect(db_path)
    documents = rows(conn, "documenti")
    documents += [{"id": int(d.get("id", 0)) + 100000, "tipo": "DDT", "data": d.get("data_inizio_trasporto") or "", "numero": d.get("num_doc") or d.get("id"), "cliente": d.get("cliente") or "", "stato": "archiviato", "commento": d.get("causale") or ""} for d in rows(conn, "ddt")]
    documents += [{"id": int(f.get("id", 0)) + 200000, "tipo": "Fattura", "data": "", "numero": f.get("num_doc") or f.get("id"), "cliente": f.get("cliente") or "", "stato": "da incassare", "commento": f.get("descrizione") or ""} for f in rows(conn, "fatture")]
    movements = rows(conn, "movimenti_finanziari")
    movements += [{"id": int(r.get("id", 0)) + 300000, "data": r.get("data") or "", "descrizione": f"Incasso {r.get('tipo_documento') or 'documento'} · {r.get('cliente') or ''}", "importo": float(r.get("importo") or 0), "direzione": "entrata", "categoria": "Incasso", "metodo": r.get("metodo") or ""} for r in rows(conn, "incassi")]
    movements += [{"id": int(p.get("id", 0)) + 400000, "data": p.get("data") or "", "descrizione": f"Pagamento · {p.get('fornitore') or ''}", "importo": float(p.get("importo") or 0), "direzione": "uscita", "categoria": "Pagamento", "metodo": p.get("metodo") or ""} for p in rows(conn, "pagamenti")]
    payload = {"clients": rows(conn, "clienti"), "companies": rows(conn, "elenco_aziende"), "documents": documents, "movements": movements, "hydrated": True, "updatedAt": int(time.time() * 1000)}
    conn.close()
    return payload


def trpc(server, procedure, payload, method="GET"):
    if method == "POST":
        url = server.rstrip("/") + "/api/trpc/" + procedure + "?batch=1"
        body = json.dumps({"0": {"json": payload}}, ensure_ascii=False).encode("utf-8")
    else:
        encoded = json.dumps({"0": {"json": payload}}, separators=(",", ":"))
        url = server.rstrip("/") + "/api/trpc/" + procedure + "?batch=1&input=" + urllib.parse.quote(encoded)
        body = None
    request = urllib.request.Request(url, method=method, headers={"Content-Type": "application/json"}, data=body)
    with urllib.request.urlopen(request, timeout=45) as response:
        body_response = json.loads(response.read().decode("utf-8"))
    result = body_response[0]["result"]["data"]
    return result.get("json", result) if isinstance(result, dict) else result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--server", required=True, help="URL API, ad esempio https://3000-...manus.computer")
    parser.add_argument("--key", required=True, help="Codice sincronizzazione mostrato nell'app Android")
    parser.add_argument("--db", required=True, help="Percorso a gestionale.db")
    parser.add_argument("command", choices=["push", "pull"])
    parser.add_argument("--out", default="cloud_snapshot.json")
    args = parser.parse_args()
    if args.command == "push":
        payload = build_payload(args.db)
        result = trpc(args.server, "sync.push", {"workspaceKey": args.key, "deviceId": "windows-pc", "payload": json.dumps(payload, ensure_ascii=False), "updatedAt": payload["updatedAt"]}, "POST")
        print("Sincronizzazione Windows completata:", result)
    else:
        result = trpc(args.server, "sync.pull", {"workspaceKey": args.key})
        Path(args.out).write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
        print("Snapshot cloud salvato in", args.out)

if __name__ == "__main__":
    main()
