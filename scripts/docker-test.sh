#!/bin/bash

# Docker Test Script
# 用於本地測試 Docker 配置

set -e

echo "🐳 CoTale Docker Test Script"
echo "=============================="

# 檢查 Docker 是否運行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# 檢查 .env 檔案
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from env.example..."
    if [ -f "env.example" ]; then
        cp env.example .env
        echo "✅ Created .env from env.example"
        echo "📝 Please edit .env file with your actual values before continuing."
        echo "   Especially OPENAI_API_KEY and SECRET_KEY"
        read -p "Press Enter to continue after editing .env..."
    else
        echo "❌ env.example not found. Please create .env file manually."
        exit 1
    fi
fi

# 選擇操作
echo ""
echo "Choose an action:"
echo "1) Build and start services"
echo "2) Stop services"
echo "3) View logs"
echo "4) Rebuild services (clean build)"
echo "5) Clean up (remove containers and volumes)"
read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo "🚀 Building and starting services..."
        docker compose up --build -d
        echo ""
        echo "✅ Services started!"
        echo "🌐 Frontend: http://localhost:3000"
        echo "🔧 Backend API: http://localhost:8000"
        echo "📚 API Docs: http://localhost:8000/docs"
        echo ""
        echo "📊 Service status:"
        docker compose ps
        ;;
    2)
        echo "🛑 Stopping services..."
        docker compose down
        echo "✅ Services stopped!"
        ;;
    3)
        echo "📋 Viewing logs..."
        echo "Press Ctrl+C to exit logs"
        docker compose logs -f
        ;;
    4)
        echo "🔄 Rebuilding services..."
        docker compose down
        docker compose build --no-cache
        docker compose up -d
        echo "✅ Services rebuilt and started!"
        ;;
    5)
        echo "🧹 Cleaning up..."
        docker compose down -v --remove-orphans
        docker system prune -f
        echo "✅ Cleanup completed!"
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac 