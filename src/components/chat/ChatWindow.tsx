import { useEffect, useRef, useState, useCallback } from "react";
import { X, Send, Loader2, AlertTriangle } from "lucide-react";
import axios from "axios";
import {
  fetchMessages,
  sendChatMessage,
  markConversationRead,
  type ChatMessageItem,
  type ConversationItem,
} from "../../services/chatService";
import { onChatMessage } from "../../services/notificationSocket";
import { useAuth } from "../../hooks/useAuth";
import { getAvatarColor, getInitials } from "../../utils";
import "./ChatWindow.scss";

interface Props {
  conversation: ConversationItem;
  onClose: () => void;
}

export default function ChatWindow({ conversation, onClose }: Props) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [relationshipEnded, setRelationshipEnded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetchMessages(conversation.conversationId, 0, 30)
      .then((res) => {
        setMessages([...res.content].reverse());
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    markConversationRead(conversation.conversationId).catch(console.error);
  }, [conversation.conversationId]);

  useEffect(() => {
    const unsubscribe = onChatMessage((msg) => {
      if (msg.conversationId !== conversation.conversationId) return;
      setMessages((prev) =>
        prev.some((m) => m.messageId === msg.messageId) ? prev : [...prev, msg],
      );

      if (msg.senderId !== user?.id) {
        markConversationRead(conversation.conversationId).catch(console.error);
      }
    });
    return unsubscribe;
  }, [conversation.conversationId, user?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(async () => {
    const content = input.trim();
    if (!content || sending) return;

    setSending(true);
    setInput("");
    try {
      const sent = await sendChatMessage(conversation.conversationId, content);
      setMessages((prev) =>
        prev.some((m) => m.messageId === sent.messageId)
          ? prev
          : [...prev, sent],
      );
    } catch (err) {
      console.error("Gửi tin nhắn thất bại", err);
      setInput(content);

      if (axios.isAxiosError(err) && err.response?.status === 403) {
        setRelationshipEnded(true);
      }
    } finally {
      setSending(false);
    }
  }, [conversation.conversationId, input, sending]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-window__header">
        {conversation.otherUserAvatarUrl ? (
          <img
            className="chat-window__avatar"
            src={conversation.otherUserAvatarUrl}
            alt={conversation.otherUserName}
          />
        ) : (
          <div
            className="chat-window__avatar chat-window__avatar--initials"
            style={{ background: getAvatarColor(conversation.otherUserName) }}
          >
            {getInitials(conversation.otherUserName)}
          </div>
        )}
        <div className="chat-window__title">
          <strong>{conversation.otherUserName}</strong>
          <span>{conversation.otherUserRole}</span>
        </div>
        <button
          type="button"
          className="chat-window__close"
          onClick={onClose}
          aria-label="Đóng"
        >
          <X size={18} />
        </button>
      </div>

      <div className="chat-window__body">
        {loading ? (
          <div className="chat-window__loading">
            <Loader2 size={20} className="chat-window__spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="chat-window__empty">
            Chưa có tin nhắn nào. Gửi lời chào đầu tiên nhé!
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.senderId === user?.id;
            return (
              <div
                key={msg.messageId}
                className={`chat-bubble-row ${isMine ? "chat-bubble-row--mine" : ""}`}
              >
                <div className="chat-bubble">
                  <p>{msg.content}</p>
                  <time>
                    {new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {relationshipEnded ? (
        <div className="chat-window__ended">
          <AlertTriangle size={15} />
          <span>Quan hệ phân công đã kết thúc, không thể nhắn tin tiếp.</span>
        </div>
      ) : (
        <div className="chat-window__footer">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập tin nhắn..."
            rows={1}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || sending}
            aria-label="Gửi"
          >
            <Send size={17} />
          </button>
        </div>
      )}
    </div>
  );
}
