#!/bin/bash

# Update OpenAPI Schema from Backend
# 從後端獲取最新的 OpenAPI schema 用於 contract testing

set -e

BACKEND_URL=${BACKEND_URL:-"http://localhost:8000"}
SCHEMA_FILE="cotale-frontend/__test__/contract/openapi-schema.json"

echo "🔄 Updating OpenAPI schema from backend..."
echo "Backend URL: $BACKEND_URL"

# 檢查後端是否運行
if ! curl -s "$BACKEND_URL/api/health" > /dev/null; then
    echo "❌ Backend is not running at $BACKEND_URL"
    echo "Please start the backend first:"
    echo "  cd cotale-backend && python run.py"
    exit 1
fi

# 確保目標目錄存在
mkdir -p "$(dirname "$SCHEMA_FILE")"

# 獲取 OpenAPI schema
echo "📥 Fetching OpenAPI schema..."
if curl -s "$BACKEND_URL/openapi.json" | jq . > "$SCHEMA_FILE"; then
    echo "✅ OpenAPI schema updated successfully!"
    echo "📄 Schema saved to: $SCHEMA_FILE"
    
    # 顯示 schema 統計
    echo ""
    echo "📊 Schema Statistics:"
    echo "  Paths: $(jq '.paths | length' "$SCHEMA_FILE")"
    echo "  Schemas: $(jq '.components.schemas | length' "$SCHEMA_FILE")"
    echo "  Auth endpoints: $(jq '.paths | to_entries | map(select(.key | contains("/auth/"))) | length' "$SCHEMA_FILE")"
    
    echo ""
    echo "🧪 Running contract tests to verify schema..."
    cd cotale-frontend && npm run test:contract
    
    if [ $? -eq 0 ]; then
        echo "✅ All contract tests passed!"
    else
        echo "❌ Some contract tests failed. Please check the output above."
        exit 1
    fi
else
    echo "❌ Failed to fetch OpenAPI schema"
    exit 1
fi 