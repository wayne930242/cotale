# CoTale - TRPG AI Script Editor

A collaborative TRPG script editor with AI assistant to make creation easier.

## Features

- 🤝 **Real-time Collaboration**: Multiple users editing simultaneously with real-time sync
- 🤖 **AI Assistant**: Smart suggestions for plot development and character dialogue
- ✍️ **Professional Editor**: Editing environment designed specifically for TRPG scripts
- 🎨 **Beautiful Interface**: Modern user interface design

## Tech Stack

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling framework
- **Monaco Editor** - Code editor
- **Yjs** - Collaborative editing CRDT
- **Lucide React** - Icon library

### Backend
- **FastAPI** - Python web framework
- **WebSocket** - Real-time communication
- **SQLAlchemy** - ORM
- **OpenAI API** - AI functionality
- **Uvicorn** - ASGI server

## Quick Start

### 1. Install Dependencies

#### Frontend
```bash
cd cotale-frontend
pnpm install
```

#### Backend
```bash
cd cotale-backend
uv sync
```

### 2. Environment Setup

#### Frontend Environment Variables
Create `.env.local` in `cotale-frontend/` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

#### Backend Environment Variables
Create `.env` in `cotale-backend/` directory:
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

### 3. Start Services

#### Option A: Using Development Scripts (Recommended)

We provide convenient scripts to manage the development environment using tmux:

```bash
# Start both frontend and backend in tmux sessions
./start-dev.sh

# View logs from both services
./logs.sh

# Stop all development services
./stop-dev.sh
```

**Development Scripts Features:**
- **`start-dev.sh`**: Starts both frontend and backend in separate tmux windows
- **`logs.sh`**: Interactive log viewer with options to view backend logs, frontend logs, or enter full tmux interface
- **`stop-dev.sh`**: Stops all development services

**tmux Navigation:**
- `Ctrl+B` then `0` - Backend window
- `Ctrl+B` then `1` - Frontend window  
- `Ctrl+B` then `2` - Terminal window
- `Ctrl+B` then `d` - Detach from tmux (services keep running)

#### Option B: Manual Start

##### Start Backend API
```bash
cd cotale-backend
source .venv/bin/activate
python main.py
```
Backend will start at http://localhost:8000

##### Start Frontend
```bash
cd cotale-frontend
pnpm dev
```
Frontend will start at http://localhost:3000

### 4. Start Using

1. Open browser and visit http://localhost:3000
2. Click "Create New Script" or enter a script ID to join existing script
3. Start collaborative editing and using the AI assistant!

## Development URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **API Redoc**: http://localhost:8000/redoc

## Project Structure

```
CoTale/
├── cotale-frontend/             # Frontend Next.js project
│   ├── app/
│   │   ├── page.tsx            # Main page
│   │   └── editor/[documentId]/
│   │       └── page.tsx        # Editor page
│   ├── components/
│   │   └── MonacoEditor.tsx    # Monaco editor component
│   └── package.json
├── cotale-backend/              # Backend FastAPI project
│   ├── main.py                 # Main API entry point
│   └── pyproject.toml
├── start-dev.sh                # Start development environment
├── stop-dev.sh                 # Stop development environment
├── logs.sh                     # View development logs
└── README.md
```

## Development Phases

### Phase 1: MVP ✅
- [x] Basic Monaco + Yjs editor
- [x] Simple AI chat interface
- [x] Basic content insertion functionality
- [x] WebSocket connection architecture

### Phase 2: Collaboration Features (In Progress)
- [ ] Multi-user real-time editing
- [ ] Cursor sync and awareness
- [ ] Complete WebSocket architecture

### Phase 3: AI Enhancement
- [ ] Smart position analysis
- [ ] Context understanding
- [ ] Multiple AI assistant modes

### Phase 4: Payment System
- [ ] Patreon OAuth integration
- [ ] Credit system
- [ ] Usage statistics and limits

## Contributing

Issues and Pull Requests are welcome!

## License

MIT License 