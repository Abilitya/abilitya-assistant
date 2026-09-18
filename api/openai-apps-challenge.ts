declare const process: {
  env: Record<string, string | undefined>;
};

export default {
  fetch(request: Request): Response {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", {
        status: 405,
        headers: { Allow: "GET, HEAD" },
      });
    }

    const token = process.env.OPENAI_APPS_CHALLENGE_TOKEN;
    if (!token) {
      return new Response("OpenAI Apps challenge token is not configured", {
        status: 503,
      });
    }

    return new Response(request.method === "HEAD" ? null : token, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  },
};
