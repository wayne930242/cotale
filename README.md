# CoTale - TRPG AI Script Editor

A collaborative TRPG script editor with AI assistant to make creation easier.

## Features

- 🤝 **Real-time Collaboration**: Multiple users editing simultaneously with real-time sync
- 🤖 **AI Assistant**: Smart suggestions for plot development and character dialogue
- ✍️ **Professional Editor**: Editing environment designed specifically for TRPG scripts
- 🎨 **Beautiful Interface**: Modern user interface design
- 🧪 **Contract Testing**: Automated API contract validation between frontend and backend

## Tech Stack

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling framework
- **Monaco Editor** - Code editor
- **Yjs** - Collaborative editing CRDT
- **Lucide React** - Icon library
- **Jest** - Testing framework with contract testing

### Backend
- **FastAPI** - Python web framework
- **WebSocket** - Real-time communication
- **SQLAlchemy** - ORM
- **OpenAI API** - AI functionality
- **Uvicorn** - ASGI server
- **OpenAPI** - Automatic API documentation

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

#### Unified Environment Configuration

We use a single `.env` file at the root level to manage all environment variables:

```bash
# Copy the example file and configure your settings
cp env.example .env

# Edit the .env file with your actual values
# Update OPENAI_API_KEY, SECRET_KEY, and other settings as needed
```

Both frontend and backend will automatically read from the root `.env` file.

#### Environment Variables

The `.env` file contains all configuration for both frontend and backend:

- **Backend variables**: `HOST`, `PORT`, `DATABASE_URL`, `OPENAI_API_KEY`, `SECRET_KEY`, etc.
- **Frontend variables**: All variables prefixed with `NEXT_PUBLIC_`
- **Deployment**: Production URLs and database configuration (commented out)

### 3. Start Services

#### Option A: Using Development Scripts (Recommended)

We provide convenient scripts to manage the development environment using tmux:

```bash
# Start both frontend and backend in tmux sessions
./scripts/start-dev.sh

# View logs from both services
./scripts/logs.sh

# Stop all development services
./scripts/stop-dev.sh

# Update API schema and run contract tests
./scripts/update-schema.sh

# Sync environment variables from root .env to frontend/backend
```

**Development Scripts Features:**
- **`start-dev.sh`**: Starts both frontend and backend in separate tmux windows
- **`logs.sh`**: Interactive log viewer with options to view backend logs, frontend logs, or enter full tmux interface
- **`stop-dev.sh`**: Stops all development services
- **`update-schema.sh`**: Fetches latest OpenAPI schema from backend and runs contract tests

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

## Testing

### Contract Testing

We use contract testing to ensure API compatibility between frontend and backend:

```bash
# Run contract tests
cd cotale-frontend
npm run test:contract

# Update API schema and run tests
npm run update-schema

# Run all tests
npm test
```

**Contract Testing Features:**
- Validates API requests/responses against OpenAPI schema
- Ensures frontend service implementations match backend contracts
- Automatic schema validation for data types and formats
- Catches API breaking changes early

## Project Structure

```
CoTale/
├── env.example                  # Unified environment variables template
├── scripts/                     # Development and utility scripts
│   ├── start-dev.sh            # Start development environment
│   ├── stop-dev.sh             # Stop development environment
│   ├── logs.sh                 # View development logs
│   ├── update-schema.sh        # Update API schema and run tests
├── cotale-frontend/             # Frontend Next.js project
│   ├── app/
│   │   ├── page.tsx            # Main page
│   │   └── editor/[documentId]/
│   │       └── page.tsx        # Editor page
│   ├── components/
│   │   └── MonacoEditor.tsx    # Monaco editor component
│   ├── __test__/
│   │   └── contract/           # Contract testing
│   │       ├── auth.contract.test.ts
│   │       ├── schema-validator.ts
│   │       └── openapi-schema.json
│   └── package.json
├── cotale-backend/              # Backend FastAPI project
│   ├── main.py                 # Main API entry point
│   └── pyproject.toml
└── README.md
```

## Development Phases

### Phase 1: MVP ✅
- [x] Basic Monaco + Yjs editor
- [x] Simple AI chat interface
- [x] Basic content insertion functionality
- [x] WebSocket connection architecture
- [x] Contract testing setup
- [x] Development scripts and automation

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