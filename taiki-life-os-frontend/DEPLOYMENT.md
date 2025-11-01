# Vercelデプロイ手順

## ⚠️ 重要な注意事項

VercelのPython runtimeはFlaskアプリを直接サポートしていません。以下のいずれかの方法を推奨します：

### 推奨アプローチ 1: バックエンドを別サービスにデプロイ（推奨）

1. **Railway** (https://railway.app)
   - Flaskアプリをそのままデプロイ可能
   - 無料プランあり
   - 環境変数とデータベース管理が簡単

2. **Render** (https://render.com)
   - FlaskアプリをWebサービスとしてデプロイ
   - 無料プランあり

3. **Heroku** (https://heroku.com)
   - 有料プランのみ

### 推奨アプローチ 2: バックエンドをVercelでデプロイ（別プロジェクト）

バックエンド用に別のVercelプロジェクトを作成し、Serverless Functionsとして各エンドポイントを実装。

---

## フロントエンドのVercelデプロイ手順

### 1. リポジトリの準備
```bash
cd taiki-life-os-frontend
git init
git add .
git commit -m "Initial commit"
```

### 2. Vercelプロジェクトの作成
1. [Vercel Dashboard](https://vercel.com/dashboard)にログイン
2. 「Add New Project」をクリック
3. リポジトリをインポート
4. プロジェクト名: `taiki-life-os-frontend` [[memory:9702763]]

### 3. プロジェクト設定
- **Framework Preset**: Vite
- **Root Directory**: `taiki-life-os-frontend`（モノレポの場合）
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 4. 環境変数の設定
Vercelダッシュボード > Settings > Environment Variables で以下を設定：

```
# バックエンドAPIのURL（別サービスにデプロイした場合）
VITE_API_URL=https://your-backend.railway.app/api

# または、同じVercelプロジェクト内のFunctionsを使用する場合
VITE_API_URL=/api
```

### 5. デプロイ実行
```bash
# Vercel CLIを使用する場合
npm i -g vercel
vercel

# または、Gitにpushすると自動デプロイ
git push origin main
```

---

## バックエンドのRailwayデプロイ手順（推奨）

### 1. Railwayプロジェクトの作成
1. [Railway](https://railway.app)にサインアップ（GitHub連携推奨）
2. 「New Project」→「Deploy from GitHub repo」
3. `taiki-life-os-backend`リポジトリを選択

### 2. 環境変数の設定
Railway Dashboard > Variables で設定：

```
NOTION_TOKEN=your_notion_token_here
SECRET_KEY=your_secret_key_here
```

### 3. データベースの設定
- Railway Postgresを追加（またはSQLiteのまま）
- 環境変数`DATABASE_URL`が自動設定される

### 4. デプロイ
- Git pushで自動デプロイ
- または、Railway CLIでデプロイ

### 5. ドメインの取得
- Railwayが自動的に`*.railway.app`ドメインを提供
- カスタムドメインも設定可能

---

## PWAインストール（iPhone）

### 1. Safariでアプリを開く
- デプロイされたURLをSafariで開く
- **HTTPS必須**（Vercelは自動的にHTTPS）

### 2. ホーム画面に追加
1. 共有ボタン（□↑）をタップ
2. 「ホーム画面に追加」を選択
3. アプリ名を確認（「Life OS」）
4. 「追加」をタップ

### 3. 動作確認
- ホーム画面からアプリを起動
- フルスクリーンで動作することを確認
- Service Workerが動作していることを確認（DevTools > Application）

---

## トラブルシューティング

### PWAがインストールできない
- ✅ HTTPSが有効になっているか確認
- ✅ `manifest.json`が正しく配信されているか確認
- ✅ Service Workerが登録されているか確認
- ✅ iOS Safariで開いているか確認（ChromeではPWAインストール不可）

### APIが動作しない
- ✅ バックエンドのURLが正しいか確認
- ✅ CORS設定が正しいか確認
- ✅ 環境変数が設定されているか確認

### データベースが永続化されない（Vercel Functionsの場合）
Vercel Functionsはステートレスなので、SQLiteは永続化されません。
以下のいずれかを使用：
- **Vercel Postgres**（推奨）
- **Supabase**（無料プランあり）
- **Railway Postgres**
- **外部データベースサービス**

---

## 次のステップ

1. **認証システムの実装**
   - JWT認証
   - ユーザー管理

2. **データベースの移行**
   - SQLite → Postgres
   - マイグレーションスクリプト

3. **モニタリング**
   - Vercel Analytics
   - エラートラッキング（Sentry）

4. **パフォーマンス最適化**
   - 画像最適化
   - コード分割
   - キャッシング戦略
