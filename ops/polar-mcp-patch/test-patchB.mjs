// Smoke test for patchB.js outside the Worker: stubs the live helpers it
// relies on, loads the patch, then drives the two routes with a fake Hono
// context and an in-memory D1. Run: node test-patchB.mjs
import { readFileSync } from "node:fs";
import { webcrypto } from "node:crypto";
globalThis.crypto ??= webcrypto;

// ---- stubs for live polar-mcp helpers patchB reuses -------------------------
const audit = [];
const routes = { get: new Map(), post: new Map() };
const app = {
  get: (p, h) => routes.get.set(p, h),
  post: (p, h) => routes.post.set(p, h),
};
function hexToBytes(hex) {
  if (hex.length < 2 || hex.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(hex)) return null;
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}
function addAuditEntry(action, resourceType, resourceId, details = {}) {
  audit.push({ action, resourceType, resourceId, details });
}
function shapeEntitlement(r) {
  let caps = [];
  try { caps = JSON.parse(r.capabilities); } catch { caps = []; }
  return { capabilities: caps, active: r.active === 1 };
}
async function ensureCommsSchema() {}
function getEnv(c, key) { return c.env[key]; }

// ---- tiny in-memory D1 -------------------------------------------------------
const tables = {
  polar_entitlements: [
    { customer_id: "cus_cannon", external_customer_id: "agent:claude:cannon", active: 1, capabilities: '["registry.admin","vault.read","mesh.dispatch"]' },
    { customer_id: "cus_spark_a", external_customer_id: "agent:spark:a", active: 1, capabilities: '["memory.write","comms.send"]' },
    { customer_id: "cus_spark_a", external_customer_id: "agent:spark:a", active: 0, capabilities: '[]' },
  ],
  discord_identities: [],
  discord_interactions: [],
  comms_messages: [],
};
let autoId = 100;
const DB = {
  prepare(sql) {
    let binds = [];
    const stmt = {
      bind(...b) { binds = b; return stmt; },
      async run() {
        if (/^CREATE/i.test(sql)) return { meta: { changes: 0 } };
        if (sql.startsWith("INSERT OR IGNORE INTO discord_interactions")) {
          const [id, command, uid, at] = binds;
          if (tables.discord_interactions.some((r) => r.interaction_id === id)) return { meta: { changes: 0 } };
          tables.discord_interactions.push({ interaction_id: id, command, discord_user_id: uid, received_at: at });
          return { meta: { changes: 1 } };
        }
        if (sql.startsWith("INSERT INTO discord_identities")) {
          const [discord_user_id, agent_id, polar_customer_id, discord_username, guild_id, bound_by, bound_at] = binds;
          const row = { discord_user_id, agent_id, polar_customer_id, discord_username, guild_id, bound_by, bound_at };
          const i = tables.discord_identities.findIndex((r) => r.discord_user_id === discord_user_id);
          if (i >= 0) tables.discord_identities[i] = row; else tables.discord_identities.push(row);
          return { meta: { changes: 1 } };
        }
        if (sql.startsWith("INSERT INTO comms_messages")) {
          const [sender, recipient, message_type, payload, created_at] = binds;
          const id = ++autoId;
          tables.comms_messages.push({ id, sender, recipient, message_type, payload, processed: 0, ack_sent: 0, created_at, classification: null });
          return { meta: { changes: 1, last_row_id: id } };
        }
        if (sql.startsWith("UPDATE comms_messages")) {
          const [id, recipient] = binds;
          const row = tables.comms_messages.find((r) => r.id === id && r.recipient === recipient && r.processed === 0);
          if (!row) return { meta: { changes: 0 } };
          row.processed = 1; row.ack_sent = 1;
          return { meta: { changes: 1 } };
        }
        throw new Error("unhandled run: " + sql);
      },
      async first() {
        if (sql.startsWith("SELECT * FROM discord_identities")) {
          return tables.discord_identities.find((r) => r.discord_user_id === binds[0]) ?? null;
        }
        if (sql.startsWith("SELECT COUNT(*) AS total")) {
          const total = tables.comms_messages.length;
          const processed = tables.comms_messages.filter((r) => r.processed).length;
          return { total, processed };
        }
        throw new Error("unhandled first: " + sql);
      },
      async all() {
        if (sql.startsWith("SELECT * FROM polar_entitlements")) {
          const c = binds[0];
          return { results: tables.polar_entitlements.filter((r) => (r.customer_id === c || r.external_customer_id === c) && r.active === 1) };
        }
        if (sql.startsWith("SELECT id, sender, recipient, message_type, payload, created_at, classification FROM comms_messages")) {
          const [recipient, limit] = binds;
          return { results: tables.comms_messages.filter((r) => r.recipient === recipient && r.processed === 0).slice(0, limit) };
        }
        throw new Error("unhandled all: " + sql);
      },
    };
    return stmt;
  },
};

// ---- load patch B into this scope ------------------------------------------
const patch = readFileSync(new URL("./patchB.js", import.meta.url), "utf8");
new Function("app", "hexToBytes", "addAuditEntry", "shapeEntitlement", "ensureCommsSchema", "getEnv", patch)(
  app, hexToBytes, addAuditEntry, shapeEntitlement, ensureCommsSchema, getEnv,
);
const interactions = routes.post.get("/api/integrations/discord/interactions");
const manifest = routes.get.get("/api/integrations/discord/commands");
if (!interactions || !manifest) throw new Error("routes not registered");

// ---- Ed25519 keypair + signed request builder --------------------------------
const kp = await crypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"]);
const pubRaw = new Uint8Array(await crypto.subtle.exportKey("raw", kp.publicKey));
const hex = (u8) => Array.from(u8).map((b) => b.toString(16).padStart(2, "0")).join("");
const PUBLIC_KEY_HEX = hex(pubRaw);

async function request(body, { sign = true, env = {}, tamperSig = false, ts } = {}) {
  const raw = typeof body === "string" ? body : JSON.stringify(body);
  const headers = new Headers();
  if (sign) {
    const timestamp = String(ts ?? Math.floor(Date.now() / 1000));
    const sig = new Uint8Array(await crypto.subtle.sign({ name: "Ed25519" }, kp.privateKey, new TextEncoder().encode(timestamp + raw)));
    if (tamperSig) sig[0] ^= 0xff;
    headers.set("x-signature-ed25519", hex(sig));
    headers.set("x-signature-timestamp", timestamp);
  }
  let status = 200, json;
  const c = {
    env: { DB, DISCORD_PUBLIC_KEY: PUBLIC_KEY_HEX, DISCORD_OPERATOR_IDS: "111111111111111111", ...env },
    req: { text: async () => raw, raw: { headers } },
    json: (b, s = 200) => { status = s; json = b; return { status, json }; },
  };
  await interactions(c);
  return { status, json };
}
const cmd = (id, sub, opts = {}, user = { id: "111111111111111111", username: "ken" }) => ({
  id, type: 2, guild_id: "g1", channel_id: "ch1",
  data: { name: "omega", options: [{ name: sub, type: 1, options: Object.entries(opts).map(([name, value]) => ({ name, type: typeof value === "number" ? 4 : 3, value })) }] },
  member: { user },
});

let failures = 0;
function check(name, cond, extra = "") {
  console.log(`${cond ? "ok  " : "FAIL"} ${name}${extra ? " — " + extra : ""}`);
  if (!cond) failures++;
}

// 1. manifest
{ let out; manifest({ json: (b) => { out = b; } }); check("manifest serves [omega]", Array.isArray(out) && out[0].name === "omega" && out[0].options.length === 6); }
// 2. config failure -> 503
{ const r = await request({ id: "p0", type: 1 }, { env: { DISCORD_PUBLIC_KEY: "" } }); check("no public key -> 503", r.status === 503, JSON.stringify(r.json)); }
// 3. unsigned -> 401 (Discord's registration probe)
{ const r = await request({ id: "p1", type: 1 }, { sign: false }); check("unsigned -> 401", r.status === 401, r.json?.reason); }
// 4. tampered -> 401
{ const r = await request({ id: "p2", type: 1 }, { tamperSig: true }); check("tampered sig -> 401 signature_mismatch", r.status === 401 && r.json.reason === "signature_mismatch"); }
// 5. stale -> 401
{ const r = await request({ id: "p3", type: 1 }, { ts: Math.floor(Date.now() / 1000) - 3600 }); check("stale timestamp -> 401", r.status === 401 && r.json.reason === "timestamp_out_of_tolerance"); }
// 6. PING -> PONG
{ const r = await request({ id: "p4", type: 1 }); check("PING -> PONG", r.status === 200 && r.json.type === 1); }
// 7. unbound user send -> denied
{ const r = await request(cmd("i1", "send", { recipient: "agent:spark:a", message: "hi" }, { id: "222222222222222222", username: "rando" })); check("unbound send denied", r.status === 200 && /Not bound/.test(r.json.data.content) && r.json.data.flags === 64); check("no bus row written for denied send", tables.comms_messages.length === 0); }
// 8. operator binds self to cannon (registry.admin) using external id as customer
{ const r = await request(cmd("i2", "bind", { agent: "agent:claude:cannon", customer: "agent:claude:cannon" })); check("operator bind ok", /Bound `111111111111111111` → `agent:claude:cannon`/.test(r.json.data.content), r.json.data.content); }
// 9. whoami resolves caps via external_customer_id
{ const r = await request(cmd("i3", "whoami")); check("whoami shows registry.admin", /registry\.admin/.test(r.json.data.content) && /Operator/.test(r.json.data.content)); }
// 10. cannon (no comms.send) cannot send
{ const r = await request(cmd("i4", "send", { recipient: "agent:spark:a", message: "hi" })); check("warden without comms.send denied", /`comms\.send` required/.test(r.json.data.content), r.json.data.content); }
// 11. cannon (registry.admin) binds another user to spark:a
{ const r = await request(cmd("i5", "bind", { agent: "agent:spark:a", customer: "cus_spark_a", user: "333333333333333333", username: "sparky" })); check("registry.admin binds other user", /→ `agent:spark:a`/.test(r.json.data.content)); }
// 12. spark:a sends -> bus row with relay payload
const sparky = { id: "333333333333333333", username: "sparky" };
{ const r = await request(cmd("i6", "send", { recipient: "agent:claude:cannon", message: "ping from discord" }, sparky)); check("comms.send holder queues message", /Queued \*\*#101\*\*/.test(r.json.data.content), r.json.data.content); const row = tables.comms_messages[0]; const p = JSON.parse(row.payload); check("bus row shape", row.sender === "agent:spark:a" && row.recipient === "agent:claude:cannon" && row.message_type === "discord.relay" && p.via === "discord-relay" && p.text === "ping from discord" && p.interaction_id === "i6"); }
// 13. replayed interaction id does not double-post
{ const r = await request(cmd("i6", "send", { recipient: "agent:claude:cannon", message: "ping from discord" }, sparky)); check("replay of i6 not applied twice", /already ran/.test(r.json.data.content) && tables.comms_messages.length === 1); }
// 14. inbox for another agent, then ack scoped to own agent
{ const r = await request(cmd("i7", "inbox", { recipient: "agent:claude:cannon" }, sparky)); check("inbox lists #101", /#101/.test(r.json.data.content), r.json.data.content); }
{ const r = await request(cmd("i8", "ack", { id: 101 }, sparky)); check("ack of someone else's message refused", /No open message/.test(r.json.data.content) && tables.comms_messages[0].processed === 0); }
{ await request(cmd("i9", "send", { recipient: "agent:spark:a", message: "self note" }, sparky)); const r = await request(cmd("i10", "ack", { id: 102 }, sparky)); check("ack of own message ok", /Acknowledged \*\*#102\*\*/.test(r.json.data.content) && tables.comms_messages[1].processed === 1); }
// 15. status
{ const r = await request(cmd("i11", "status", {}, sparky)); check("status reports bus totals", /\*\*Bus\*\* 2 messages, 1 open, 1 acknowledged/.test(r.json.data.content), r.json.data.content); }
// 16. unknown subcommand
{ const r = await request(cmd("i12", "frobnicate", {}, sparky)); check("unknown subcommand lists available", /Unknown command `\/omega frobnicate`/.test(r.json.data.content)); }
// 17. audit trail
check("audit has rejected + command entries", audit.some((a) => a.action === "discord_interaction_rejected") && audit.some((a) => a.action === "discord_command") && audit.some((a) => a.action === "discord_bind"));

console.log(failures === 0 ? "\nALL PASSED" : `\n${failures} FAILED`);
process.exit(failures === 0 ? 0 : 1);
