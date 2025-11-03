# Notion API 使用ガイド

## ✅ 可能な操作

### 1. ページのプロパティを取得
Notionページの基本情報（タイトル、作成日時、プロパティなど）を取得できます。

**エンドポイント**: `GET /api/notion/pages/{page_id}`

**使用例**:
```javascript
const response = await fetch('/api/notion/pages/12345678-1234-1234-1234-123456789abc')
const data = await response.json()
console.log(data.page) // ページのプロパティ情報
```

### 2. ページのブロック（コンテンツ）を取得
Notionページの実際の内容（テキスト、見出し、リストなど）を取得できます。

**エンドポイント**: `GET /api/notion/pages/{page_id}/blocks?recursive=true`

**使用例**:
```javascript
const response = await fetch('/api/notion/pages/12345678-1234-1234-1234-123456789abc/blocks?recursive=true')
const data = await response.json()
console.log(data.blocks) // ブロックのリスト
```

**パラメータ**:
- `recursive`: `true`の場合、ネストされたブロックも再帰的に取得（デフォルト: `true`）

### 3. ページの完全なコンテンツを取得
ページのプロパティとブロックを一度に取得します。

**エンドポイント**: `GET /api/notion/pages/{page_id}/content`

**使用例**:
```javascript
const response = await fetch('/api/notion/pages/12345678-1234-1234-1234-123456789abc/content')
const data = await response.json()
console.log(data.content.page) // ページプロパティ
console.log(data.content.blocks) // ブロックリスト
```

### 4. ページのテキストコンテンツを抽出
ページ内の全テキストを抽出して結合します。

**エンドポイント**: `GET /api/notion/pages/{page_id}/text`

**使用例**:
```javascript
const response = await fetch('/api/notion/pages/12345678-1234-1234-1234-123456789abc/text')
const data = await response.json()
console.log(data.text) // 全テキストコンテンツ
```

### 5. ページを検索
Notionワークスペース内でページを検索します。

**エンドポイント**: `POST /api/notion/pages/search`

**使用例**:
```javascript
const response = await fetch('/api/notion/pages/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: '検索キーワード' })
})
const data = await response.json()
console.log(data.pages) // 検索結果のページリスト
```

---

## 📋 サポートされるブロックタイプ

以下のブロックタイプからテキストを抽出できます：
- `paragraph` - 段落
- `heading_1`, `heading_2`, `heading_3` - 見出し
- `bulleted_list_item` - 箇条書きリスト
- `numbered_list_item` - 番号付きリスト
- `to_do` - ToDo項目
- `toggle` - トグルリスト
- `quote` - 引用
- `callout` - コールアウト

---

## 🔧 実装例

### Life PlanやLIFEルールをNotionページから取得する場合

```javascript
// ページIDを取得（検索APIを使用）
const searchResponse = await fetch('/api/notion/pages/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: '人生計画' })
})
const { pages } = await searchResponse.json()
const lifePlanPage = pages[0]

// ページのコンテンツを取得
const contentResponse = await fetch(`/api/notion/pages/${lifePlanPage.id}/content`)
const { content } = await contentResponse.json()

// ブロックからテキストを抽出
const texts = content.blocks.map(block => {
  // parse_block_content ロジックを使用
  return extractTextFromBlock(block)
})
```

---

## ⚠️ 注意事項

1. **ページIDの取得方法**:
   - NotionページのURLから取得: `https://www.notion.so/{workspace}/{page-id}`
   - または検索APIを使用

2. **レート制限**:
   - Notion APIにはレート制限があります
   - 大量のページを取得する場合は適切にリクエストを分散してください

3. **ネストされたブロック**:
   - `recursive=true`を指定すると、ネストされたブロックも取得されます
   - 大量のコンテンツがある場合は時間がかかる可能性があります

4. **権限**:
   - Notion APIトークンに適切な権限が必要です
   - ページへのアクセス権限が必要です

