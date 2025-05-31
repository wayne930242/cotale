# CoTale Backend

CoTale TRPG 協作劇本編輯器的後端 API 服務。

## 功能特色

- 🚀 FastAPI 高效能 Web 框架
- 🔌 WebSocket 即時協作
- 🤖 AI 助手整合 (OpenAI)
- 🔐 JWT 認證系統
- 📊 SQLAlchemy ORM
- 🌐 CORS 跨域支援

## 環境需求

- Python 3.9+
- uv (Python 套件管理器)

## 快速開始

### 1. 安裝依賴

```bash
# 使用 uv 安裝所有依賴
uv sync
```

### 2. 環境變數設定

複製環境變數範例檔案：

```bash
cp env.example .env
```

編輯 `.env` 檔案，設定你的環境變數：

```bash
# 伺服器配置
HOST=0.0.0.0
PORT=8000
DEBUG=true

# CORS 配置
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# OpenAI 配置 (可選)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4

# 資料庫配置
DATABASE_URL=sqlite:///./cotale.db

# JWT 配置
SECRET_KEY=your_secret_key_here
```

### 3. 啟動服務

```bash
# 使用啟動腳本
uv run python run.py

# 或直接使用 uvicorn
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 4. 驗證服務

開啟瀏覽器訪問：
- API 文檔: http://localhost:8000/docs
- 健康檢查: http://localhost:8000/api/health

## 環境變數說明

| 變數名稱 | 預設值 | 說明 |
|---------|--------|------|
| `HOST` | `0.0.0.0` | 伺服器綁定的主機地址 |
| `PORT` | `8000` | 伺服器端口 |
| `DEBUG` | `true` | 除錯模式 |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | CORS 允許的來源 |
| `DATABASE_URL` | `sqlite:///./cotale.db` | 資料庫連接字串 |
| `OPENAI_API_KEY` | - | OpenAI API 金鑰 |
| `OPENAI_MODEL` | `gpt-4` | OpenAI 模型名稱 |
| `SECRET_KEY` | - | JWT 簽名密鑰 |
| `LOG_LEVEL` | `INFO` | 日誌等級 |

## API 端點

### 基本端點
- `GET /` - 根路徑
- `GET /api/health` - 健康檢查

### WebSocket 端點
- `WS /ws/{document_id}` - 文件協作 WebSocket

## 開發

### 程式碼結構

```
cotale-backend/
├── main.py          # FastAPI 應用程式主檔案
├── config.py        # 配置管理
├── run.py           # 啟動腳本
├── env.example      # 環境變數範例
├── pyproject.toml   # 專案配置和依賴
└── README.md        # 說明文件
```

### 新增依賴

```bash
# 新增生產依賴
uv add package_name

# 新增開發依賴
uv add --dev package_name
```

### 執行測試

```bash
# 安裝測試依賴
uv add --dev pytest pytest-asyncio

# 執行測試
uv run pytest
```

## 部署

### Docker 部署

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY . .

RUN pip install uv
RUN uv sync --frozen

EXPOSE 8000
CMD ["uv", "run", "python", "run.py"]
```

### 環境變數

生產環境請務必設定：
- `DEBUG=false`
- `SECRET_KEY` (強密碼)
- `OPENAI_API_KEY` (如需 AI 功能)
- `DATABASE_URL` (生產資料庫)

## 授權

MIT License
