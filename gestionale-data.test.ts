import { describe, expect, it } from "vitest";
import { importedSeedData } from "../data/seedData";

describe("dati importati dal gestionale Windows", () => {
  it("contiene l'anagrafica clienti completa", () => {
    expect(importedSeedData.clients.length).toBe(491);
    expect(importedSeedData.clients[0]).toHaveProperty("denominazione");
    expect(importedSeedData.clients.every((client) => Boolean(client.id))).toBe(true);
  });

  it("mantiene le sezioni operative del database originale", () => {
    expect(importedSeedData.companies.length).toBeGreaterThan(0);
    expect(Array.isArray(importedSeedData.documents)).toBe(true);
    expect(Array.isArray(importedSeedData.ddt)).toBe(true);
    expect(Array.isArray(importedSeedData.invoices)).toBe(true);
    expect(Array.isArray(importedSeedData.receipts)).toBe(true);
    expect(Array.isArray(importedSeedData.payments)).toBe(true);
    expect(Array.isArray(importedSeedData.movements)).toBe(true);
  });

  it("espone campi leggibili per il cruscotto", () => {
    const firstClient = importedSeedData.clients[0];
    const company = importedSeedData.companies[0];
    expect(String(firstClient.denominazione || firstClient.ragione_sociale)).not.toBe("");
    expect(String(company.denominazione)).not.toBe("");
  });
});
