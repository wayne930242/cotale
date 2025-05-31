"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FileText, Users, Zap, ArrowRight } from "lucide-react";
import { config } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FeatureCard } from "@/components/ui/feature-card";

export default function Home() {
  const router = useRouter();
  const [documentId, setDocumentId] = useState("");

  const createNewDocument = () => {
    const newDocId = Math.random().toString(36).substring(2, 15);
    router.push(`/editor/${newDocId}`);
  };

  const joinDocument = () => {
    if (documentId.trim()) {
      router.push(`/editor/${documentId.trim()}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      joinDocument();
    }
  };

  const features = [
    {
      icon: Users,
      title: "Real-time Collaboration",
      description: "Multiple users editing simultaneously with real-time sync",
      enabled: config.enableCollaboration,
    },
    {
      icon: Zap,
      title: "AI Assistant",
      description: "Smart suggestions for plot development and character dialogue",
      enabled: config.enableAiFeatures,
    },
    {
      icon: FileText,
      title: "Professional Editor",
      description: "Editing environment designed specifically for TRPG scripts",
      enabled: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-6">
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
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Collaborative TRPG script editor with AI assistant to make creation
            easier
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features
            .filter((feature) => feature.enabled)
            .map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
        </div>

        {/* Action Buttons */}
        <div className="max-w-md mx-auto space-y-4">
          <Button
            onClick={createNewDocument}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-6 text-lg"
            size="lg"
          >
            <FileText className="w-5 h-5 mr-2" />
            Create New Script
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <div className="text-center text-slate-400 py-2">or</div>

          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter script ID"
              value={documentId}
              onChange={(e) => setDocumentId(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-white/10 border-white/20 text-white placeholder-slate-400 focus:border-purple-400"
            />
            <Button
              onClick={joinDocument}
              disabled={!documentId.trim()}
              variant="secondary"
              className="bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:opacity-50 text-white"
            >
              Join
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-slate-400">
          <p>© 2024 {config.appName} - Making TRPG creation more fun</p>
        </div>
      </div>
    </div>
  );
}
