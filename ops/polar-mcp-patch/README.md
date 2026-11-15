# polar-mcp patch kit (Patch A + Patch B)

> **SUPERSEDED 2026-11-15 — do not deploy anything from this folder.**
> On 2026-11-14 the source of truth for `polar-mcp` moved to branch
> `claude/polar-ncp-dynamic-variables-xIZK2` of `Vagblasterxl/vite-react-template`
> (draft PR #4). That branch already fixes the webhook dedupe bug (Patch A's
> job) and carries its own Discord commands at `/api/discord/*` (replacing
> Patch B). `polar-mcp.index.PATCHED.js`, `EXECUTE.md` and `AGENT-RUNBOOK.md`
> are kept as a record only.
>
> Still current in this folder:
> - **[`AGENT-LEE.md`](./AGENT-LEE.md)** — the prompt for Cloudflare's dashboard
>   agent, aimed at error 10021, the real reason nothing has shipped.
> - **[`LIVE-HOTFIXES-TO-PORT.md`](./LIVE-HOTFIXES-TO-PORT.md)** — three fixes
>   that are live today and missing from every newer build.

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
is the same work split into six phases for two agents (Desktop Commander +
Claude in Chrome) with fill-in REPORT blocks, so the owner only relays.

Regenerate from a fresh live dump with `./build-patched.sh <dump.js>`; run the
offline Patch B test with `node test-patchB.mjs`.

Built 2026-11-09 from the live Worker dump (6,047 lines, markers absent) and
`chanfana-openapi-template` commit `93a5b01`.
