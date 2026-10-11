import { useState, useRef, useEffect } from "react";
import { Bot, Send, User, Sparkles, Database, RotateCcw } from "lucide-react";
import styles from "./Copilot.module.css";
import { askCopilot } from "../../services/aiService";

// Helper to render basic markdown tables and sections safely
function FormattedMessage({ text }) {
  if (!text) return null;

  // Split lines
  const lines = text.split("\n");
  const elements = [];
  let tableRows = [];
  let inTable = false;

  const flushTable = (key) => {
    if (tableRows.length === 0) return;
    const headerRow = tableRows[0];
    const dataRows = tableRows.slice(2); // Skip separator row

    elements.push(
      <table key={`table-${key}`}>
        <thead>
          <tr>
            {headerRow.map((h, i) => (
              <th key={i}>{h.trim()}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataRows.map((row, rIdx) => (
            <tr key={rIdx}>
              {row.map((cell, cIdx) => (
                <td key={cIdx}>{cell.trim()}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
    tableRows = [];
    inTable = false;
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Check table row
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      inTable = true;
      const cells = trimmed
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim());
      tableRows.push(cells);
      return;
    } else if (inTable) {
      flushTable(idx);
    }

    // Heading 3
    if (trimmed.startsWith("### ")) {
      elements.push(<h3 key={idx}>{trimmed.replace("### ", "")}</h3>);
    }
    // Blockquote
    else if (trimmed.startsWith("> ")) {
      elements.push(
        <blockquote key={idx}>{trimmed.replace("> ", "")}</blockquote>
      );
    }
    // Bullet item
    else if (trimmed.startsWith("- ")) {
      elements.push(
        <p key={idx} style={{ paddingLeft: "12px", marginBottom: "4px" }}>
          &bull; {trimmed.replace("- ", "")}
        </p>
      );
    }
    // Regular paragraph
    else if (trimmed) {
      elements.push(<p key={idx}>{trimmed}</p>);
    }
  });

  if (inTable) {
    flushTable("final");
  }

  return <div>{elements}</div>;
}

const SUGGESTED_QUESTIONS = [
  "How many vehicles are currently available?",
  "Which vehicles are currently on trips?",
  "Which drivers have the lowest safety scores?",
  "Which driver licenses will expire soon?",
  "Which vehicles are currently in maintenance?",
  "What are our total fuel expenses this month?",
  "Which vehicles have the highest operating costs?",
  "Show me all incomplete trips.",
  "Which vehicles have unusually high maintenance costs?",
  "Summarize the fleet's current performance.",
  "Which drivers have completed the most trips?",
  "Compare this month's fuel expenses with the previous month.",
];

function Copilot() {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "bot",
      content:
        "### TransitOps AI Fleet Copilot Ready\n\nI am your grounded fleet operations assistant. I query real-time database records to give you factual intelligence on vehicle availability, maintenance costs, driver safety scores, and fuel expenditures.\n\n*Choose a suggested question below or type your inquiry.*",
      sources: [{ label: "Real-time Fleet Database" }],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (questionText) => {
    const query = (questionText || input).trim();
    if (!query || loading) return;

    const userMsgId = `user-${Date.now()}`;
    const userMessage = { id: userMsgId, role: "user", content: query };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await askCopilot({
        question: query,
        conversationId,
      });

      const data = res.data?.data || res.data || {};
      const botAnswer =
        data.answer ||
        res.data?.answer ||
        "No response generated from fleet database.";
      const sources = data.sources || res.data?.sources || [];
      const newConvId = data.conversationId || res.data?.conversationId;

      if (newConvId) setConversationId(newConvId);

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: "bot",
          content: botAnswer,
          sources,
        },
      ]);
    } catch (err) {
      console.error("AI Copilot request error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "bot",
          content: `### Query Failed\n\n${
            err.response?.data?.message ||
            "Unable to retrieve fleet records at this moment. Please try again."
          }`,
          sources: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: "reset-welcome",
        role: "bot",
        content:
          "### Chat Reset\n\nConversation memory has been cleared. How can I assist with fleet operations?",
        sources: [{ label: "Fleet Intelligence Engine" }],
      },
    ]);
    setConversationId(null);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.breadcrumb}>Fleet Intelligence & Analytics</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1>
            <span>AI Fleet Copilot</span>
            <span className={styles.aiBadge}>Grounded AI</span>
          </h1>

          <button
            type="button"
            onClick={handleResetChat}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "transparent",
              border: "1px solid var(--border-color, #cbd5e1)",
              borderRadius: "8px",
              padding: "6px 12px",
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--text-secondary, #64748b)",
              cursor: "pointer",
            }}
          >
            <RotateCcw size={13} />
            <span>New Chat</span>
          </button>
        </div>
        <p>Ask natural questions grounded strictly in your live vehicles, drivers, trips, and expenses.</p>
      </header>

      <div className={styles.chatCard}>
        {/* Messages */}
        <div className={styles.messagesArea}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`${styles.messageRow} ${
                msg.role === "user" ? styles.userRow : styles.botRow
              }`}
            >
              <div
                className={`${styles.avatar} ${
                  msg.role === "user" ? styles.userAvatar : styles.botAvatar
                }`}
              >
                {msg.role === "user" ? <User size={18} /> : <Bot size={18} />}
              </div>

              <div
                className={`${styles.bubble} ${
                  msg.role === "user" ? styles.userBubble : styles.botBubble
                }`}
              >
                <FormattedMessage text={msg.content} />

                {msg.sources && msg.sources.length > 0 && (
                  <div className={styles.sourcesList}>
                    {msg.sources.map((s, idx) => (
                      <span key={idx} className={styles.sourcePill}>
                        <Database size={10} />
                        <span>{s.label || s.type || "DB Record"}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className={`${styles.messageRow} ${styles.botRow}`}>
              <div className={`${styles.avatar} ${styles.botAvatar}`}>
                <Bot size={18} />
              </div>
              <div className={styles.typingIndicator}>
                <div className={styles.dot} />
                <div className={styles.dot} />
                <div className={styles.dot} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        <div className={styles.suggestionsContainer}>
          <div className={styles.suggestionsTitle}>Suggested Fleet Inquiries</div>
          <div className={styles.suggestionsScroll}>
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                type="button"
                className={styles.suggestionChip}
                onClick={() => handleSend(q)}
                disabled={loading}
              >
                <Sparkles size={12} style={{ display: "inline", marginRight: "4px" }} />
                <span>{q}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <form
          className={styles.inputForm}
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <input
            type="text"
            className={styles.chatInput}
            placeholder="Ask AI Copilot about vehicle availability, maintenance, trips, or fuel..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />

          <button
            type="submit"
            className={styles.sendButton}
            disabled={loading || !input.trim()}
          >
            <Send size={15} />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default Copilot;

