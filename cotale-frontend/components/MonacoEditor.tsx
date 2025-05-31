"use client";

import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { config } from "@/lib/config";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

// Configure Monaco Editor worker
if (typeof window !== "undefined") {
  // Set Monaco Editor base path
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as unknown as { MonacoEnvironment: any }).MonacoEnvironment = {
    getWorkerUrl: function (moduleId: string, label: string) {
      const workerPath = config.monacoWorkerPath;
      if (label === "json") {
        return `${workerPath}/json.worker.js`;
      }
      if (label === "css" || label === "scss" || label === "less") {
        return `${workerPath}/css.worker.js`;
      }
      if (label === "html" || label === "handlebars" || label === "razor") {
        return `${workerPath}/html.worker.js`;
      }
      if (label === "typescript" || label === "javascript") {
        return `${workerPath}/ts.worker.js`;
      }
      return `${workerPath}/editor.worker.js`;
    },
  };
}

interface MonacoEditorProps {
  documentId: string;
  onContentChange?: (content: string) => void;
}

export default function MonacoEditor({
  documentId,
  onContentChange,
}: MonacoEditorProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting");

  useEffect(() => {
    // Simulate connection status
    const timer = setTimeout(() => {
      setConnectionStatus("connected");
    }, 1000);

    return () => clearTimeout(timer);
  }, [documentId]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditorDidMount = (editor: any, monacoInstance: any) => {
    editorRef.current = editor;

    // Configure editor theme
    monacoInstance.editor.defineTheme("cotale-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6A9955" },
        { token: "keyword", foreground: "C586C0" },
        { token: "string", foreground: "CE9178" },
      ],
      colors: {
        "editor.background": "#1e293b",
        "editor.foreground": "#e2e8f0",
        "editorLineNumber.foreground": "#64748b",
        "editorCursor.foreground": "#a855f7",
        "editor.selectionBackground": "#374151",
        "editor.lineHighlightBackground": "#334155",
      },
    });

    monacoInstance.editor.setTheme("cotale-dark");

    // Configure editor options
    editor.updateOptions({
      fontSize: 14,
      lineHeight: 1.6,
      fontFamily: "JetBrains Mono, Consolas, Monaco, monospace",
      wordWrap: "on",
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
    });

    // Set initial content
    const initialContent = `# CoTale TRPG Script Example

## Scene: The Mysterious Castle

### Characters
- **Alice**: Brave adventurer
- **Tom**: Clever wizard
- **Sarah**: Agile rogue

### Story Begins

**GM**: You three stand before the castle gates. Ancient stone doors are carved with mysterious runes, and eerie sounds drift through the wind...

**Alice**: "This place gives me an ominous feeling, but we must enter to find the missing villagers."

**Tom**: "Let me examine these runes first, maybe I can find some clues."
*Makes an Arcana check*

**GM**: Tom, please roll 1d20 + your Arcana modifier...

---

*Continue writing your script here...*

## Game Mechanics

### Dice System
- Basic check: 1d20 + ability modifier
- Difficulty classes:
  - Easy: DC 10
  - Medium: DC 15
  - Hard: DC 20
  - Very Hard: DC 25

### Combat Rules
1. **Initiative**: Each character rolls 1d20 + Dexterity modifier
2. **Attack roll**: 1d20 + attack bonus vs target AC
3. **Damage calculation**: Weapon damage + Strength modifier

---

*Welcome to CoTale - Edit your TRPG scripts!*
`;

    editor.setValue(initialContent);

    // Listen for content changes
    if (onContentChange) {
      editor.onDidChangeModelContent(() => {
        const content = editor.getValue();
        onContentChange(content);
      });
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Connection status indicator */}
      <div className="px-4 py-2 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
        <StatusBadge status={connectionStatus} />

        <Badge
          variant="outline"
          className="text-xs text-slate-400 border-slate-600"
        >
          Document ID: {documentId}
        </Badge>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage="markdown"
          onMount={handleEditorDidMount}
          loading={
            <Card className="flex items-center justify-center h-full bg-slate-800 border-slate-700">
              <div className="text-slate-400">Loading editor...</div>
            </Card>
          }
          options={{
            theme: "vs-dark",
            fontSize: 14,
            lineHeight: 1.6,
            fontFamily: "JetBrains Mono, Consolas, Monaco, monospace",
            wordWrap: "on",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
}
