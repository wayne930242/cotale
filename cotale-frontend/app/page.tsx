'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FileText, Users, Zap, ArrowRight } from 'lucide-react';
import { config } from '@/lib/config';

export default function Home() {
  const router = useRouter();
  const [documentId, setDocumentId] = useState('');

  const createNewDocument = () => {
    const newDocId = Math.random().toString(36).substring(2, 15);
    router.push(`/editor/${newDocId}`);
  };

  const joinDocument = () => {
    if (documentId.trim()) {
      router.push(`/editor/${documentId.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-6">
            {config.appName.split('').map((char, index) => 
              index === 2 ? (
                <span key={index} className="text-purple-400">{char}</span>
              ) : char
            )}
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            協作式 TRPG 劇本編輯器，結合 AI 助手讓創作更輕鬆
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {config.enableCollaboration && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <Users className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">即時協作</h3>
              <p className="text-slate-300">多人同時編輯，即時同步變更</p>
            </div>
          )}
          {config.enableAiFeatures && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <Zap className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">AI 助手</h3>
              <p className="text-slate-300">智慧建議劇情發展和角色對話</p>
            </div>
          )}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
            <FileText className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">專業編輯</h3>
            <p className="text-slate-300">專為 TRPG 劇本設計的編輯環境</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="max-w-md mx-auto space-y-4">
          <button
            onClick={createNewDocument}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <FileText className="w-5 h-5" />
            建立新劇本
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="text-center text-slate-400">或</div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="輸入劇本 ID"
              value={documentId}
              onChange={(e) => setDocumentId(e.target.value)}
              className="flex-1 bg-white/10 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-400"
              onKeyPress={(e) => e.key === 'Enter' && joinDocument()}
            />
            <button
              onClick={joinDocument}
              disabled={!documentId.trim()}
              className="bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              加入
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-slate-400">
          <p>© 2024 {config.appName} - 讓 TRPG 創作更有趣</p>
        </div>
      </div>
    </div>
  );
}
