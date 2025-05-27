const users = new Map();
const Message = require("./models/Message");
const Conversation = require("./models/Conversation");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("🔌 New socket connected:", socket.id);

    // ✅ تسجيل المستخدم عند الاتصال
    socket.on("register", (userId) => {
      const uid = String(userId);
      users.set(uid, socket.id);
      console.log(`✅ Registered user: ${uid} with socket ${socket.id}`);
      console.log("🧾 Current active users map:", users);
    });

    // ✅ إرسال رسالة
    socket.on("sendMessage", async ({ senderId, receiverId, message }) => {
      try {
        const receiverSocket = users.get(String(receiverId));

        // ✅ تحميل الرسالة من قاعدة البيانات مع بيانات المرسل والمستقبل
        const fullMessage = await Message.findById(message._id)
          .populate("sender", "name profileImage")
          .populate("receiver", "name profileImage");

        if (receiverSocket) {
          io.to(receiverSocket).emit("newMessage", {
            ...fullMessage.toObject(),
            conversationId: message.conversationId,
          });

          io.to(receiverSocket).emit("newMessageNotification", {
            senderId,
            messagePreview: message.content,
            timestamp: Date.now(),
          });

          console.log("✅ Message relayed via socket:", fullMessage._id);
        } else {
          console.warn("⚠️ Receiver is not connected to socket:", receiverId);
        }
      } catch (err) {
        console.error("❌ Socket sendMessage error:", err.message);
      }
    });

    // ✅ عند فصل الاتصال
    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.id);
      for (let [userId, id] of users.entries()) {
        if (id === socket.id) {
          users.delete(userId);
          console.log(`🗑️ Removed user ${userId} from active sockets`);
          break;
        }
      }
    });
  });
};
