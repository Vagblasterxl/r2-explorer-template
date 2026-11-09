# polar-mcp patch kit (Patch A + Patch B)

Deployment kit for the **`polar-mcp`** Cloudflare Worker on the kenwsimmons
account. It is parked in this repository because it is the writable repo this
session had; it has nothing to do with R2 Explorer and can be moved to
`vagblasterxl/chanfana-openapi-template` (the reference implementation, PR #2)
at any time.

- **Patch A** — Polar webhook fails closed: signature is verified *before* the
  dedupe `INSERT`, unverified deliveries get `401`/`503` and a
  `polar_webhook_rejected` audit entry.
- **Patch B** — Discord slash-command ingress (`/omega status|whoami|bind|send|inbox|ack`)
  onto the existing `comms_messages` bus, Ed25519-verified, authorized against
  `polar_entitlements` through `discord_identities`.

Start with **[`EXECUTE.md`](./EXECUTE.md)** — the step-by-step runbook,
verification curls and rollback. **[`AGENT-RUNBOOK.md`](./AGENT-RUNBOOK.md)**
is the same work split into phases for two agents (Desktop Commander + Claude
in Chrome) with fill-in REPORT blocks, so the owner only relays.

Regenerate from a fresh live dump with `./build-patched.sh <dump.js>`; run the
offline Patch B test with `node test-patchB.mjs`.

Built 2026-11-09 from the live Worker dump (6,047 lines, markers absent) and
`chanfana-openapi-template` commit `93a5b01`.
