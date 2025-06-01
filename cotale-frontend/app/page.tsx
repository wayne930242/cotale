"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";
import {
  FileText,
  Users,
  Zap,
  ArrowRight,
  LogIn,
  UserPlus,
  LogOut,
  User as UserIcon,
  FolderOpen,
} from "lucide-react";
import { config } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FeatureCard } from "@/components/ui/feature-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();
  const [documentId, setDocumentId] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const createNewDocument = () => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    const newDocId = Math.random().toString(36).substring(2, 15);
    router.push(`/editor/${newDocId}`);
  };

  const joinDocument = () => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    if (documentId.trim()) {
      router.push(`/editor/${documentId.trim()}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      joinDocument();
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
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
      description:
        "Smart suggestions for plot development and character dialogue",
      enabled: config.enableAiFeatures,
    },
    {
      icon: FileText,
      title: "Professional Editor",
      description: "Editing environment designed specifically for TRPG scripts",
      enabled: true,
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header with Auth Buttons */}
        <div className="flex justify-end mb-8">
          <div className="flex gap-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 text-white bg-white/10 px-4 py-2 rounded-lg border border-white/20">
                  <UserIcon className="w-4 h-4" />
                  <span>{user?.name}</span>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/30 hover:text-white hover:border-white/40 cursor-pointer transition-all duration-200"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/30 hover:text-white hover:border-white/40 cursor-pointer transition-all duration-200"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white cursor-pointer transition-all duration-200">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Main Content */}
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
          {isAuthenticated ? (
            <>
              <Button
                onClick={createNewDocument}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-6 text-lg cursor-pointer transition-all duration-200"
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
                  className="bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:opacity-50 text-white cursor-pointer disabled:cursor-not-allowed transition-all duration-200"
                >
                  Join
                </Button>
              </div>

              <div className="text-center text-slate-400 py-2">or</div>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full bg-white/10 border-white/20 text-white hover:bg-white/30 hover:text-white hover:border-white/40 cursor-pointer transition-all duration-200"
                  >
                    <FolderOpen className="w-5 h-5 mr-2" />
                    My Documents
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700 text-white">
                  <DialogHeader>
                    <DialogTitle>My Documents</DialogTitle>
                    <DialogDescription className="text-slate-300">
                      Choose from your existing documents. (Feature coming soon - backend API needed)
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <div className="text-center text-slate-400">
                      <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Document list will be available once the backend API is implemented.</p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          ) : (
            <div className="text-center space-y-6">
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Please Login to Continue
                </h2>
                <p className="text-slate-300 mb-6">
                  You need to login to create or edit TRPG scripts
                </p>
                <div className="flex gap-4 justify-center">
                  <Link href="/auth/login?redirect=/">
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white cursor-pointer transition-all duration-200">
                      <LogIn className="w-4 h-4 mr-2" />
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/register?redirect=/">
                    <Button
                      variant="outline"
                      className="bg-white/10 border-white/20 text-white hover:bg-white/30 hover:text-white hover:border-white/40 cursor-pointer transition-all duration-200"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Register
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-slate-400">
          <p>© 2024 {config.appName} - Making TRPG creation more fun</p>
        </div>
      </div>
    </div>
  );
}
