import { getRoute, UPSTREAMS } from "@/lib/auth";
import { countTokens } from "./tokens";

type Upstream = "freemodel" | "openrouter";

function getHeaders(upstream: Upstream): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(upstream === "openrouter" && {
      "HTTP-Referer": process.env.APP_URL || "https://linkey.app",
      "X-Title": "Linkey",
    }),
  };

  if (upstream === "freemodel") {
    const token = UPSTREAMS.freemodel.token();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  } else {
    headers["Authorization"] = `Bearer ${UPSTREAMS.openrouter.token()}`;
  }

  return headers;
}

export type ProxyResult = {
  status: number;
  body: unknown;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
};

export async function proxyChatCompletion(
  model: string,
  messages: { role: string; content: string }[],
  extraBody: Record<string, unknown> = {}
): Promise<ProxyResult> {
  const route = getRoute(model);
  if (!route)
    return {
      status: 404,
      body: { error: { message: `Model '${model}' tidak tersedia`, type: "invalid_model" } },
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
    };

  const upstreamCfg = route.upstream === "freemodel" ? UPSTREAMS.freemodel : UPSTREAMS.openrouter;
  const url = `${upstreamCfg.base}${upstreamCfg.chatPath}`;

  const body = {
    model: route.upstreamModel,
    messages,
    stream: extraBody.stream ?? false,
    ...extraBody,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: getHeaders(route.upstream),
    body: JSON.stringify(body),
  });

  const responseBody = await response.json();

  let promptTokens = responseBody.usage?.prompt_tokens ?? countTokens(JSON.stringify(messages));
  let completionTokens =
    responseBody.usage?.completion_tokens ??
    countTokens(responseBody.choices?.[0]?.message?.content ?? "");
  let totalTokens = promptTokens + completionTokens;

  return {
    status: response.status,
    body: responseBody,
    usage: { promptTokens, completionTokens, totalTokens },
  };
}
