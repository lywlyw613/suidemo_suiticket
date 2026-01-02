# Vercel 部署指南

## 步驟 1: 連接 GitHub Repository

1. 訪問 [Vercel Dashboard](https://vercel.com/dashboard)
2. 點擊 "Add New Project"
3. 選擇 GitHub repository: `lywlyw613/suidemo_suiticket`
4. 點擊 "Import"

## 步驟 2: 配置項目設置

### Root Directory
- **Root Directory**: `frontend`
- Vercel 會自動檢測 Next.js 框架

### Build Settings
- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (自動檢測)
- **Output Directory**: `.next` (自動檢測)
- **Install Command**: `npm install` (自動檢測)

## 步驟 3: 設置環境變量

在 Vercel 項目設置中添加以下環境變量：

### 必需環境變量

```
# Enoki 配置
NEXT_PUBLIC_ENOKI_API_KEY=your_enoki_api_key
NEXT_PUBLIC_ENOKI_APP_SLUG=demoday-86b22d0b
NEXT_PUBLIC_ENOKI_GAS_STATION_ID=your_gas_station_id

# Google OAuth (zkLogin)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# 後端 API URL (如果後端也部署在 Vercel 或其他地方)
NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app
```

### 可選環境變量

```
# 如果使用自定義域名
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 步驟 4: 更新 Google OAuth Redirect URI

部署後，需要在 Google Cloud Console 中添加新的 Redirect URI：

1. 訪問 [Google Cloud Console](https://console.cloud.google.com/)
2. 選擇你的 OAuth 2.0 客戶端
3. 在 "已授權的重新導向 URI" 中添加：
   - `https://your-vercel-app.vercel.app/login/callback`
   - 如果使用自定義域名：
   - `https://your-domain.com/login/callback`

## 步驟 5: 部署

1. 點擊 "Deploy"
2. 等待構建完成
3. 訪問提供的 Vercel URL 測試應用

## 後端部署 (可選)

如果後端也需要部署，可以：

### 選項 1: 部署到 Vercel (Serverless Functions)
- 需要將後端代碼轉換為 Vercel Serverless Functions
- 適合簡單的 API

### 選項 2: 部署到其他平台
- Railway
- Render
- Heroku
- 自己的服務器

### 選項 3: 使用 Vercel 的 API Routes
- 將後端 API 遷移到 `frontend/src/app/api/` 目錄
- 使用 Next.js API Routes

## 故障排除

### 構建失敗
- 檢查環境變量是否正確設置
- 確保所有依賴都在 `package.json` 中
- 查看構建日誌中的錯誤信息

### 運行時錯誤
- 檢查瀏覽器控制台的錯誤
- 確認環境變量以 `NEXT_PUBLIC_` 開頭（前端可訪問）
- 檢查 API URL 是否正確

### CORS 錯誤
- 確保後端 CORS 配置允許 Vercel 域名
- 檢查 `NEXT_PUBLIC_API_URL` 是否正確

## 注意事項

1. **環境變量**: 所有前端環境變量必須以 `NEXT_PUBLIC_` 開頭
2. **API URL**: 如果後端部署在其他地方，記得更新 `NEXT_PUBLIC_API_URL`
3. **Google OAuth**: 記得更新 Redirect URI
4. **Enoki**: 確保 Enoki API Key 和配置正確

