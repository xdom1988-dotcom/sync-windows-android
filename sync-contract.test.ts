import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (file: string) => readFileSync(join(root, file), "utf8");
const routerSource = read("server/routers.ts");
const contextSource = read("lib/gestionale-context.tsx");
const documentsSource = read("app/(tabs)/documents.tsx");
const scanSource = read("app/scan.tsx");
const windowsSource = read("windows-sync/sync_gestionale.py");

describe("funzionalità cloud e mobile", () => {
  it("espone pull/push cloud e upload per PDF/immagini", () => {
    expect(routerSource).toContain("pull:");
    expect(routerSource).toContain("push:");
    expect(routerSource).toContain("uploadAttachment:");
    expect(routerSource).toContain("application/pdf");
    expect(routerSource).toContain("image/jpeg");
  });
  it("mantiene il PDF localmente e tenta l'upload cloud", () => {
    expect(contextSource).toContain("attachPdfToDocument");
    expect(contextSource).toContain("copyAsync");
    expect(contextSource).toContain("api.documents.uploadAttachment.mutate");
    expect(documentsSource).toContain("getDocumentAsync");
  });
  it("contiene una schermata camera e il connettore Windows", () => {
    expect(scanSource).toContain("CameraView");
    expect(scanSource).toContain("takePictureAsync");
    expect(windowsSource).toContain("sync.push");
    expect(windowsSource).toContain("sync.pull");
  });
});
