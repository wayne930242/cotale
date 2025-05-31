"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Users, MessageSquare, Send, Loader2 } from "lucide-react";
import { config } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage } from "@/components/ui/chat-bubble";
import { ChatInput } from "@/components/ui/chat-input";
import { ChatMessageList } from "@/components/ui/chat-message-list";

// Dynamically load Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import("@/components/MonacoEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
    </div>
  ),
});

interface User {
  id: string;
  name: string;
}

interface ChatMessage {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
}

export default function EditorPage() {
  const params = useParams();
  const documentId = params.documentId as string;

  const [users, setUsers] = useState<User[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Simulate user data
  useEffect(() => {
    setUsers([
      { id: "1", name: "You" },
      { id: "2", name: "Alice" },
    ]);

    // Welcome message
    setChatMessages([
      {
        id: "1",
        type: "ai",
        content: `Welcome to ${config.appName}! I'm your AI assistant, here to help you create TRPG scripts. You can ask me for suggestions about plot development, character creation, or dialogue writing.`,
        timestamp: new Date(),
      },
    ]);
  }, []);

  const sendMessage = async () => {
    if (!currentMessage.trim() || !config.enableAiFeatures) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: currentMessage,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setCurrentMessage("");
    setIsAiThinking(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: `Based on your prompt "${userMessage.content}", I suggest you consider the following points:\n\n1. Add conflicts between characters to drive the plot\n2. Include unexpected events to increase dramatic tension\n3. Ensure each character has clear motivations\n\nWhere in your script would you like me to help you incorporate these elements?`,
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, aiMessage]);
      setIsAiThinking(false);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-white">
              {config.appName.split("").map((char, index) =>
                index === 2 ? (
                  <span key={index} className="text-purple-400">
                    {char}
                  </span>
                ) : (
                  char
                )
              )}
            </h1>
            <Badge variant="secondary" className="bg-slate-700 text-slate-300">
              Script ID: {documentId}
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            {/* Collaborative users */}
            {config.enableCollaboration && (
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-slate-400" />
                <div className="flex -space-x-2">
                  {users.map((user) => (
                    <Avatar
                      key={user.id}
                      className="w-8 h-8 border-2 border-slate-800"
                    >
                      <AvatarFallback className="bg-purple-500 text-white text-sm">
                        {user.name[0]}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* AI Chat Panel */}
        {config.enableAiFeatures && (
          <Card className="w-80 bg-slate-800 border-slate-700 rounded-none border-r border-t-0 border-b-0 border-l-0 flex flex-col">
            <CardHeader className="border-b border-slate-700">
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                AI Assistant
              </CardTitle>
            </CardHeader>

            {/* Chat Messages using shadcn-chat components */}
            <CardContent className="flex-1 p-0">
              <ChatMessageList className="h-full">
                {chatMessages.map((message) => (
                  <ChatBubble
                    key={message.id}
                    variant={message.type === "user" ? "sent" : "received"}
                  >
                    <ChatBubbleAvatar
                      fallback={message.type === "user" ? "U" : "AI"}
                      className="w-8 h-8"
                    />
                    <ChatBubbleMessage
                      variant={message.type === "user" ? "sent" : "received"}
                    >
                      {message.content}
                      <div className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </ChatBubbleMessage>
                  </ChatBubble>
                ))}

                {isAiThinking && (
                  <ChatBubble variant="received">
                    <ChatBubbleAvatar fallback="AI" className="w-8 h-8" />
                    <ChatBubbleMessage variant="received" isLoading />
                  </ChatBubble>
                )}
              </ChatMessageList>
            </CardContent>

            {/* Chat Input */}
            <div className="p-4 border-t border-slate-700">
              <div className="flex gap-2">
                <ChatInput
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask AI assistant..."
                  className="flex-1 bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-purple-400"
                  disabled={isAiThinking}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!currentMessage.trim() || isAiThinking}
                  size="icon"
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Editor Panel */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-slate-700 bg-slate-800">
            <h2 className="text-lg font-semibold text-white">Script Editor</h2>
          </div>

          <div className="flex-1">
            <MonacoEditor documentId={documentId} />
          </div>
        </div>
      </div>
    </div>
  );
}
