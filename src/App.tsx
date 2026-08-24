import { useEffect, useRef, useState } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  intent?: string;
  timestamp: string;
}

interface Capability {
  title: string;
  example: string;
}

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  text: "Hi! I'm my-ai — a tiny self-contained assistant. Ask me to do math, analyse text, check a palindrome, or just say hello. Try one of the suggestions below.",
  intent: "greeting",
  timestamp: new Date().toISOString(),
};

export function App() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  const [health, setHealth] = useState<"unknown" | "ok" | "down">("unknown");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/capabilities")
      .then((r) => r.json())
      .then((d) => setCapabilities(d.capabilities ?? []))
      .catch(() => setCapabilities([]));

    fetch("/api/health")
      .then((r) => (r.ok ? setHealth("ok") : setHealth("down")))
      .catch(() => setHealth("down"));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      role: "user",
      text: trimmed,
      timestamp: new Date().toISOString(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();
      const assistantMsg: Message = {
        id: data.id ?? `a_${Date.now()}`,
        role: "assistant",
        text: data.reply ?? "(no response)",
        intent: data.intent,
        timestamp: data.timestamp ?? new Date().toISOString(),
      };
      setMessages((m) => [...m, assistantMsg]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: `err_${Date.now()}`,
          role: "assistant",
          text: "⚠️ I couldn't reach the server. Is the backend running?",
          intent: "error",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    void send(input);
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-logo" aria-hidden>🤖</span>
          <div>
            <h1>my-ai</h1>
            <p className="tagline">self-contained assistant</p>
          </div>
        </div>

        <div className="status">
          <span className={`dot ${health}`} aria-hidden />
          <span>
            backend:{" "}
            {health === "ok" ? "connected" : health === "down" ? "offline" : "checking…"}
          </span>
        </div>

        <h2 className="section-title">Try asking</h2>
        <ul className="suggestions">
          {capabilities.map((c) => (
            <li key={c.title}>
              <button type="button" onClick={() => void send(c.example)} disabled={sending}>
                <span className="s-title">{c.title}</span>
                <span className="s-example">{c.example}</span>
              </button>
            </li>
          ))}
        </ul>

        <footer className="side-footer">No API keys · runs 100% locally</footer>
      </aside>

      <main className="chat">
        <div className="messages" ref={scrollRef}>
          {messages.map((m) => (
            <div key={m.id} className={`bubble-row ${m.role}`}>
              <div className="avatar" aria-hidden>{m.role === "user" ? "🧑" : "🤖"}</div>
              <div className="bubble">
                <div className="bubble-text">{m.text}</div>
                {m.intent && m.role === "assistant" && (
                  <div className="bubble-meta">intent: {m.intent}</div>
                )}
              </div>
            </div>
          ))}
          {sending && (
            <div className="bubble-row assistant">
              <div className="avatar" aria-hidden>🤖</div>
              <div className="bubble">
                <div className="typing">
                  <span /> <span /> <span />
                </div>
              </div>
            </div>
          )}
        </div>

        <form className="composer" onSubmit={onSubmit}>
          <input
            type="text"
            value={input}
            placeholder="Ask my-ai anything…"
            onChange={(e) => setInput(e.target.value)}
            aria-label="Message"
            autoFocus
          />
          <button type="submit" disabled={sending || !input.trim()}>
            Send
          </button>
        </form>
      </main>
    </div>
  );
}
