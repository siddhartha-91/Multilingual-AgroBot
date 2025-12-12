"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ChatBox() {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hello! How can I help you today? 🌿" }
  ]);

  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    const res = await fetch("/api/mock/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    });

    const data = await res.json();

    setMessages((prev) => [...prev, { role: "ai", text: data.reply }]);

    setInput("");
  }

  return (
    <Card className="w-full max-w-xl p-4 shadow-lg bg-white rounded-xl fade-in">
      <h2 className="text-2xl font-bold text-green-700 mb-4">
        KissanAI Assistant 🤖
      </h2>

      <div className="h-[450px] overflow-y-auto mb-4 p-2 bg-green-50 rounded-md">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-3 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`p-3 rounded-lg max-w-[75%] ${
              msg.role === "user" ? "bg-green-600 text-white" : "bg-white border border-green-300 text-green-800"
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef}></div>
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 border border-green-400 rounded-md p-2"
          placeholder="Ask something..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button className="bg-green-600" onClick={sendMessage}>
          Send
        </Button>
      </div>
    </Card>
  );
}
