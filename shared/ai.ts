/**
 * A small, fully self-contained "AI" engine.
 *
 * It has no external dependencies and requires no API keys, which makes the
 * whole app trivially runnable in any development environment. The engine
 * recognises a handful of intents and produces a deterministic reply plus some
 * lightweight metadata that the UI surfaces to the user.
 */

export interface AiReply {
  reply: string;
  intent: string;
  tokens: number;
}

export interface Capability {
  title: string;
  example: string;
}

export const CAPABILITIES: Capability[] = [
  { title: "Chat & greetings", example: "hello" },
  { title: "Arithmetic", example: "what is 24 * (3 + 5)?" },
  { title: "Text stats", example: "count words in the quick brown fox" },
  { title: "Transform text", example: "reverse hello world" },
  { title: "Palindrome check", example: "is racecar a palindrome?" },
  { title: "Sentiment", example: "sentiment of I love this project" },
  { title: "Date & time", example: "what time is it?" },
  { title: "Jokes", example: "tell me a joke" },
];

const POSITIVE_WORDS = new Set([
  "good", "great", "love", "loved", "like", "awesome", "amazing", "excellent",
  "happy", "wonderful", "fantastic", "nice", "cool", "best", "brilliant", "enjoy",
]);

const NEGATIVE_WORDS = new Set([
  "bad", "hate", "terrible", "awful", "sad", "worst", "horrible", "angry",
  "broken", "buggy", "slow", "ugly", "boring", "annoying", "poor", "fail",
]);

const JOKES = [
  "Why do programmers prefer dark mode? Because light attracts bugs.",
  "There are 10 kinds of people: those who understand binary and those who don't.",
  "A SQL query walks into a bar, walks up to two tables and asks: can I join you?",
  "Why did the developer go broke? Because they used up all their cache.",
];

function countTokens(text: string): number {
  const matches = text.trim().match(/\S+/g);
  return matches ? matches.length : 0;
}

function tryArithmetic(text: string): string | null {
  // Only allow a safe subset of characters so we can evaluate expressions
  // without exposing an eval() foot-gun.
  const cleaned = text
    .replace(/what\s+is/gi, " ")
    .replace(/calculate|compute|evaluate/gi, " ")
    .replace(/[?=]/g, " ")
    .replace(/\bx\b/gi, "*")
    .replace(/times/gi, "*")
    .replace(/plus/gi, "+")
    .replace(/minus/gi, "-")
    .replace(/divided by/gi, "/")
    .trim();

  if (!/[0-9]/.test(cleaned) || !/[+\-*/]/.test(cleaned)) return null;
  if (!/^[0-9+\-*/().\s]+$/.test(cleaned)) return null;

  try {
    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${cleaned});`)();
    if (typeof result === "number" && Number.isFinite(result)) {
      const pretty = Number.isInteger(result) ? result : Number(result.toFixed(6));
      return `${cleaned.replace(/\s+/g, " ").trim()} = ${pretty}`;
    }
  } catch {
    return null;
  }
  return null;
}

function analyzeSentiment(text: string): string {
  const words = text.toLowerCase().match(/[a-z']+/g) ?? [];
  let score = 0;
  for (const w of words) {
    if (POSITIVE_WORDS.has(w)) score += 1;
    if (NEGATIVE_WORDS.has(w)) score -= 1;
  }
  const label = score > 0 ? "positive 🙂" : score < 0 ? "negative 🙁" : "neutral 😐";
  return `Sentiment: ${label} (score ${score >= 0 ? "+" : ""}${score}).`;
}

function stripLeading(text: string, ...prefixes: string[]): string {
  let out = text.trim();
  for (const p of prefixes) {
    const re = new RegExp(`^${p}\\b[:,]?\\s*`, "i");
    out = out.replace(re, "");
  }
  return out.trim();
}

/**
 * Turn a user message into a reply. Pure and deterministic (except for jokes
 * and the current time), which keeps the engine easy to unit test.
 */
export function generateReply(rawMessage: string): AiReply {
  const message = (rawMessage ?? "").trim();
  const lower = message.toLowerCase();
  const tokens = countTokens(message);

  const reply = (text: string, intent: string): AiReply => ({ reply: text, intent, tokens });

  if (message.length === 0) {
    return reply("Say something and I'll do my best to help!", "empty");
  }

  if (/^(hi|hello|hey|yo|hiya|howdy)\b/.test(lower)) {
    return reply("Hey there! I'm my-ai. Ask me to do math, analyse text, or just chat. Type 'help' to see what I can do.", "greeting");
  }

  if (/\b(help|what can you do|capabilities|commands)\b/.test(lower)) {
    const list = CAPABILITIES.map((c) => `• ${c.title} — e.g. "${c.example}"`).join("\n");
    return reply(`Here's what I can do:\n${list}`, "help");
  }

  if (/\b(who are you|your name)\b/.test(lower)) {
    return reply("I'm my-ai, a tiny self-contained assistant. No cloud, no API keys — just deterministic logic running locally.", "identity");
  }

  if (/\b(thanks|thank you|thx)\b/.test(lower)) {
    return reply("You're welcome! 🙌", "gratitude");
  }

  if (/\bjoke\b/.test(lower)) {
    return reply(JOKES[Math.floor(Math.random() * JOKES.length)], "joke");
  }

  if (/\b(time|date|day)\b/.test(lower) && /\b(what|current|today|now|is it)\b/.test(lower)) {
    const now = new Date();
    return reply(`It's currently ${now.toUTCString()}.`, "datetime");
  }

  if (/\bsentiment\b/.test(lower)) {
    const target = stripLeading(message, "sentiment of", "sentiment");
    return reply(analyzeSentiment(target || message), "sentiment");
  }

  if (/\breverse\b/.test(lower)) {
    const target = stripLeading(message, "reverse");
    const reversed = [...target].reverse().join("");
    return reply(`Reversed: ${reversed}`, "reverse");
  }

  if (/\bpalindrome\b/.test(lower)) {
    const target = stripLeading(message, "is").replace(/\ba palindrome\??$/i, "").replace(/palindrome/gi, "").trim();
    const normalized = target.toLowerCase().replace(/[^a-z0-9]/g, "");
    const isPal = normalized.length > 0 && normalized === [...normalized].reverse().join("");
    return reply(`"${target}" is ${isPal ? "" : "not "}a palindrome.`, "palindrome");
  }

  if (/\b(count|how many)\b/.test(lower) && /\b(word|words)\b/.test(lower)) {
    const target = stripLeading(message, "count words in", "count words", "how many words in", "how many words are in", "how many words");
    return reply(`That has ${countTokens(target)} word(s) and ${target.replace(/\s/g, "").length} non-space character(s).`, "wordcount");
  }

  if (/\b(uppercase|upper case|shout)\b/.test(lower)) {
    const target = stripLeading(message, "uppercase", "upper case", "shout");
    return reply(target.toUpperCase(), "uppercase");
  }

  if (/\b(lowercase|lower case)\b/.test(lower)) {
    const target = stripLeading(message, "lowercase", "lower case");
    return reply(target.toLowerCase(), "lowercase");
  }

  const math = tryArithmetic(message);
  if (math) {
    return reply(math, "math");
  }

  // Fallback: acknowledge and reflect the message with a small stat.
  return reply(
    `I heard: "${message}". I'm a small demo assistant, so I don't have a full language model — but I can do math, text analysis, and more. Type 'help' to see my skills.`,
    "fallback",
  );
}
