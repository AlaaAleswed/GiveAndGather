// ChatBox.jsx
import React, { useEffect, useRef, useState } from "react";
import { fetchMessages, sendMessage, deleteMessage } from "../api";
import socket from "../sockets/socket";
import { useUser } from "../context/UserContext";
import {
  FiImage,
  FiVideo,
  FiFileText,
  FiMic,
  FiTrash2,
  FiMapPin,
  FiPlus,
  FiStopCircle,
} from "react-icons/fi";

const ChatBox = ({ conversation, partner }) => {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showOptions, setShowOptions] = useState(false);
  const [recording, setRecording] = useState(false);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const isReady = conversation?._id && partner?._id;
  const googleMapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const { user: currentUser } = useUser();

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
    if (!conversation?._id) return;
    fetchMessages(conversation._id).then((res) => setMessages(res.data || []));
  }, [conversation?._id]);

  // useEffect(() => {
  //   const handleIncoming = (incoming) => {
  //     if (incoming.conversationId === conversation?._id) {
  //       console.log("📩 Real-time message:", incoming);
  //       // إعادة تحميل كل الرسائل
  //       fetchMessages(conversation._id).then((res) => {
  //         setMessages(res.data || []); }); }};
  //   socket.on("newMessage", handleIncoming);
  //   return () => socket.off("newMessage", handleIncoming);
  // }, [conversation?._id, conversation?.triggerRefresh]);

  useEffect(() => {
    const handleIncoming = (msg) => {
      if (msg.conversationId === conversation?._id) {
        setMessages((prev) => [...prev, msg]);}};
    const handleDeleted = ({ messageId, conversationId }) => {
      if (conversationId === conversation._id) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId
              ? { ...msg, deleted: true, content: "", attachment: null }
              : msg));}};
    socket.on("newMessage", handleIncoming);
    socket.on("messageDeleted", handleDeleted);
    return () => {
      socket.off("newMessage", handleIncoming);
      socket.off("messageDeleted", handleDeleted);
    };
  }, [conversation?._id]);

    const autoHide = () => setShowOptions(false);

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

  const handleUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("conversationId", conversation._id);
    try {
      const res = await fetch("http://localhost:5050/api/messages", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await res.json();
      socket.emit("sendMessage", {
        senderId: currentUser._id,
        receiverId: partner._id,
        message: data,
      });
      setMessages((prev) => [...prev, data]);
      autoHide();
    } catch (err) {
      console.error("❌ Upload failed:", err);
    }
  };

  const sendLocation = () => {
    if (!navigator.geolocation)
      return alert("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      try {
        const res = await fetch("http://localhost:5050/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            type: "location",
            content: `https://www.google.com/maps?q=${lat},${lng}`,
            location: { lat, lng },
            conversationId: conversation._id,
            receiver: partner._id,
          }),
        });
        const data = await res.json();
        socket.emit("sendMessage", {
          senderId: currentUser._id,
          receiverId: partner._id,
          message: data,
        });
        setMessages((prev) => [...prev, data]);
        autoHide();
      } catch (err) {
        console.error("❌ Failed to send location:", err);
      }
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const formData = new FormData();
        formData.append("file", blob, "voice-message.webm");
        formData.append("conversationId", conversation._id);

        const res = await fetch("http://localhost:5050/api/messages", {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        const data = await res.json();
        socket.emit("sendMessage", {
          senderId: currentUser._id,
          receiverId: partner._id,
          message: data,
        });
        setMessages((prev) => [...prev, data]);
      };

      recorder.start();
      setRecording(true);
    } catch (err) {
      console.error("🎤 Error accessing mic:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMessage(id);
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === id
            ? { ...msg, deleted: true, content: "", attachment: null }
            : msg
        )
      );
      socket.emit("messageDeleted", {
        messageId: id,
        conversationId: conversation._id,
      });
    } catch (err) {
      console.error("❌ Delete error:", err);
    }
  };

  if (!isReady || !partner) {
    return (
      <div className="flex-grow-1 d-flex align-items-center justify-content-center text-muted">
        Loading chat...
      </div>
    );
  }

  return (
    <div className="flex-grow-1 d-flex flex-column">
      <div className="border-bottom p-3 d-flex align-items-center">
        <img
          src={partner?.profileImage || "/default-user.png"}
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
                className="p-2 rounded position-relative"
                style={{ maxWidth: "70%",
                  backgroundColor: isMine ? "#0d6efd" : "#e2eefd",
                  color: isMine ? "#fff" : "#000",
                  alignSelf: isMine ? "flex-end" : "flex-start", }}
              >
                {isMine && !msg.deleted && (
                  <FiTrash2
                    onClick={() => handleDelete(idx)}
                    style={{
                      cursor: "pointer",
                      position: "absolute",
                      left: -28,
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  />
                )}
                {msg.deleted ? (
                  <em className="text-muted">This message was deleted</em>
                ) : msg.type === "text" ? (
                  msg.content
                ) : msg.type === "image" ? (
                  <img
                    src={`http://localhost:5050/uploads/${msg.attachment}`}
                    alt="img"
                    style={{ maxWidth: 200 }}
                  />
                ) : msg.type === "video" ? (
                  <video
                    controls
                    src={`http://localhost:5050/uploads/${msg.attachment}`}
                    style={{ maxWidth: 250 }}
                  />
                ) : msg.type === "audio" ? (
                  <audio
                    controls
                    src={`http://localhost:5050/uploads/${msg.attachment}`}
                    style={{ height: 28 }}
                  />
                ) : msg.type === "file" ? (
                  <a
                    href={`http://localhost:5050/uploads/${msg.attachment}`}
                    download
                  >
                    Download File
                  </a>
                ) : msg.type === "location" &&
                  msg.location?.lat &&
                  msg.location?.lng ? (
                  <iframe
                    title="Google Maps"
                    width="250"
                    height="180"
                    style={{ border: 0, borderRadius: 8 }}
                    src={`https://www.google.com/maps/embed/v1/view?key=${googleMapsKey}&center=${msg.location.lat},${msg.location.lng}&zoom=16`}
                    allowFullScreen
                  ></iframe>
                ) : null}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-top d-flex align-items-center">
        <div className="position-relative me-2">
          <button
            className="btn btn-light border"
            onClick={() => setShowOptions(!showOptions)}
          >
            <FiPlus />
          </button>
          {showOptions && (
            <div
              className="position-absolute bg-white border rounded shadow p-2"
              style={{ bottom: "100%", left: 0, zIndex: 10 }}
            >
              <label className="d-block mb-1" style={{ cursor: "pointer" }}>
                <FiImage /> Image
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => handleUpload(e, "image")}
                />
              </label>
              <label className="d-block mb-1" style={{ cursor: "pointer" }}>
                <FiVideo /> Video
                <input
                  type="file"
                  accept="video/*"
                  hidden
                  onChange={(e) => handleUpload(e, "video")}
                />
              </label>
              <label className="d-block mb-1" style={{ cursor: "pointer" }}>
                <FiFileText /> File
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.zip,.rar"
                  hidden
                  onChange={(e) => handleUpload(e, "file")}
                />
              </label>
              <button
                className="d-block mb-1 text-start"
                onClick={sendLocation}
              >
                <FiMapPin /> Location
              </button>
            </div>
          )}
        </div>

        <input
          type="text"
          className="form-control me-2"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />

        {recording ? (
          <button className="btn btn-danger " onClick={stopRecording}>
            <FiStopCircle /> Stop
          </button>
        ) : (
          <button className="btn btn-secondary " onClick={startRecording}>
            <FiMic /> Record
          </button>
        )}

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
