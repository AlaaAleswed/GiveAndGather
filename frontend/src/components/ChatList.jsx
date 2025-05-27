import React, { useState, useEffect } from "react";

const ChatList = ({
  onSelectConversation,
  selectedId,
  conversations,
  currentUserId,
}) => {
  const [search, setSearch] = useState("");

  useEffect(() => {
    console.log("🔄 Conversations updated:", conversations);
  }, [conversations]);

  // ✨ استخراج محادثة واحدة لكل مستخدم
  const uniquePartners = new Map();
  conversations
    .filter((conv) => {
      const partner = conv.users?.find(
        (u) => String(u._id) !== String(currentUserId)
      );
      return partner;
    })
    .forEach((conv) => {
      const partner = conv.users.find(
        (u) => String(u._id) !== String(currentUserId)
      );
      if (partner && !uniquePartners.has(partner._id)) {
        uniquePartners.set(partner._id, { conv, partner });
      }
    });

  // ✅ تصفية نتائج المحادثات حسب الاسم
  const filteredConversations = Array.from(uniquePartners.values()).filter(
    ({ partner }) =>
      partner.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="w-100 border-end bg-white p-3 shadow-sm"
      style={{ maxWidth: 300 }}
    >
      <h5 className="fw-bold mb-3">Messages</h5>

      {/* 🔍 Search box */}
      <input
        className="form-control mb-3"
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* 💬 Filtered Conversations */}
      <div>
        {filteredConversations.length > 0 ? (
          filteredConversations.map(({ conv, partner }) => {
            const isSelected = String(partner._id) === String(selectedId);
            const messageText =
              typeof conv.lastMessage === "string"
                ? conv.lastMessage
                : conv.lastMessage?.content;

            return (
              <div
                key={conv._id}
                onClick={() => onSelectConversation(conv, partner)}
                className={`d-flex align-items-center p-2 rounded mb-2 ${
                  isSelected ? "bg-primary text-white" : "hover-bg"
                }`}
                style={{ cursor: "pointer" }}
              >
                <img
                  src={partner.profileImage || "/default-user.png"}
                  alt="avatar"
                  className="rounded-circle me-2"
                  style={{ width: 35, height: 35, objectFit: "cover" }}
                />
                <div>
                  <strong>{partner.name}</strong>
                  <div
                    className={`small ${
                      isSelected ? "text-white" : "text-muted"
                    }`}
                  >
                    {messageText?.length > 30
                      ? messageText.substring(0, 30) + "..."
                      : messageText}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-muted text-center">No results match your search.</div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
