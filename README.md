# CoTale - TRPG AI 劇本編輯器

一個協作式 TRPG 劇本編輯器，結合 AI 助手讓創作更輕鬆。

## 功能特色

- 🤝 **即時協作**：多人同時編輯，即時同步變更
- 🤖 **AI 助手**：智慧建議劇情發展和角色對話
- ✍️ **專業編輯**：專為 TRPG 劇本設計的編輯環境
- 🎨 **美觀介面**：現代化的使用者介面設計

## 技術棧

### 前端
- **Next.js 15** - React 框架
- **TypeScript** - 型別安全
- **Tailwind CSS** - 樣式框架
- **Monaco Editor** - 程式碼編輯器
- **Yjs** - 協作編輯 CRDT
- **Lucide React** - 圖標庫

### 後端
- **FastAPI** - Python Web 框架
- **WebSocket** - 即時通訊
- **SQLAlchemy** - ORM
- **OpenAI API** - AI 功能
- **Uvicorn** - ASGI 伺服器

## 快速開始

### 1. 安裝依賴

#### 前端
```bash
cd cotale-frontend
pnpm install
```

#### 後端
```bash
cd cotale-backend
uv sync
```

### 2. 環境設定

#### 前端環境變數
在 `cotale-frontend/` 目錄下建立 `.env.local`：
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

#### 後端環境變數
在 `cotale-backend/` 目錄下建立 `.env`：
```env
# Database
DATABASE_URL=sqlite:///./cotale.db

# OpenAI
OPENAI_API_KEY=your-openai-api-key-here

# Security
JWT_SECRET_KEY=your-super-secret-jwt-key-here

# CORS
ALLOWED_ORIGINS=http://localhost:3000
```

### 3. 啟動服務

#### 啟動後端 API
```bash
cd cotale-backend
source .venv/bin/activate
python main.py
```
後端將在 http://localhost:8000 啟動

#### 啟動前端
```bash
cd cotale-frontend
pnpm dev
```
前端將在 http://localhost:3000 啟動

### 4. 開始使用

1. 打開瀏覽器訪問 http://localhost:3000
2. 點擊「建立新劇本」或輸入劇本 ID 加入現有劇本
3. 開始協作編輯和使用 AI 助手！

## 專案結構

```
CoTale/
├── cotale-frontend/             # 前端 Next.js 專案
│   ├── app/
│   │   ├── page.tsx            # 主頁面
│   │   └── editor/[documentId]/
│   │       └── page.tsx        # 編輯器頁面
│   ├── components/
│   │   └── MonacoEditor.tsx    # Monaco 編輯器組件
│   └── package.json
├── cotale-backend/              # 後端 FastAPI 專案
│   ├── main.py                 # 主要 API 入口
│   └── pyproject.toml
└── README.md
```

## 開發階段

### Phase 1: MVP ✅
- [x] 基礎 Monaco + Yjs 編輯器
- [x] 簡單的 AI 對話介面
- [x] 基本的內容插入功能
- [x] WebSocket 連接架構

### Phase 2: 協作功能 (進行中)
- [ ] 多用戶即時編輯
- [ ] 游標同步和 awareness
- [ ] 完整的 WebSocket 架構

### Phase 3: AI 增強
- [ ] 智慧位置分析
- [ ] 上下文理解
- [ ] 多種 AI 助手模式

### Phase 4: 付費系統
- [ ] Patreon OAuth 整合
- [ ] Credit 系統
- [ ] 用量統計和限制

## 貢獻

歡迎提交 Issue 和 Pull Request！

## 授權

MIT License 