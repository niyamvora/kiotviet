/**
 * AI Panel component for the KiotViet Dashboard
 * Provides AI-powered insights and chat functionality (UI only for now)
 */

"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

const mockConversation = [
  {
    type: "ai",
    message:
      "Hello! I'm your KiotViet AI assistant. I can help you analyze your business data, understand trends, and make better decisions. What would you like to know?",
  },
  {
    type: "user",
    message: "What are my top selling products this month?",
  },
  {
    type: "ai",
    message:
      "Based on your sales data, here are your top 3 products this month:\n\n1. 150ML Dầu massage thuần chay - 145 units sold\n2. Kem dưỡng da mặt - 89 units sold\n3. Sữa rửa mặt organic - 76 units sold\n\nYour skincare category is performing exceptionally well with a 23% increase compared to last month.",
  },
];

export function AIPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const { t } = useLanguage();

  const handleSendMessage = () => {
    if (message.trim()) {
      // This would integrate with AI service in the future
      console.log("Sending message:", message);
      setMessage("");
    }
  };

  return (
    <div className="hidden lg:flex lg:w-80 lg:flex-col bg-card border-l h-full">
      <div className="p-4 border-b flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">AI Assistant</h3>
            <p className="text-xs text-muted-foreground">
              Business Intelligence
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {mockConversation.map((item, index) => (
              <div
                key={index}
                className={`flex ${
                  item.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[280px] rounded-lg p-3 ${
                    item.type === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{item.message}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="p-4 border-t flex-shrink-0">
        <div className="flex gap-2">
          <Input
            placeholder="Ask about your business..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <Button size="icon" onClick={handleSendMessage}>
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3" />
          <span>Powered by AI • Coming Soon</span>
        </div>
      </div>
    </div>
  );
}
