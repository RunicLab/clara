"use client";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, MessageSquare, Minimize2 } from "lucide-react";
import { useEvent } from "@/contexts/EventContext";
import { BotIcon } from "@/public/icons";

interface Message {
  id: number;
  text: string;
  sender: "user" | "ai" | "system";
  isLoading?: boolean;
}

interface ChatBotProps {
  onSendMessage: (
    message: string,
    conversationHistory: Message[]
  ) => Promise<any>;
  onCalendarRefresh: () => Promise<void>;
}

export default function ChatBot({
  onSendMessage,
  onCalendarRefresh,
}: ChatBotProps) {
  const { selectedEvent, handleEventSelection } = useEvent();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your AI assistant. I can help you manage your calendar, schedule events, or answer any questions you have.",
      sender: "ai",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const scrollAreaRef = useRef<any>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef?.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Handle event selection from calendar
  useEffect(() => {
    if (selectedEvent) {
      const eventMessage = {
        id: Date.now(),
        text: `Selected event: "${
          selectedEvent.title
        }" on ${selectedEvent.start.toLocaleDateString()} at ${selectedEvent.start.toLocaleTimeString()}`,
        sender: "system",
      } as Message;
      setMessages((prev) => [...prev, eventMessage]);
    }
  }, [selectedEvent]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      sender: "user",
    };

    // Add user message immediately
    setMessages((prev) => [...prev, userMessage]);
    setConversationHistory((prev) => [...prev, userMessage]);

    // Add loading message
    const loadingMessage: Message = {
      id: Date.now() + 1,
      text: "Clara is thinking...",
      sender: "ai",
      isLoading: true,
    };
    setMessages((prev) => [...prev, loadingMessage]);

    const currentInput = inputValue;
    setInputValue("");
    setIsLoading(true);

    try {
      const data = await onSendMessage(currentInput, conversationHistory);

      // Remove loading message and add AI response
      setMessages((prev) => {
        const withoutLoading = prev.filter((msg) => !msg.isLoading);
        const aiMessage: Message = {
          id: Date.now() + 2,
          text:
            data.message ||
            "I apologize, but I encountered an error processing your request.",
          sender: "ai",
        };
        return [...withoutLoading, aiMessage];
      });

      // Update conversation history
      setConversationHistory((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          text: data.message || "Error occurred",
          sender: "ai",
        },
      ]);

      // Refresh calendar events in case they were modified
      await onCalendarRefresh();
    } catch (error) {
      console.error("Error sending message:", error);

      // Remove loading message and show error
      setMessages((prev) => {
        const withoutLoading = prev.filter((msg) => !msg.isLoading);
        return [
          ...withoutLoading,
          {
            id: Date.now() + 3,
            text: "Sorry, I'm having trouble connecting right now. Please try again.",
            sender: "ai",
          },
        ];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: any) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <Card className="h-full shadow-lg border border-gray-100 rounded-xl md:rounded-2xl flex flex-col min-h-0 !py-0 !pb-3.5 !gap-0 bg-white">
      <CardHeader className="flex-shrink-0 bg-gray-50/50 border-b border-gray-100 rounded-t-xl md:rounded-t-2xl !py-0">
        <CardTitle className="flex items-center justify-between text-sm md:text-lg">
          <div className="flex items-center gap-2 md:gap-3 pt-2">
            <BotIcon />
            <div>
              <div
                className="font-bold text-gray-800 text-sm md:text-base"
                style={{ fontFamily: "Roboto" }}
              >
                Clara
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="hidden sm:inline">Online</span>
                <span className="sm:hidden">●</span>
              </div>
            </div>
          </div>
          {/* <Minimize2 className="h-4 w-4 md:h-5 md:w-5" /> */}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 min-h-0 relative">
        {/* Messages Area - Scrollable */}
        <div className="flex-1 min-h-0 overflow-hidden bg-white">
          <ScrollArea ref={scrollAreaRef} className="h-full">
            <div className="p-2 sm:p-4 space-y-2 sm:space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[90%] sm:max-w-[85%] p-2 sm:p-3 rounded-lg text-xs sm:text-sm break-words shadow-sm relative ${
                      message.sender === "user"
                        ? "bg-gray-50 border border-gray-200 text-gray-800 rounded-br-sm"
                        : message.sender === "system"
                        ? "bg-blue-100 border border-blue-200 text-blue-800 rounded-bl-sm"
                        : "bg-blue-100 border border-blue-200 text-blue-800 rounded-bl-sm"
                    }`}
                    style={{ fontFamily: "Roboto" }}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Floating Input Area */}
        <div className="flex-shrink-0 px-2 sm:px-4 pt-2 sm:pt-4 bg-white border-t border-gray-100">
          {/* Input Area */}
          <div className="flex space-x-1 sm:space-x-2">
            <Input
              placeholder="Ask clara about your calendar..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-1 text-xs sm:text-sm rounded-xl sm:rounded-2xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-gray-50 placeholder:text-gray-500 h-8 sm:h-9"
              style={{ fontFamily: "Roboto" }}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              size="icon"
              className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl sm:rounded-2xl flex-shrink-0 shadow-sm h-8 w-8 sm:h-9 sm:w-9"
            >
              <Send className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
