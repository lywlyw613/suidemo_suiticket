# OpenAI API Setup Guide

## 如何獲取 OpenAI API Key

### 步驟 1: 註冊/登入 OpenAI 帳號

1. 前往 [OpenAI Platform](https://platform.openai.com/)
2. 如果還沒有帳號，點擊 "Sign up" 註冊
3. 如果已有帳號，點擊 "Log in" 登入

### 步驟 2: 創建 API Key

1. 登入後，點擊右上角的個人頭像
2. 選擇 "View API keys" 或直接前往 [API Keys 頁面](https://platform.openai.com/api-keys)
3. 點擊 "Create new secret key"
4. 輸入一個名稱（例如：`NFT Ticketing System`）
5. 點擊 "Create secret key"
6. **重要**：複製這個 API Key，因為之後無法再次查看！格式類似：`sk-...`

### 步驟 3: 設置環境變量

#### 本地開發環境

在 `frontend` 目錄下創建或編輯 `.env.local` 文件：

```bash
OPENAI_API_KEY=sk-your-api-key-here
```

#### Vercel 部署環境

1. 前往 [Vercel Dashboard](https://vercel.com/dashboard)
2. 選擇你的專案
3. 進入 "Settings" → "Environment Variables"
4. 添加新的環境變量：
   - **Name**: `OPENAI_API_KEY`
   - **Value**: 你的 OpenAI API Key（`sk-...`）
5. 選擇環境（Production, Preview, Development）
6. 點擊 "Save"
7. **重要**：重新部署你的應用，環境變量才會生效

### 步驟 4: 驗證設置

1. 重啟開發服務器（如果正在運行）：
   ```bash
   cd frontend
   npm run dev
   ```

2. 訪問 AI 助手頁面：`http://localhost:3000/customer/ai`

3. 嘗試發送一個問題，例如：
   - "What events are available?"
   - "Tell me about the Taipei Neo-Jazz Night event"
   - "What are the ticket prices?"

4. 如果看到錯誤訊息提到 API key，請檢查：
   - `.env.local` 文件是否正確設置
   - 環境變量名稱是否為 `OPENAI_API_KEY`（大小寫敏感）
   - 是否重啟了開發服務器

## 費用說明

- OpenAI API 按使用量計費
- GPT-3.5-turbo 模型價格：約 $0.0015 / 1K tokens（輸入）+ $0.002 / 1K tokens（輸出）
- 對於 demo 用途，通常每月使用量很少，費用很低
- 可以在 [OpenAI Usage Dashboard](https://platform.openai.com/usage) 查看使用量和費用

## 安全注意事項

⚠️ **重要**：
- **永遠不要**將 API Key 提交到 Git 倉庫
- 確保 `.env.local` 在 `.gitignore` 中
- 不要在客戶端代碼中直接使用 API Key
- 使用 Next.js API Routes（如 `/api/chat`）來保護 API Key

## 故障排除

### 錯誤：`OpenAI API key is not configured`

**解決方法**：
1. 確認 `.env.local` 文件存在於 `frontend` 目錄
2. 確認環境變量名稱是 `OPENAI_API_KEY`（不是 `NEXT_PUBLIC_OPENAI_API_KEY`）
3. 重啟開發服務器

### 錯誤：`401 Unauthorized`

**解決方法**：
1. 檢查 API Key 是否正確複製（沒有多餘空格）
2. 確認 API Key 沒有過期或被撤銷
3. 檢查 OpenAI 帳號是否有足夠的餘額

### 錯誤：`429 Rate limit exceeded`

**解決方法**：
1. 等待幾分鐘後再試
2. 檢查 OpenAI 帳號的 rate limit 設置
3. 考慮升級到付費計劃以獲得更高的 rate limit

## 測試

設置完成後，可以嘗試以下問題來測試 AI 助手：

1. "What events are available?"
2. "Tell me about Taipei Neo-Jazz Night"
3. "What are the ticket prices for the jazz event?"
4. "What seats are available?"
5. "How do I purchase tickets?"

AI 助手應該能夠根據網站上的活動數據回答這些問題。

