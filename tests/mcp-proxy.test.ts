import assert from "node:assert/strict";
import test from "node:test";

import {
  default as proxy,
  isToolsListRequest,
  patchToolsListBody,
  patchToolsListPayload,
} from "../api/mcp.ts";

const upstreamTools = [
  { name: "execute", description: "Run code" },
  {
    name: "skills",
    annotations: {
      readOnlyHint: true,
      openWorldHint: false,
      destructiveHint: false,
    },
  },
  { name: "resume", description: "Resume work" },
  { name: "create-artifact" },
];

test("recognizes tools/list requests without matching other MCP methods", async () => {
  const toolsList = new Request("https://example.test/mcp", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list", params: {} }),
  });
  const execute = new Request("https://example.test/mcp", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/call", params: {} }),
  });

  assert.equal(await isToolsListRequest(toolsList), true);
  assert.equal(await isToolsListRequest(execute), false);
});

test("keeps only the public tools and applies complete annotations", () => {
  const patched = patchToolsListPayload({
    jsonrpc: "2.0",
    id: 1,
    result: { tools: upstreamTools },
  }) as { result: { tools: Array<{ name: string; annotations: unknown }> } };

  assert.deepEqual(
    patched.result.tools.map((tool) => tool.name),
    ["execute", "skills", "resume"],
  );
  assert.deepEqual(patched.result.tools[0]?.annotations, {
    readOnlyHint: false,
    openWorldHint: true,
    destructiveHint: true,
  });
  assert.deepEqual(patched.result.tools[1]?.annotations, {
    readOnlyHint: true,
    openWorldHint: false,
    destructiveHint: false,
  });
  assert.deepEqual(patched.result.tools[2]?.annotations, {
    readOnlyHint: false,
    openWorldHint: true,
    destructiveHint: true,
  });
});

test("patches an SSE tools/list event while preserving its envelope", () => {
  const payload = JSON.stringify({
    jsonrpc: "2.0",
    id: 3,
    result: { tools: upstreamTools },
  });
  const body = `event: message\nid: event-1\ndata: ${payload}\n\n`;
  const patched = patchToolsListBody(body, "text/event-stream");

  assert.match(patched, /^event: message\nid: event-1\ndata: /);
  const data = patched
    .split("\n")
    .find((line) => line.startsWith("data: "))
    ?.slice("data: ".length);
  assert.ok(data);

  const parsed = JSON.parse(data) as { result: { tools: Array<{ name: string }> } };
  assert.deepEqual(
    parsed.result.tools.map((tool) => tool.name),
    ["execute", "skills", "resume"],
  );
});

test("leaves non-tools payloads unchanged", () => {
  const payload = { jsonrpc: "2.0", id: 4, result: { content: [{ type: "text" }] } };
  assert.deepEqual(patchToolsListPayload(payload), payload);
});

test("the proxy forces artifacts off and patches a live tools/list response", async () => {
  const originalFetch = globalThis.fetch;
  const originalApiKey = process.env.EXECUTOR_API_KEY;
  const originalOrigin = process.env.EXECUTOR_ORIGIN;
  const originalPath = process.env.EXECUTOR_MCP_PATH;
  let requestedUrl: string | undefined;

  process.env.EXECUTOR_API_KEY = "test-key";
  process.env.EXECUTOR_ORIGIN = "https://executor.example";
  process.env.EXECUTOR_MCP_PATH = "/toolkit/mcp";
  globalThis.fetch = async (input) => {
    requestedUrl = String(input);
    const payload = JSON.stringify({
      jsonrpc: "2.0",
      id: 5,
      result: { tools: upstreamTools },
    });
    return new Response(`event: message\ndata: ${payload}\n\n`, {
      status: 200,
      headers: { "content-type": "text/event-stream" },
    });
  };

  try {
    const response = await proxy.fetch(
      new Request("https://abilitya.example/mcp?client=value&artifacts=true", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 5,
          method: "tools/list",
          params: {},
        }),
      }),
    );

    assert.equal(
      requestedUrl,
      "https://executor.example/toolkit/mcp?client=value&artifacts=false",
    );
    assert.doesNotMatch(await response.text(), /create-artifact/);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiKey === undefined) delete process.env.EXECUTOR_API_KEY;
    else process.env.EXECUTOR_API_KEY = originalApiKey;
    if (originalOrigin === undefined) delete process.env.EXECUTOR_ORIGIN;
    else process.env.EXECUTOR_ORIGIN = originalOrigin;
    if (originalPath === undefined) delete process.env.EXECUTOR_MCP_PATH;
    else process.env.EXECUTOR_MCP_PATH = originalPath;
  }
});
