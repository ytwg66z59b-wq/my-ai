import assert from "node:assert/strict";
import { test } from "node:test";
import { generateReply, CAPABILITIES } from "../shared/ai.ts";

test("greets on hello", () => {
  const { intent } = generateReply("hello");
  assert.equal(intent, "greeting");
});

test("evaluates arithmetic", () => {
  const { reply, intent } = generateReply("what is 24 * (3 + 5)?");
  assert.equal(intent, "math");
  assert.match(reply, /= 192$/);
});

test("counts words", () => {
  const { reply, intent } = generateReply("count words in the quick brown fox");
  assert.equal(intent, "wordcount");
  assert.match(reply, /4 word/);
});

test("reverses text", () => {
  const { reply, intent } = generateReply("reverse hello");
  assert.equal(intent, "reverse");
  assert.match(reply, /olleh/);
});

test("detects palindrome", () => {
  const { reply, intent } = generateReply("is racecar a palindrome?");
  assert.equal(intent, "palindrome");
  assert.match(reply, /is a palindrome/);
});

test("detects non-palindrome", () => {
  const { reply } = generateReply("is hello a palindrome?");
  assert.match(reply, /not a palindrome/);
});

test("analyzes positive sentiment", () => {
  const { reply, intent } = generateReply("sentiment of I love this awesome project");
  assert.equal(intent, "sentiment");
  assert.match(reply, /positive/);
});

test("falls back for unknown input", () => {
  const { intent } = generateReply("qwerty zxcvb");
  assert.equal(intent, "fallback");
});

test("capabilities are non-empty", () => {
  assert.ok(CAPABILITIES.length > 0);
});
