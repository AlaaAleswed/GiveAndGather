import React, { useEffect, useState } from "react";

const messages = [
  "🎉 Thank you for your kindness. You just made someone's day.",
  "💖 Your donation brought hope to someone in need.",
  "🌟 You've changed a life today. Thank you!",
  "🙏 Someone out there is grateful for your generosity.",
  "💫 Your kindness lights up the world.",
  "😊 Your help means the world to someone.",
  "👐 You just gave someone a second chance.",
  "🎁 A gift of hope has been delivered—thanks to you!",
];

const ThankYouModal = ({ isOpen, onClose }) => {
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      const randomIndex = Math.floor(Math.random() * messages.length);
      setMessage(messages[randomIndex]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-green-600 mb-4">Thank You!</h2>
        <p className="text-gray-700 mb-6">{message}</p>
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ThankYouModal;
