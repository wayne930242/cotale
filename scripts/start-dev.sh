#!/bin/bash

# CoTale development environment startup script

SESSION_NAME="cotale-dev"

# Check if there's already a running session
if tmux has-session -t $SESSION_NAME 2>/dev/null; then
    echo "⚠️  CoTale development environment is already running!"
    echo "💡 Use 'tmux attach -t $SESSION_NAME' to connect to existing session"
    echo "💡 Or use './stop-dev.sh' to stop and restart"
    exit 1
fi

echo "🚀 Starting CoTale development environment..."

# Create new tmux session
tmux new-session -d -s $SESSION_NAME

# Set first window as backend
tmux rename-window -t $SESSION_NAME:0 'Backend'
tmux send-keys -t $SESSION_NAME:0 'cd cotale-backend' C-m
tmux send-keys -t $SESSION_NAME:0 'source .venv/bin/activate' C-m
tmux send-keys -t $SESSION_NAME:0 'python main.py' C-m

# Create second window for frontend
tmux new-window -t $SESSION_NAME -n 'Frontend'
tmux send-keys -t $SESSION_NAME:1 'cd cotale-frontend' C-m
tmux send-keys -t $SESSION_NAME:1 'pnpm dev' C-m

# Create third window for terminal
tmux new-window -t $SESSION_NAME -n 'Terminal'
tmux send-keys -t $SESSION_NAME:2 'echo "🎉 CoTale development environment started!"' C-m
tmux send-keys -t $SESSION_NAME:2 'echo "📱 Frontend: http://localhost:3000"' C-m
tmux send-keys -t $SESSION_NAME:2 'echo "🔧 Backend: http://localhost:8000"' C-m
tmux send-keys -t $SESSION_NAME:2 'echo "📊 API Docs: http://localhost:8000/docs"' C-m
tmux send-keys -t $SESSION_NAME:2 'echo ""' C-m
tmux send-keys -t $SESSION_NAME:2 'echo "💡 Use Ctrl+B then number keys to switch windows"' C-m
tmux send-keys -t $SESSION_NAME:2 'echo "💡 Use ./stop-dev.sh to stop development environment"' C-m

# Switch to terminal window
tmux select-window -t $SESSION_NAME:2

echo "✅ CoTale development environment startup complete!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:8000"
echo "📊 API Docs: http://localhost:8000/docs"
echo ""
echo "💡 Use the following command to connect to development environment:"
echo "   tmux attach -t $SESSION_NAME"
echo ""
echo "💡 Use the following command to stop development environment:"
echo "   ./stop-dev.sh" 