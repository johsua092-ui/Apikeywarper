// Rough token counter (OpenAI-compatible). For production, use tiktoken.
// gpt-tokenizer is used for better accuracy.

import { encode } from "gpt-tokenizer";

export function countTokens(text: string): number {
  return encode(text).length;
}

export function countMessages(messages: { role: string; content: string }[]): number {
  // Approximate: format tokens + overhead
  let total = 0;
  for (const m of messages) {
    total += 3; // role overhead
    if (m.role === "system") total += 4;
    if (m.role === "assistant") total += 4;
    total += countTokens(m.content);
  }
  total += 3; // primer
  return total;
}

// Rough estimate of total chat tokens given model context
export type Usage = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
};
