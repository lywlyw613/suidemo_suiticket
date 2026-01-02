# NFT 票務系統 - Sui Demo Day 專案

基於 Sui 區塊鏈的 AI 驅動對話式 NFT 票務系統。

## 專案結構

```
sui-demoday/
├── frontend/          # Next.js 前端應用
├── backend/          # Node.js 後端服務
├── contracts/        # Sui Move 智能合約
├── docs/             # 文檔
└── PROJECT_ARCHITECTURE.md  # 詳細架構設計
```

## 技術棧

### 前端
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- @mysten/sui.js
- @mysten/kiosk

### 後端
- Node.js + Express
- TypeScript
- MongoDB (Mongoose)
- Redis (可選)

### 區塊鏈
- Sui Move
- Enoki (zkLogin + Gas Sponsor)
- Walrus (檔案存儲)

## 快速開始

### 環境要求
- Node.js 18+
- Sui CLI
- MongoDB (推薦使用 MongoDB Atlas 免費方案)
- Redis (可選)

### 安裝依賴

```bash
# 前端
cd frontend
npm install

# 後端
cd backend
npm install

# Move 合約
cd contracts
sui move build
```

### 環境變數配置

請參考各目錄下的 `.env.example` 文件。

### 運行項目

```bash
# 啟動後端（端口 3001）
cd backend
npm run dev

# 啟動前端（端口 3000）
cd frontend
npm run dev
```

## 開發階段

### Phase 1: MVP 核心功能 ✅
- [x] 用戶登入（Enoki zkLogin）
- [ ] 活動創建與展示
- [ ] NFT 票券鑄造
- [ ] 基本購票流程
- [ ] 驗票系統

### Phase 2: AI 與進階功能
- [ ] AI 對話介面
- [ ] 意圖識別
- [ ] 個人頁面
- [ ] QR Code

### Phase 3: 進階功能
- [ ] Kiosk 轉售
- [ ] 主辦方後台
- [ ] 支付流程
- [ ] 優化與測試

## 需要的 API Keys

以下服務需要配置 API Key（請在對應的 `.env` 文件中設置）：

1. **Enoki** - zkLogin 和 Gas Sponsor
   - 訪問：https://enoki.com
   - 需要：API Key, Gas Station ID

2. **Walrus** - 檔案存儲
   - 訪問：https://walrus.sui.io
   - 需要：API Key

3. **OpenAI/Anthropic** - AI 對話（Phase 2）
   - 需要：API Key

4. **數據庫** - MongoDB
   - 推薦使用 MongoDB Atlas（免費方案）
   - 或本地 MongoDB

5. **Redis** - 緩存和 Session
   - 可以使用 Upstash（免費）

## 文檔

詳細的架構設計請參考 [PROJECT_ARCHITECTURE.md](./PROJECT_ARCHITECTURE.md)

## License

MIT

