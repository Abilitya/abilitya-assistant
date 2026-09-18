declare const process: {
  env: Record<string, string | undefined>;
};

const DEFAULT_EXECUTOR_ORIGIN = "https://executor.sh";

const PUBLIC_TOOL_ANNOTATIONS = {
  execute: {
    readOnlyHint: false,
    openWorldHint: true,
    destructiveHint: true,
  },
  skills: {
    readOnlyHint: true,
    openWorldHint: false,
    destructiveHint: false,
  },
  resume: {
    readOnlyHint: false,
    openWorldHint: true,
    destructiveHint: true,
  },
} as const;

type JsonObject = Record<string, unknown>;

const isObject = (value: unknown): value is JsonObject =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isToolsListMessage = (value: unknown): boolean => {
  if (Array.isArray(value)) return value.some(isToolsListMessage);
  return isObject(value) && value.method === "tools/list";
};

export const isToolsListRequest = async (request: Request): Promise<boolean> => {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) return false;

  try {
    return isToolsListMessage(await request.json());
  } catch {
    return false;
  }
};

export const patchToolsListPayload = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(patchToolsListPayload);
  if (!isObject(value)) return value;

  const result = value.result;
  if (!isObject(result) || !Array.isArray(result.tools)) return value;

  const tools = result.tools.flatMap((tool) => {
    if (!isObject(tool) || typeof tool.name !== "string") return [];

    const annotations =
      PUBLIC_TOOL_ANNOTATIONS[tool.name as keyof typeof PUBLIC_TOOL_ANNOTATIONS];
    if (!annotations) return [];

    return [{ ...tool, annotations }];
  });

  return { ...value, result: { ...result, tools } };
};

export const patchToolsListBody = (body: string, contentType: string): string => {
  if (contentType.toLowerCase().includes("application/json")) {
    return JSON.stringify(patchToolsListPayload(JSON.parse(body)));
  }

  if (contentType.toLowerCase().includes("text/event-stream")) {
    return body
      .split("\n")
      .map((line) => {
        const match = /^data:(\s?)(.*)$/.exec(line);
        if (!match) return line;

        try {
          return `data:${match[1]}${JSON.stringify(patchToolsListPayload(JSON.parse(match[2])))}`;
        } catch {
          return line;
        }
      })
      .join("\n");
  }

  return body;
};

const REQUEST_HEADERS = [
  "accept",
  "content-type",
  "last-event-id",
  "mcp-protocol-version",
  "mcp-session-id",
] as const;

const RESPONSE_HEADERS = [
  "cache-control",
  "content-type",
  "mcp-session-id",
  "www-authenticate",
] as const;

export default {
  async fetch(request: Request): Promise<Response> {
    const apiKey = process.env.EXECUTOR_API_KEY;
    const executorOrigin = process.env.EXECUTOR_ORIGIN ?? DEFAULT_EXECUTOR_ORIGIN;
    const executorMcpPath = process.env.EXECUTOR_MCP_PATH;

    if (!apiKey || !executorMcpPath) {
      return Response.json(
        { error: "Executor MCP proxy is not configured" },
        { status: 500 },
      );
    }

    const requestUrl = new URL(request.url);
    const upstreamUrl = new URL(executorMcpPath, executorOrigin);
    upstreamUrl.search = requestUrl.search;
    upstreamUrl.searchParams.set("artifacts", "false");

    const shouldPatchToolsList =
      request.method === "POST" && (await isToolsListRequest(request.clone()));

    const upstreamHeaders = new Headers();
    for (const name of REQUEST_HEADERS) {
      const value = request.headers.get(name);
      if (value) upstreamHeaders.set(name, value);
    }
    upstreamHeaders.set("authorization", `Bearer ${apiKey}`);

    const hasBody = request.method !== "GET" && request.method !== "HEAD";
    const upstream = await fetch(upstreamUrl, {
      method: request.method,
      headers: upstreamHeaders,
      body: hasBody ? request.body : undefined,
      redirect: "manual",
      ...(hasBody ? { duplex: "half" as const } : {}),
    } as RequestInit & { duplex?: "half" });

    const responseHeaders = new Headers();
    for (const name of RESPONSE_HEADERS) {
      const value = upstream.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }

    if (shouldPatchToolsList && upstream.ok) {
      const contentType = upstream.headers.get("content-type") ?? "";
      if (
        contentType.toLowerCase().includes("application/json") ||
        contentType.toLowerCase().includes("text/event-stream")
      ) {
        const body = patchToolsListBody(await upstream.text(), contentType);
        return new Response(body, {
          status: upstream.status,
          headers: responseHeaders,
        });
      }
    }

    return new Response(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  },
};
