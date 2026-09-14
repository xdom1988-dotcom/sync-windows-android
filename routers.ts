import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { storagePut } from "./storage";
import { sql } from "drizzle-orm";
import { z } from "zod";

const syncKey = z.string().min(8).max(160);
const snapshotInput = z.object({ workspaceKey: syncKey, deviceId: z.string().min(3).max(120), payload: z.string().max(20_000_000), updatedAt: z.number().int().positive() });
let syncTableReady: Promise<void> | null = null;
async function ensureSyncTable() {
  if (!syncTableReady) {
    syncTableReady = (async () => {
      const db = await getDb();
      if (!db) throw new Error("Database cloud non configurato");
      await db.execute(sql.raw(`CREATE TABLE IF NOT EXISTS sync_snapshots (workspace_key VARCHAR(160) PRIMARY KEY, device_id VARCHAR(120) NOT NULL, payload LONGTEXT NOT NULL, updated_at BIGINT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)`));
    })();
  }
  return syncTableReady;
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }),
  }),
  sync: router({
    pull: publicProcedure.input(z.object({ workspaceKey: syncKey })).query(async ({ input }) => {
      await ensureSyncTable();
      const db = await getDb();
      if (!db) return null;
      const result = await db.execute(sql`SELECT workspace_key, device_id, payload, updated_at FROM sync_snapshots WHERE workspace_key = ${input.workspaceKey} LIMIT 1`);
      const resultRows = Array.isArray((result as any)[0]) ? (result as any)[0] : result as any;
      const row = resultRows[0];
      return row ? { deviceId: row.device_id, payload: row.payload, updatedAt: Number(row.updated_at) } : null;
    }),
    push: publicProcedure.input(snapshotInput).mutation(async ({ input }) => {
      await ensureSyncTable();
      const db = await getDb();
      if (!db) throw new Error("Database cloud non configurato");
      const result = await db.execute(sql`SELECT updated_at FROM sync_snapshots WHERE workspace_key = ${input.workspaceKey} LIMIT 1`);
      const resultRows = Array.isArray((result as any)[0]) ? (result as any)[0] : result as any;
      const row = resultRows[0];
      if (row && Number(row.updated_at) > input.updatedAt) return { accepted: false, updatedAt: Number(row.updated_at) };
      await db.execute(sql`INSERT INTO sync_snapshots (workspace_key, device_id, payload, updated_at) VALUES (${input.workspaceKey}, ${input.deviceId}, ${input.payload}, ${input.updatedAt}) ON DUPLICATE KEY UPDATE device_id = VALUES(device_id), payload = VALUES(payload), updated_at = VALUES(updated_at)`);
      return { accepted: true, updatedAt: input.updatedAt };
    }),
  }),
  documents: router({
    uploadAttachment: publicProcedure.input(z.object({ workspaceKey: syncKey, fileName: z.string().min(1).max(240), mimeType: z.enum(["application/pdf", "image/jpeg", "image/png"]), base64: z.string().min(10).max(40_000_000) })).mutation(async ({ input }) => {
      const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
      const result = await storagePut(`gestionale/${input.workspaceKey}/fatture/${Date.now()}-${safeName}`, Buffer.from(input.base64, "base64"), input.mimeType);
      return { ...result, fileName: input.fileName, mimeType: input.mimeType };
    }),
  }),
});
export type AppRouter = typeof appRouter;
