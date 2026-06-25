import { encode } from "gpt-tokenizer";

export function countTokens(text: string): number {
  return encode(text).length;
}

export function countMessages(messages: { role: string; content: string }[]): number {
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

export type Usage = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
};
