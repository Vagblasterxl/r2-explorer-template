# Three live fixes that the newer builds are missing

Found 2026-11-15 by diffing two downloads of `polar-mcp` from the Cloudflare API:

| Download | What it is | Lines (wrapper stripped) |
|---|---|---|
| 2026-11-09 | The version serving traffic: deployment `9cbe9955`, 2026-09-26 | 6,047 |
| 2026-11-15 | The newest upload: a laptop build (`polar-mcp-real`, HEAD `3fe5b7c`, 2026-09-13) parked on 2026-11-11 with `wrangler versions upload`, never deployed | 6,034 |

The 13-line difference is three fixes that `claude-chat` made straight in the
dashboard editor on 2026-09-25 and 2026-09-26. They never went back into any
source tree, so every build made from source since then lacks them:

- the parked database-swap version `94e9cc6f…` (and `b73e133f…`);
- branch `claude/polar-ncp-dynamic-variables-xIZK2` at `d424409` in
  `Vagblasterxl/vite-react-template` (draft PR #4), which was reconciled on
  2026-11-14 against the 6,039-line download, i.e. the parked build, not the
  live one.

Deploying either as-is would bring back the two client failures the fixes
were written for.

## The fixes, exactly as they are live

```js
// claude-chat 2026-09-26: MCP spec - a server that does not offer a listening stream on GET must answer 405.
// The phone app (Ktor/Kotlin MCP client) opens this right after connecting; a 404 made it drop the connection.
app.get("/api/mcp", (c) => c.body(null, 405, { Allow: "POST" }));
app.delete("/api/mcp", (c) => c.body(null, 405, { Allow: "POST" }));
app.post("/api/mcp", async (c) => {
  const request = await c.req.json();
  // claude-chat 2026-09-25: JSON-RPC notifications (no id) get an empty 202 per the MCP spec.
  // Strict clients (Google AI Edge Gallery) reject a reply that has no id.
  if (request && !Array.isArray(request) && (request.id === undefined || request.id === null) &&
      typeof request.method === "string" && request.method.startsWith("notifications/")) {
    return new Response(null, { status: 202 });
  }
  if (request.jsonrpc !== "2.0") {
    /* ...unchanged... */
  }
  switch (request.method) {
    case "ping": {
      return c.json({ jsonrpc: "2.0", id: request.id, result: {} });
    }
    case "initialize": {
      /* ...unchanged... */
```

## Where they go in the branch

`src/worker/index.ts` at `d424409`:

1. Immediately above `app.post("/api/mcp", async (c) => {` (line 1622): add the
   two `app.get` / `app.delete` 405 routes.
2. First statement inside that handler, right after
   `const request = await c.req.json<JsonRpcRequest>();`: add the
   notifications `202` early return. The existing
   `case "notifications/initialized"` then only runs for a request that carries
   an id; it can stay.
3. Inside `switch (request.method)`, before `case "initialize"`: add the
   `ping` case. (The only `case "ping"` in the file today, line 4262, belongs
   to the GitHub webhook handler, not to MCP.)

`JsonRpcRequest.id` is typed `string | number`; widen it to
`string | number | null | undefined` or the notification check will not
type-check under `tsc -b`.

## How to confirm after any deploy

```bash
BASE=https://polar-mcp.kenwsimmons.workers.dev
curl -s -o /dev/null -w 'GET /api/mcp: %{http_code}\n' $BASE/api/mcp            # expect 405
curl -s -o /dev/null -w 'notification: %{http_code}\n' -X POST $BASE/api/mcp \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","method":"notifications/initialized"}'                  # expect 202, empty body
curl -s -X POST $BASE/api/mcp -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"ping"}'                                # expect {"jsonrpc":"2.0","id":1,"result":{}}
```
