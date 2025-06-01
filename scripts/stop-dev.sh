#!/bin/bash

# CoTale development environment stop script

SESSION_NAME="cotale-dev"

if tmux has-session -t $SESSION_NAME 2>/dev/null; then
    echo "🛑 Stopping CoTale development environment..."
    tmux kill-session -t $SESSION_NAME
    echo "✅ Development environment stopped!"
else
    echo "ℹ️  CoTale development environment is not running"
fi 