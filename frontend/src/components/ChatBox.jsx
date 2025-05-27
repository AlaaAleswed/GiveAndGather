// ChatBox.jsx
import React, { useEffect, useRef, useState } from "react";
import { fetchMessages, sendMessage } from "../api";
import socket from "../sockets/socket";
import { useUser } from "../context/UserContext";

const ChatBox = ({ conversation, partner }) => {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const { user: currentUser } = useUser();

  const isReady = conversation?._id && partner?._id;

  useEffect(() => {
    const loadMessages = async () => {
      if (!conversation?._id) return;
      const res = await fetchMessages(conversation._id);

      // ✅ إزالة التكرار باستخدام Map على أساس _id
      const uniqueMessages = Array.from(
        new Map(res.data.map((msg) => [msg._id, msg])).values()
      );

      setMessages(uniqueMessages);
    };

    loadMessages();
  }, [conversation?._id, conversation?.triggerRefresh]);

  useEffect(() => {
    const handleIncoming = (incoming) => {
      if (incoming.conversationId === conversation?._id) {
        console.log("📩 Real-time message:", incoming);
        // إعادة تحميل كل الرسائل
        fetchMessages(conversation._id).then((res) => {
          setMessages(res.data || []);
        });
      }
    };

    socket.on("newMessage", handleIncoming);
    return () => socket.off("newMessage", handleIncoming);
  }, [conversation?._id, conversation?.triggerRefresh]);

  //   const handleSend = async () => {
  //     const text = newMessage.trim();
  //     if (!text) return;
  //     const tempMessage = {
  //       sender: currentUser._id,
  //       content: text,
  //       conversationId: conversation._id,
  //       createdAt: new Date().toISOString(),
  //     };
  //     setMessages((prev) => {
  //       const exists = prev.some(
  //         (msg) =>
  //           msg.content === tempMessage.content &&
  //           msg.sender === tempMessage.sender &&
  //           msg.conversationId === tempMessage.conversationId
  //       );
  //       return exists ? prev : [...prev, tempMessage];
  //     });
  //     try {
  //       const res = await sendMessage(conversation._id, text);
  //       socket.emit("sendMessage", {
  //         senderId: currentUser._id,
  //         receiverId: partner._id,
  //         message: res.data,
  //       });
  //     } catch (err) {
  //       console.error("❌ Failed to send message:", err);
  //     }
  //     setNewMessage("");
  //   };

  const handleSend = async () => {
    const text = newMessage.trim();
    if (!text) return;

    try {
      const res = await sendMessage(conversation._id, text);

      // أرسل الرسالة للطرف الآخر
      socket.emit("sendMessage", {
        senderId: currentUser._id,
        receiverId: partner._id,
        message: res.data,
      });

      // ✅ أعد تحميل كل الرسائل من السيرفر لضمان ترتيبها وبياناتها
      const refreshed = await fetchMessages(conversation._id);
      setMessages(refreshed.data);

      setNewMessage("");
    } catch (err) {
      console.error("❌ Failed to send message:", err);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isReady) {
    return (
      <div className="flex-grow-1 d-flex align-items-center justify-content-center text-muted">
        Select a conversation to start messaging.
      </div>
    );
  }

  return (
    <div className="flex-grow-1 d-flex flex-column">
      <div className="border-bottom p-3 d-flex align-items-center">
        <img
          src={partner.profileImage || "/default-user.png"}
          alt="avatar"
          className="rounded-circle me-2"
          style={{ width: 40, height: 40, objectFit: "cover" }}
        />
        <div>
          <div className="fw-bold">{partner.name}</div>
          <div className="text-muted" style={{ fontSize: "0.85rem" }}>
            {partner.email}
          </div>
        </div>
      </div>

      <div className="flex-grow-1 overflow-auto px-3 py-2">
        {messages.map((msg, idx) => {
          const isMine =
            String(msg.sender?._id || msg.sender) === String(currentUser._id);

          return (
            <div
              key={idx}
              className={`d-flex mb-2 ${
                isMine ? "justify-content-end" : "justify-content-start"
              }`}
            >
              <div
                className={`p-2 rounded`}
                style={{
                  maxWidth: "70%",
                  backgroundColor: isMine ? "#0d6efd" : "#e2eefd",
                  color: isMine ? "#fff" : "#000",
                  alignSelf: isMine ? "flex-end" : "flex-start",
                }}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-top d-flex">
        <input
          type="text"
          className="form-control me-2"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          className="btn btn-primary"
          onClick={handleSend}
          disabled={!newMessage.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
