declare const process: {
  env: Record<string, string | undefined>;
};

const DEFAULT_EXECUTOR_ORIGIN = "https://executor.sh";

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

    return new Response(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  },
};
