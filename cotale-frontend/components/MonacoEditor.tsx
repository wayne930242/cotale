'use client';

import { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { config } from '@/lib/config';

// 設定 Monaco Editor 的 worker
if (typeof window !== 'undefined') {
  // 設定 Monaco Editor 的基礎路徑
  (window as any).MonacoEnvironment = {
    getWorkerUrl: function (moduleId: string, label: string) {
      const workerPath = config.monacoWorkerPath;
      if (label === 'json') {
        return `${workerPath}/json.worker.js`;
      }
      if (label === 'css' || label === 'scss' || label === 'less') {
        return `${workerPath}/css.worker.js`;
      }
      if (label === 'html' || label === 'handlebars' || label === 'razor') {
        return `${workerPath}/html.worker.js`;
      }
      if (label === 'typescript' || label === 'javascript') {
        return `${workerPath}/ts.worker.js`;
      }
      return `${workerPath}/editor.worker.js`;
    }
  };
}

interface MonacoEditorProps {
  documentId: string;
  onContentChange?: (content: string) => void;
}

export default function MonacoEditor({ documentId, onContentChange }: MonacoEditorProps) {
  const editorRef = useRef<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  useEffect(() => {
    // 模擬連接狀態
    const timer = setTimeout(() => {
      setConnectionStatus('connected');
      setIsConnected(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [documentId]);

  const handleEditorDidMount = (editor: any, monacoInstance: any) => {
    editorRef.current = editor;

    // 設定編輯器主題
    monacoInstance.editor.defineTheme('cotale-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955' },
        { token: 'keyword', foreground: 'C586C0' },
        { token: 'string', foreground: 'CE9178' },
      ],
      colors: {
        'editor.background': '#1e293b',
        'editor.foreground': '#e2e8f0',
        'editorLineNumber.foreground': '#64748b',
        'editorCursor.foreground': '#a855f7',
        'editor.selectionBackground': '#374151',
        'editor.lineHighlightBackground': '#334155',
      },
    });

    monacoInstance.editor.setTheme('cotale-dark');

    // 設定編輯器選項
    editor.updateOptions({
      fontSize: 14,
      lineHeight: 1.6,
      fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
      wordWrap: 'on',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
    });

    // 設定初始內容
    const initialContent = `# CoTale TRPG 劇本範例

## 場景：神秘的古堡

### 角色
- **艾莉絲**：勇敢的冒險者
- **湯姆**：機智的法師
- **莎拉**：敏捷的盜賊

### 劇情開始

**GM**：你們三人站在古堡的大門前，古老的石門上刻著神秘的符文，微風中傳來陣陣詭異的聲響...

**艾莉絲**：「這個地方給我一種不祥的預感，但我們必須進去尋找失蹤的村民。」

**湯姆**：「讓我先檢查一下這些符文，也許能找到一些線索。」
*進行奧秘檢定*

**GM**：湯姆，請投擲 1d20 + 你的奧秘修正值...

---

*在這裡繼續編寫您的劇本...*

## 遊戲機制

### 擲骰系統
- 基本檢定：1d20 + 屬性修正值
- 困難度等級：
  - 簡單：DC 10
  - 中等：DC 15
  - 困難：DC 20
  - 極難：DC 25

### 戰鬥規則
1. **先攻順序**：每位角色投擲 1d20 + 敏捷修正值
2. **攻擊檢定**：1d20 + 攻擊加值 vs 目標 AC
3. **傷害計算**：武器傷害 + 力量修正值

---

*歡迎使用 CoTale 編輯您的 TRPG 劇本！*
`;

    editor.setValue(initialContent);

    // 監聽內容變化
    editor.onDidChangeModelContent(() => {
      const content = editor.getValue();
      onContentChange?.(content);
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* 連接狀態指示器 */}
      <div className="px-4 py-2 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected'
                ? 'bg-green-400'
                : connectionStatus === 'connecting'
                ? 'bg-yellow-400'
                : 'bg-red-400'
            }`}
          />
          <span className="text-sm text-slate-300">
            {connectionStatus === 'connected'
              ? '編輯器已就緒'
              : connectionStatus === 'connecting'
              ? '載入中...'
              : '連接中斷'}
          </span>
        </div>
        
        <div className="text-xs text-slate-400">
          文件 ID: {documentId}
        </div>
      </div>

      {/* Monaco 編輯器 */}
      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage="markdown"
          onMount={handleEditorDidMount}
          loading={
            <div className="flex items-center justify-center h-full">
              <div className="text-slate-400">載入編輯器中...</div>
            </div>
          }
          options={{
            theme: 'vs-dark',
            fontSize: 14,
            lineHeight: 1.6,
            fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
            wordWrap: 'on',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
} 