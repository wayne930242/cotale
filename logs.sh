#!/bin/bash

# CoTale development environment log viewer script

SESSION_NAME="cotale-dev"

# Check if development environment is running
if ! tmux has-session -t $SESSION_NAME 2>/dev/null; then
    echo "❌ CoTale development environment is not running!"
    echo "💡 Please run './start-dev.sh' first to start the development environment"
    exit 1
fi

echo "📋 CoTale development environment log viewer options:"
echo ""
echo "1️⃣  View backend logs (FastAPI)"
echo "2️⃣  View frontend logs (Next.js)"
echo "3️⃣  View all window status"
echo "4️⃣  Enter full tmux interface"
echo "0️⃣  Exit"
echo ""

while true; do
    read -p "Please select an option (1-4, 0 to exit): " choice
    
    case $choice in
        1)
            echo ""
            echo "🔧 Displaying backend logs..."
            echo "💡 Press Ctrl+C to return to menu"
            echo "----------------------------------------"
            tmux capture-pane -t $SESSION_NAME:0 -p
            echo "----------------------------------------"
            echo "💡 To view real-time backend logs, select option 4 to enter tmux, then press Ctrl+B followed by 0"
            echo ""
            ;;
        2)
            echo ""
            echo "📱 Displaying frontend logs..."
            echo "💡 Press Ctrl+C to return to menu"
            echo "----------------------------------------"
            tmux capture-pane -t $SESSION_NAME:1 -p
            echo "----------------------------------------"
            echo "💡 To view real-time frontend logs, select option 4 to enter tmux, then press Ctrl+B followed by 1"
            echo ""
            ;;
        3)
            echo ""
            echo "📊 All window status:"
            echo "----------------------------------------"
            tmux list-windows -t $SESSION_NAME
            echo "----------------------------------------"
            echo ""
            ;;
        4)
            echo ""
            echo "🚀 Entering full tmux interface..."
            echo "💡 tmux usage guide:"
            echo "   - Ctrl+B then 0 = Backend window"
            echo "   - Ctrl+B then 1 = Frontend window"
            echo "   - Ctrl+B then 2 = Terminal window"
            echo "   - Ctrl+B then d = Exit tmux (services continue running)"
            echo ""
            read -p "Press Enter to continue..."
            tmux attach -t $SESSION_NAME
            echo ""
            echo "📋 Exited tmux, back to log viewer menu"
            echo ""
            ;;
        0)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid option, please select 1-4 or 0"
            echo ""
            ;;
    esac
done 