"""
Vercel Serverless Function for Flask Backend
注意: VercelのPython runtimeはFlaskを直接サポートしていません。
代替案として、バックエンドを別途デプロイ（Railway、Renderなど）するか、
各エンドポイントを個別の関数として実装する必要があります。

このファイルは一時的な実装です。本番環境では以下のいずれかを推奨：
1. バックエンドを別のサービス（Railway/Render）にデプロイ
2. Vercel Postgresを使用してバックエンドをリファクタリング
3. 各APIエンドポイントを個別のVercel Functionsとして実装
"""
import sys
import os
from pathlib import Path

# バックエンドのパスを追加
backend_path = Path(__file__).parent.parent.parent / 'taiki-life-os-backend'
if backend_path.exists():
    sys.path.insert(0, str(backend_path))
    
    try:
        from src.main import app
    except ImportError as e:
        print(f"Error importing Flask app: {e}")
        app = None
else:
    print("Backend path not found")
    app = None

# Vercel Functions用のハンドラー（未実装）
# 現在の実装では動作しません
def handler(request):
    """Vercel Serverless Function handler"""
    if app is None:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': '{"error": "Backend not configured. Please deploy backend separately or configure Vercel Functions properly."}'
        }
    # 実装が必要
    return {'statusCode': 501, 'body': 'Not implemented'}

