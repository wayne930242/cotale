'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Users, MessageSquare, Send, Loader2 } from 'lucide-react';
import { config } from '@/lib/config';

// 動態載入 Monaco 編輯器以避免 SSR 問題
const MonacoEditor = dynamic(() => import('@/components/MonacoEditor'), {
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
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export default function EditorPage() {
  const params = useParams();
  const documentId = params.documentId as string;
  
  const [users, setUsers] = useState<User[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [editorContent, setEditorContent] = useState('');

  // 模擬用戶資料
  useEffect(() => {
    setUsers([
      { id: '1', name: '你' },
      { id: '2', name: 'Alice' },
    ]);

    // 歡迎訊息
    setChatMessages([
      {
        id: '1',
        type: 'ai',
        content: `歡迎來到 ${config.appName}！我是您的 AI 助手，可以幫助您創作 TRPG 劇本。您可以詢問我關於劇情發展、角色設定或對話撰寫的建議。`,
        timestamp: new Date(),
      },
    ]);
  }, []);

  const sendMessage = async () => {
    if (!currentMessage.trim() || !config.enableAiFeatures) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsAiThinking(true);

    // 模擬 AI 回應
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `根據您的提示「${userMessage.content}」，我建議您可以考慮以下幾點：\n\n1. 增加角色之間的衝突來推動劇情\n2. 加入一些意外事件來增加戲劇張力\n3. 確保每個角色都有明確的動機\n\n您希望我幫您在劇本中的哪個位置加入這些元素嗎？`,
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, aiMessage]);
      setIsAiThinking(false);
    }, 2000);
  };

  return (
    <div className="h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-white">
              {config.appName.split('').map((char, index) => 
                index === 2 ? (
                  <span key={index} className="text-purple-400">{char}</span>
                ) : char
              )}
            </h1>
            <span className="text-slate-400">劇本 ID: {documentId}</span>
          </div>
          
          <div className="flex items-center gap-4">
            {/* 協作用戶 */}
            {config.enableCollaboration && (
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-slate-400" />
                <div className="flex -space-x-2">
                  {users.map((user, index) => (
                    <div
                      key={user.id}
                      className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-medium border-2 border-slate-800"
                      title={user.name}
                    >
                      {user.name[0]}
                    </div>
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
          <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col">
            <div className="p-4 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                AI 助手
              </h2>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.type === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-700 text-slate-100'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {isAiThinking && (
                <div className="flex justify-start">
                  <div className="bg-slate-700 text-slate-100 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">AI 正在思考...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Chat Input */}
            <div className="p-4 border-t border-slate-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="詢問 AI 助手..."
                  className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-purple-400"
                  disabled={isAiThinking}
                />
                <button
                  onClick={sendMessage}
                  disabled={!currentMessage.trim() || isAiThinking}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:opacity-50 text-white p-2 rounded-lg transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Editor Panel */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-slate-700 bg-slate-800">
            <h2 className="text-lg font-semibold text-white">劇本編輯器</h2>
          </div>
          
          <div className="flex-1">
            <MonacoEditor
              documentId={documentId}
              onContentChange={setEditorContent}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 