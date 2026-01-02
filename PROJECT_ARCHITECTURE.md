# NFT 票務系統 - 詳細架構設計文檔

## 目錄
1. [賣方（主辦方）系統](#1-賣方主辦方系統)
2. [買方（用戶）系統](#2-買方用戶系統)
3. [驗票流程系統](#3-驗票流程系統)
4. [數據結構設計](#4-數據結構設計)
5. [API 設計](#5-api-設計)
6. [技術實現細節](#6-技術實現細節)
7. [安全性機制與防護](#7-安全性機制與防護)
8. [錯誤處理與容錯機制](#8-錯誤處理與容錯機制)
9. [緩存策略](#9-緩存策略)
10. [通知系統](#10-通知系統)
11. [監控與分析](#11-監控與分析)
12. [退款與取消機制](#12-退款與取消機制)
13. [權限管理系統](#13-權限管理系統)
14. [日誌與審計](#14-日誌與審計)
15. [性能優化策略](#15-性能優化策略)
16. [測試策略](#16-測試策略)
17. [移動端優化](#17-移動端優化)
18. [國際化與多語言](#18-國際化與多語言)
19. [擴展性設計](#19-擴展性設計)
20. [開發優先級建議](#20-開發優先級建議)
21. [待確認問題](#21-待確認問題)

---

## 1. 賣方（主辦方）系統

### 1.1 主辦方身份管理

#### 1.1.1 主辦方註冊與認證
**功能細節：**
- **註冊方式：**
  - 使用 Enoki zkLogin（與一般用戶相同，但需要額外認證）
  - 或使用 Email + 密碼（傳統方式）
  - 需要提供：組織名稱、聯絡人、Email、電話、地址
  - 可能需要上傳營業登記證或身份證明（可選，視需求）

- **身份驗證：**
  - 後台管理員審核機制（MVP 可簡化為自動通過）
  - 驗證狀態：pending / verified / rejected
  - 驗證通過後才能創建活動

- **主辦方資料結構：**
  ```
  Organizer {
    id: string (UUID)
    walletAddress: string (Sui address from zkLogin)
    name: string
    email: string
    phone: string
    address: string
    verificationStatus: enum
    createdAt: timestamp
    updatedAt: timestamp
  }
  ```

#### 1.1.2 主辦方登入系統
**功能細節：**
- 使用 Enoki zkLogin（Google/Apple/Email）
- 登入後自動識別是否為主辦方身份
- Session 管理（JWT token 或 session cookie）
- 記住登入狀態

---

### 1.2 活動創建與管理

#### 1.2.1 活動創建表單
**必填欄位：**
- **基本資訊：**
  - 活動名稱（Event Name）
  - 活動類型（音樂會、戲劇、展覽、體育賽事等）
  - 活動描述（Description）- 支援 Markdown
  - 主辦方資訊（自動帶入，可編輯）

- **時間資訊：**
  - 開始時間（Start Time）- 日期 + 時間選擇器
  - 結束時間（End Time）
  - 售票開始時間（Sale Start Time）
  - 售票結束時間（Sale End Time）
  - 時區選擇

- **地點資訊：**
  - 場地名稱（Venue Name）
  - 地址（Address）- 可整合 Google Maps API
  - 座位圖上傳（可選）- 圖片上傳到 Walrus
  - GPS 座標（自動或手動輸入）

- **視覺素材：**
  - 主圖（Hero Image）- 必填，上傳到 Walrus
  - 活動橫幅（Banner）- 可選
  - 活動相簿（Gallery）- 多張圖片，上傳到 Walrus
  - 影片連結（Video URL）- 可選

- **票種設定：**
  - 票種列表（Ticket Types）
    - 票種名稱（如：VIP、一般票、早鳥票）
    - 價格（Price）- 支援多種貨幣
    - 數量（Quantity）- 每種票的發行數量
    - 座位區域（Seating Zone）- 可選，如：A區、B區、搖滾區
    - 票種描述（Description）
    - 是否可轉售（Resellable）- boolean
    - 轉售價格上限（Max Resell Price）- 可選，防止黃牛

- **進階設定：**
  - 是否允許轉售（Global Resell Policy）
  - 轉售抽成比例（Platform Commission %）
  - 活動狀態（Draft / Published / Cancelled / Ended）
  - 特殊規則（Special Rules）- 文字說明

**技術實現：**
- 前端：React 表單 + 圖片上傳組件
- 圖片上傳：先上傳到 Walrus，取得 URL
- 表單驗證：前端 + 後端雙重驗證
- 資料存儲：活動基本資料存後端資料庫，圖片 URL 存 Walrus

#### 1.2.2 活動資料上傳到 Walrus
**功能細節：**
- **上傳流程：**
  1. 用戶選擇圖片/檔案
  2. 前端顯示上傳進度
  3. 調用 Walrus API 上傳
  4. 取得 Walrus URL
  5. 將 URL 存入活動資料

- **上傳內容：**
  - 活動主圖
  - 活動相簿圖片
  - 座位圖
  - 其他相關檔案

- **Walrus 整合：**
  - 需要 Walrus API Key
  - 上傳時指定 bucket/folder
  - 檔案命名規則：`events/{eventId}/{filename}`
  - 支援圖片壓縮（前端或後端）

#### 1.2.3 活動列表管理
**功能細節：**
- **主辦方活動列表頁面：**
  - 顯示所有創建的活動
  - 篩選功能：
    - 狀態篩選（草稿、已發布、已取消、已結束）
    - 時間篩選（即將開始、進行中、已結束）
    - 搜尋功能（活動名稱）
  - 排序功能（時間、銷售量、收入）

- **活動卡片顯示：**
  - 活動主圖縮圖
  - 活動名稱
  - 活動時間
  - 狀態標籤（Badge）
  - 銷售統計（已售/總數）
  - 快速操作按鈕（編輯、查看、取消）

- **分頁功能：**
  - 每頁顯示數量設定
  - 無限滾動或傳統分頁

#### 1.2.4 活動編輯與刪除
**功能細節：**
- **編輯功能：**
  - 只能編輯「草稿」或「未開始售票」的活動
  - 已開始售票的活動只能編輯部分欄位（如描述、圖片）
  - 不能修改已售出的票種價格和數量
  - 編輯歷史記錄（可選）

- **刪除功能：**
  - 只能刪除「草稿」狀態的活動
  - 已發布的活動只能「取消」不能刪除
  - 軟刪除（標記為 deleted，保留資料）

---

### 1.3 票券發行管理

#### 1.3.1 票券發行控制
**功能細節：**
- **發行策略：**
  - 自動發行：用戶購買時自動鑄造 NFT
  - 手動發行：主辦方可手動觸發批量鑄造（預先鑄造）
  - 發行上限：每種票種的數量限制

- **NFT 鑄造邏輯：**
  - 每張票 = 1 個 Sui NFT
  - NFT metadata 包含：
    - eventId（活動 ID）
    - ticketType（票種）
    - seatZone（座位區域，如果有）
    - seatNumber（座位號碼，如果有）
    - purchaseTime（購買時間）
    - price（購買價格）
    - organizerId（主辦方 ID）
    - ticketNumber（票券編號，唯一）

- **鑄造觸發：**
  - 用戶完成支付後，後端自動調用 Sui Move 合約
  - 使用 Enoki Gas Sponsor 支付 Gas
  - 鑄造成功後，NFT 轉移到用戶錢包地址

#### 1.3.2 已售出票券查詢
**功能細節：**
- **銷售統計頁面：**
  - 總銷售量（Total Sold）
  - 各票種銷售量（By Ticket Type）
  - 銷售收入統計（Revenue）
  - 銷售趨勢圖表（Chart）- 可選

- **票券列表：**
  - 顯示所有已售出的票券
  - 每張票券顯示：
    - 票券編號
    - 購買者錢包地址（或部分顯示）
    - 購買時間
    - 票種
    - NFT ID（Sui Object ID）
    - 狀態（已使用/未使用）- 如果可查詢

- **匯出功能：**
  - 匯出 CSV/Excel
  - 包含所有票券資訊
  - 用於現場驗票準備

---

### 1.4 收益管理

#### 1.4.1 銷售統計
**功能細節：**
- **儀表板（Dashboard）：**
  - 總收入（Total Revenue）
  - 今日收入（Today's Revenue）
  - 本月收入（Monthly Revenue）
  - 銷售量趨勢圖（Line Chart）
  - 票種銷售分布（Pie Chart）
  - 活動收入排名（Top Events）

- **詳細報表：**
  - 按活動查看收入
  - 按時間區間查看收入
  - 按票種查看收入
  - 轉售收入統計（如果允許轉售）

#### 1.4.2 收款處理
**功能細節：**
- **支付方式整合：**
  - 傳統支付：信用卡、銀行轉帳（透過第三方支付 Gateway）
  - 加密貨幣支付：USDC、SUI（透過 x402 或直接整合）
  - 收款帳戶設定：主辦方設定收款方式

- **結算流程：**
  - 平台抽成計算（如果有的話）
  - 結算週期設定（每日/每週/每月）
  - 結算記錄查詢
  - 發票/收據生成（可選）

- **財務記錄：**
  - 每筆交易記錄
  - 收入明細
  - 平台手續費明細
  - 可匯出財務報表

---

### 1.5 主辦方後台介面設計

#### 1.5.1 導航結構
```
主辦方後台
├── 儀表板（Dashboard）
├── 活動管理
│   ├── 創建活動
│   ├── 活動列表
│   └── 活動編輯
├── 票券管理
│   ├── 已售出票券
│   ├── 銷售統計
│   └── 票券匯出
├── 財務管理
│   ├── 收入統計
│   ├── 結算記錄
│   └── 財務報表
└── 設定
    ├── 個人資料
    ├── 收款設定
    └── 通知設定
```

#### 1.5.2 UI/UX 設計要點
- 響應式設計（支援桌面和行動裝置）
- 清晰的數據視覺化（圖表、統計卡片）
- 快速操作按鈕（批量操作、快速篩選）
- 即時通知（新訂單、支付成功等）
- 深色模式支援（可選）

---

## 2. 買方（用戶）系統

### 2.1 用戶身份管理

#### 2.1.1 用戶登入系統（Role 1: Enoki zkLogin）
**功能細節：**
- **登入方式：**
  - Google 帳號登入
  - Apple 帳號登入
  - Email 登入（透過 Enoki zkLogin）
  - 一鍵登入，無需創建錢包

- **Enoki zkLogin 整合流程：**
  1. 用戶點擊「使用 Google/Apple 登入」
  2. 跳轉到 OAuth 授權頁面
  3. 用戶授權後，Enoki 處理 zkLogin
  4. 後端接收 zkLogin JWT token
  5. 驗證 token，取得 Sui 地址
  6. 建立或更新用戶資料
  7. 建立 session，返回前端

- **用戶資料結構：**
  ```
  User {
    id: string (UUID)
    suiAddress: string (from zkLogin)
    email: string
    name: string
    avatar: string (URL)
    loginMethod: enum (google/apple/email)
    createdAt: timestamp
    lastLoginAt: timestamp
  }
  ```

- **Session 管理：**
  - JWT token 存 localStorage 或 cookie
  - Token 過期時間設定
  - 自動刷新 token 機制
  - 登出功能（清除 session）

#### 2.1.2 用戶狀態管理
**功能細節：**
- **前端狀態管理：**
  - 使用 Context API 或 Redux/Zustand
  - 儲存：用戶資訊、登入狀態、我的票券列表
  - 全局狀態更新（登入/登出時）

- **用戶資料同步：**
  - 登入時從後端獲取用戶資料
  - 定期更新用戶資料（可選）
  - 離線狀態處理

#### 2.1.3 個人頁面
**功能細節：**
- **我的票券頁面：**
  - 顯示所有擁有的 NFT 票券
  - 篩選功能：
    - 狀態篩選（未使用、已使用、已轉售）
    - 活動類型篩選
    - 時間篩選（即將開始、已結束）
  - 排序功能（時間、活動名稱）

- **票券卡片顯示：**
  - 活動主圖
  - 活動名稱
  - 活動時間
  - 票種資訊
  - 座位資訊（如果有）
  - QR Code（點擊顯示）
  - 操作按鈕（查看詳情、轉售、分享）

- **個人資料編輯：**
  - 顯示名稱
  - 頭像上傳
  - Email（不可編輯，來自登入帳號）
  - 登出按鈕

- **購買歷史：**
  - 顯示所有購買記錄
  - 每筆記錄包含：活動名稱、購買時間、金額、票券數量
  - 可查看詳細資訊

---

### 2.2 AI 對話式購票流程（Role 4: AI Agent）

#### 2.2.1 AI Chat 介面設計
**功能細節：**
- **聊天介面元素：**
  - 聊天視窗（Chat Window）
    - 訊息列表（Message List）
    - 輸入框（Input Box）
    - 發送按鈕（Send Button）
    - 語音輸入按鈕（可選）
  - 側邊欄（Sidebar）- 可選
    - 當前選中的活動資訊
    - 購物車（選中的票券）
    - 快速操作按鈕

- **訊息類型：**
  - 文字訊息（Text Message）
  - 卡片訊息（Card Message）- 活動卡片、票種選擇卡片
  - 按鈕訊息（Button Message）- 快速回覆按鈕
  - 圖片訊息（Image Message）- 活動圖片
  - 列表訊息（List Message）- 活動列表、票種列表

- **UI/UX 設計：**
  - 現代化聊天介面（類似 ChatGPT）
  - 打字動畫（Typing Indicator）
  - 訊息時間戳記
  - 已讀/未讀狀態（可選）
  - 響應式設計（手機和桌面）

#### 2.2.2 意圖識別（Intent Recognition）
**功能細節：**
- **用戶意圖分類：**
  - `search_event` - 搜尋活動
    - 關鍵詞：找活動、演唱會、音樂會、什麼時候
    - 提取參數：時間、地點、類型、關鍵字
  - `select_ticket` - 選擇票種
    - 關鍵詞：我要買、選擇、VIP、一般票
    - 提取參數：票種名稱、數量
  - `view_event_detail` - 查看活動詳情
    - 關鍵詞：詳情、介紹、更多資訊
    - 提取參數：活動 ID
  - `complete_purchase` - 完成購買
    - 關鍵詞：購買、結帳、付款
    - 提取參數：確認資訊
  - `cancel` - 取消操作
    - 關鍵詞：取消、不要、算了
  - `help` - 尋求幫助
    - 關鍵詞：幫助、怎麼用、說明

- **意圖識別實現：**
  - 使用 OpenAI GPT-4 或 Claude API
  - 或使用專門的 NLU 服務（如 Rasa、Dialogflow）
  - 後端處理：接收用戶訊息 → 調用 AI API → 解析意圖 → 返回結構化數據

- **上下文管理：**
  - 維護對話上下文（Conversation Context）
  - 儲存當前狀態（正在選擇活動、正在選擇票種等）
  - 上下文包含：當前活動、選中的票種、購物車內容

#### 2.2.3 AI 推薦邏輯
**功能細節：**
- **需求分析：**
  - 解析用戶自然語言輸入
  - 提取關鍵資訊：
    - 時間偏好（日期、時段）
    - 地點偏好（城市、區域、場地）
    - 活動類型（音樂、戲劇、展覽）
    - 預算範圍（價格區間）
    - 藝術家/表演者名稱

- **推薦算法：**
  - 基於關鍵字匹配
  - 基於時間匹配
  - 基於地點匹配
  - 基於用戶歷史（如果有的話）
  - 綜合評分排序

- **推薦結果展示：**
  - 返回 3-5 個最相關的活動
  - 每個活動顯示：名稱、時間、地點、價格範圍、主圖
  - AI 解釋推薦理由（可選）

#### 2.2.4 對話流程設計
**完整購票對話流程：**

```
1. 歡迎訊息
   AI: "你好！我是你的購票助手。你想找什麼活動呢？"
   
2. 需求收集
   用戶: "我想找下週末的演唱會"
   AI: "好的，讓我為你搜尋下週末的演唱會..."
   → 調用後端搜尋 API
   → 返回活動列表
   AI: [顯示活動卡片列表]
   "我找到以下活動，你想看哪一個？"
   
3. 活動選擇
   用戶: "第一個"
   或 用戶: "EDM Festival"
   AI: [顯示活動詳情卡片]
   "這是 EDM Festival 的詳情：
   時間：12月8日 晚上8點
   地點：台北小巨蛋
   票種：VIP $3000、一般票 $1500
   你想選擇哪種票？"
   
4. 票種選擇
   用戶: "我要2張VIP"
   AI: "好的，你選擇了2張VIP票，總共 $6000。
   座位區域：A區
   確認購買嗎？"
   
5. 確認購買
   用戶: "確認"
   AI: "正在為你處理購買..."
   → 觸發支付流程
   → 等待支付完成
   AI: "購買成功！你的票券正在鑄造中..."
   → NFT 鑄造完成
   AI: "完成！你的 NFT 票券已經發送到你的帳戶。
   你可以在「我的票券」頁面查看。"
```

- **錯誤處理：**
  - 用戶輸入不清楚 → AI 詢問澄清
  - 活動不存在 → 提供替代建議
  - 票券售完 → 通知並建議其他票種
  - 支付失敗 → 提示錯誤並重試

#### 2.2.5 對話歷史儲存
**功能細節：**
- **儲存內容：**
  - 用戶訊息
  - AI 回覆
  - 時間戳記
  - 對話上下文（當前狀態）
  - 用戶 ID（關聯）

- **儲存方式：**
  - 後端資料庫（MongoDB/PostgreSQL）
  - 表結構：
    ```
    Conversation {
      id: string
      userId: string
      messages: Array<{
        role: 'user' | 'assistant'
        content: string
        timestamp: timestamp
        metadata: object (意圖、參數等)
      }>
      context: object (當前狀態)
      createdAt: timestamp
      updatedAt: timestamp
    }
    ```

- **用途：**
  - 恢復對話上下文（用戶重新開啟聊天）
  - 分析用戶行為
  - 改進 AI 推薦

---

### 2.3 支付流程（Role 5: Payment）

#### 2.3.1 支付確認頁面
**功能細節：**
- **頁面內容：**
  - 訂單摘要（Order Summary）
    - 活動名稱
    - 票種資訊
    - 數量
    - 單價
    - 總價
    - 手續費（如果有）
  - 支付方式選擇
    - 信用卡
    - 銀行轉帳
    - 加密貨幣（USDC/SUI）- 如果整合
  - 優惠碼輸入（可選）
  - 同意條款 checkbox
  - 確認購買按鈕

- **支付流程：**
  1. 用戶確認訂單
  2. 選擇支付方式
  3. 跳轉到支付頁面（第三方支付 Gateway）
  4. 完成支付
  5. 支付成功後，後端接收 webhook
  6. 觸發 NFT 鑄造流程

#### 2.3.2 Enoki Gas Sponsor 整合
**功能細節：**
- **Gas Sponsor 設定：**
  - 後端配置 Enoki Gas Station API
  - 所有鏈上交易使用 Gas Sponsor
  - 用戶完全無感

- **整合流程：**
  1. 後端準備 Sui 交易（NFT 鑄造）
  2. 使用 Enoki SDK 簽名交易
  3. Enoki 自動支付 Gas
  4. 交易提交到 Sui 鏈
  5. 等待交易確認
  6. 返回結果給前端

- **技術實現：**
  - 使用 Enoki TypeScript SDK
  - 後端維護 Enoki 配置
  - 錯誤處理和重試機制

#### 2.3.3 交易狀態顯示
**功能細節：**
- **狀態追蹤：**
  - `pending` - 等待支付
  - `paid` - 支付完成，等待鑄造
  - `minting` - NFT 鑄造中
  - `success` - 完成
  - `failed` - 失敗

- **前端顯示：**
  - 進度條（Progress Bar）
  - 狀態文字說明
  - 載入動畫
  - 成功/失敗提示

- **即時更新：**
  - WebSocket 或 Polling
  - 後端推送狀態更新
  - 前端自動刷新

---

### 2.4 NFT 票券管理（Role 3: Ticket Management）

#### 2.4.1 票券展示頁面
**功能細節：**
- **票券列表：**
  - 顯示所有擁有的 NFT 票券
  - 卡片式設計
  - 每個卡片包含：
    - 活動主圖
    - 活動名稱
    - 活動時間
    - 票種標籤
    - 狀態標籤（未使用/已使用）
    - 快速操作按鈕

- **票券詳情頁面：**
  - 完整活動資訊
  - 票券資訊：
    - 票券編號
    - NFT ID（Sui Object ID）
    - 購買時間
    - 購買價格
    - 座位資訊（如果有）
  - QR Code 顯示
  - 操作按鈕（分享、轉售）

#### 2.4.2 QR Code 生成
**功能細節：**
- **QR Code 內容：**
  - NFT Object ID（Sui Object ID）
  - 或自定義票券 ID（後端生成）
  - 包含驗證資訊

- **生成方式：**
  - 前端使用 QR Code 庫（如 qrcode.js）
  - 或後端生成返回圖片 URL
  - 支援不同尺寸

- **QR Code 顯示：**
  - 票券詳情頁面顯示
  - 可下載為圖片
  - 可分享

#### 2.4.3 Kiosk 轉售功能（挑戰項目）
**功能細節：**
- **轉售流程：**
  1. 用戶選擇要轉售的票券
  2. 設定轉售價格（需符合規則）
  3. 確認轉售
  4. 後端調用 Sui Kiosk API
  5. 將 NFT 上架到 Kiosk
  6. 顯示轉售連結

- **轉售規則：**
  - 檢查活動是否允許轉售
  - 檢查票種是否允許轉售
  - 檢查轉售價格上限
  - 檢查是否已使用（不能轉售已使用的票）

- **Kiosk 整合：**
  - 使用 Sui Kiosk SDK
  - 創建 Kiosk（如果沒有）
  - 將 NFT 放入 Kiosk
  - 設定價格
  - 生成購買連結

- **轉售市場頁面：**
  - 顯示所有轉售中的票券
  - 篩選功能（活動、價格區間）
  - 購買轉售票券功能

---

## 3. 驗票流程系統

### 3.1 驗票人員介面

#### 3.1.1 驗票登入系統
**功能細節：**
- **驗票人員身份：**
  - 主辦方指定驗票人員
  - 或使用活動專屬驗證碼
  - 簡單的登入機制（不需要 zkLogin）

- **驗票人員資料：**
  ```
  Verifier {
    id: string
    eventId: string (關聯的活動)
    name: string
    accessCode: string (驗證碼)
    permissions: array (可驗證的活動列表)
  }
  ```

#### 3.1.2 驗票掃描介面
**功能細節：**
- **QR Code 掃描：**
  - 使用相機掃描 QR Code
  - 或手動輸入票券 ID
  - 即時掃描結果顯示

- **介面設計：**
  - 大按鈕「開始掃描」
  - 掃描視窗（Camera View）
  - 掃描結果顯示區域
  - 歷史記錄列表

- **響應式設計：**
  - 優先支援手機/平板
  - 橫屏/豎屏適配
  - 大按鈕，易於操作

### 3.2 驗票邏輯（Role 5: Verification）

#### 3.2.1 鏈上驗證流程
**功能細節：**
- **驗證步驟：**
  1. 掃描 QR Code，取得 NFT Object ID 或票券 ID
  2. 後端查詢 Sui 鏈，驗證 NFT 存在
  3. 檢查 NFT 擁有者（Owner）
  4. 讀取 NFT metadata，驗證活動資訊
  5. 檢查是否已使用（防重複入場）
  6. 標記為已使用（如果驗證通過）
  7. 返回驗證結果

- **Sui 鏈上查詢：**
  - 使用 Sui SDK 查詢 Object
  - 讀取 Object 的 owner 欄位
  - 讀取 Object 的 metadata
  - 檢查 Object 的狀態

- **驗證邏輯：**
  ```javascript
  async function verifyTicket(ticketId) {
    // 1. 查詢 NFT
    const nft = await suiClient.getObject(ticketId);
    
    // 2. 驗證 NFT 存在
    if (!nft || nft.error) {
      return { valid: false, error: 'Ticket not found' };
    }
    
    // 3. 讀取 metadata
    const metadata = nft.data.content.fields;
    const eventId = metadata.eventId;
    const ticketNumber = metadata.ticketNumber;
    
    // 4. 驗證活動 ID 匹配
    if (eventId !== currentEventId) {
      return { valid: false, error: 'Ticket not for this event' };
    }
    
    // 5. 檢查是否已使用
    const isUsed = await checkTicketUsed(ticketNumber);
    if (isUsed) {
      return { valid: false, error: 'Ticket already used' };
    }
    
    // 6. 標記為已使用
    await markTicketAsUsed(ticketNumber);
    
    // 7. 返回成功
    return { 
      valid: true, 
      ticketInfo: {
        ticketNumber,
        ticketType: metadata.ticketType,
        seatZone: metadata.seatZone,
        owner: nft.owner
      }
    };
  }
  ```

#### 3.2.2 防重複入場機制
**功能細節：**
- **已使用記錄：**
  - 後端資料庫記錄已驗證的票券
  - 表結構：
    ```
    TicketVerification {
      id: string
      ticketId: string (NFT Object ID)
      ticketNumber: string
      eventId: string
      verifiedAt: timestamp
      verifierId: string
      ownerAddress: string
    }
    ```

- **檢查邏輯：**
  - 驗證前先查詢資料庫
  - 如果已存在記錄，拒絕驗證
  - 驗證成功後，立即寫入記錄

- **鏈上標記（可選，進階功能）：**
  - 修改 NFT metadata，添加 `used: true`
  - 或創建一個鏈上記錄 Object
  - 需要額外的 Move 合約支援

#### 3.2.3 驗證結果顯示
**功能細節：**
- **成功顯示：**
  - 綠色成功標誌
  - 顯示票券資訊：
    - 票券編號
    - 票種
    - 座位資訊（如果有）
    - 擁有者地址（部分顯示）
  - 音效提示（可選）
  - 自動進入下一筆掃描

- **失敗顯示：**
  - 紅色錯誤標誌
  - 顯示錯誤原因：
    - 票券不存在
    - 票券不屬於此活動
    - 票券已使用
    - 其他錯誤
  - 音效提示（可選）

- **驗證統計：**
  - 顯示今日驗證數量
  - 顯示總驗證數量
  - 顯示驗證成功率

### 3.3 驗票記錄管理

#### 3.3.1 驗票歷史記錄
**功能細節：**
- **記錄列表：**
  - 顯示所有驗證記錄
  - 每筆記錄包含：
    - 驗證時間
    - 票券編號
    - 驗證結果（成功/失敗）
    - 驗證人員
    - 錯誤原因（如果失敗）

- **篩選功能：**
  - 按時間篩選
  - 按結果篩選（成功/失敗）
  - 搜尋票券編號

- **匯出功能：**
  - 匯出 CSV/Excel
  - 用於活動後分析

#### 3.3.2 即時統計
**功能細節：**
- **儀表板：**
  - 即時驗證數量
  - 驗證成功率
  - 驗證速度（每小時）
  - 異常檢測（大量失敗驗證）

---

## 4. 數據結構設計

### 4.1 後端資料庫 Schema

#### 4.1.1 用戶表（Users）
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  sui_address VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255),
  name VARCHAR(255),
  avatar_url TEXT,
  login_method VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 4.1.2 主辦方表（Organizers）
```sql
CREATE TABLE organizers (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  verification_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 4.1.3 活動表（Events）
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY,
  organizer_id UUID REFERENCES organizers(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  event_type VARCHAR(100),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  sale_start_time TIMESTAMP,
  sale_end_time TIMESTAMP,
  venue_name VARCHAR(255),
  venue_address TEXT,
  venue_lat DECIMAL(10, 8),
  venue_lng DECIMAL(11, 8),
  hero_image_url TEXT,
  banner_url TEXT,
  gallery_urls JSONB,
  video_url TEXT,
  seat_map_url TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 4.1.4 票種表（Ticket Types）
```sql
CREATE TABLE ticket_types (
  id UUID PRIMARY KEY,
  event_id UUID REFERENCES events(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  sold_count INTEGER DEFAULT 0,
  seating_zone VARCHAR(100),
  resellable BOOLEAN DEFAULT true,
  max_resell_price DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 4.1.5 訂單表（Orders）
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  event_id UUID REFERENCES events(id),
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_transaction_id VARCHAR(255),
  nft_mint_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 4.1.6 訂單項目表（Order Items）
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  ticket_type_id UUID REFERENCES ticket_types(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 4.1.7 NFT 票券表（NFT Tickets）
```sql
CREATE TABLE nft_tickets (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  order_item_id UUID REFERENCES order_items(id),
  user_id UUID REFERENCES users(id),
  event_id UUID REFERENCES events(id),
  ticket_type_id UUID REFERENCES ticket_types(id),
  sui_object_id VARCHAR(255) UNIQUE NOT NULL,
  ticket_number VARCHAR(255) UNIQUE NOT NULL,
  seat_zone VARCHAR(100),
  seat_number VARCHAR(50),
  purchase_price DECIMAL(10, 2),
  purchase_time TIMESTAMP,
  is_used BOOLEAN DEFAULT false,
  used_at TIMESTAMP,
  is_resold BOOLEAN DEFAULT false,
  resold_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 4.1.8 驗證記錄表（Ticket Verifications）
```sql
CREATE TABLE ticket_verifications (
  id UUID PRIMARY KEY,
  ticket_id UUID REFERENCES nft_tickets(id),
  event_id UUID REFERENCES events(id),
  verifier_id UUID,
  ticket_number VARCHAR(255),
  sui_object_id VARCHAR(255),
  verification_result VARCHAR(50),
  error_message TEXT,
  verified_at TIMESTAMP DEFAULT NOW()
);
```

#### 4.1.9 對話記錄表（Conversations）
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  context JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 4.1.10 對話訊息表（Conversation Messages）
```sql
CREATE TABLE conversation_messages (
  id UUID PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id),
  role VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

### 4.2 Sui Move 合約數據結構

#### 4.2.1 NFT 票券結構
```move
struct TicketNFT has key, store {
    id: UID,
    event_id: String,
    ticket_type: String,
    ticket_number: String,
    seat_zone: Option<String>,
    seat_number: Option<String>,
    purchase_time: u64,
    purchase_price: u64,
    organizer_id: String,
    is_used: bool,
}
```

#### 4.2.2 活動資訊結構（可選，鏈上存儲）
```move
struct EventInfo has key {
    id: UID,
    event_id: String,
    name: String,
    start_time: u64,
    end_time: u64,
    venue: String,
    ticket_types: vector<TicketTypeInfo>,
}
```

---

## 5. API 設計

### 5.1 用戶相關 API

#### 5.1.1 登入 API
```
POST /api/auth/login
Body: {
  provider: 'google' | 'apple' | 'email',
  token: string (OAuth token or zkLogin JWT)
}
Response: {
  user: User,
  sessionToken: string
}
```

#### 5.1.2 登出 API
```
POST /api/auth/logout
Headers: { Authorization: Bearer <token> }
```

#### 5.1.3 獲取用戶資訊
```
GET /api/users/me
Headers: { Authorization: Bearer <token> }
Response: User
```

#### 5.1.4 獲取我的票券
```
GET /api/users/tickets
Headers: { Authorization: Bearer <token> }
Query: { status?, eventId?, page?, limit? }
Response: {
  tickets: NFTTicket[],
  total: number,
  page: number
}
```

### 5.2 活動相關 API

#### 5.2.1 搜尋活動
```
GET /api/events/search
Query: {
  keyword?: string,
  eventType?: string,
  startDate?: string,
  endDate?: string,
  location?: string,
  page?: number,
  limit?: number
}
Response: {
  events: Event[],
  total: number
}
```

#### 5.2.2 獲取活動詳情
```
GET /api/events/:eventId
Response: Event (包含票種列表)
```

#### 5.2.3 主辦方創建活動
```
POST /api/organizers/events
Headers: { Authorization: Bearer <token> }
Body: EventCreateRequest
Response: Event
```

#### 5.2.4 主辦方獲取活動列表
```
GET /api/organizers/events
Headers: { Authorization: Bearer <token> }
Query: { status?, page?, limit? }
Response: { events: Event[] }
```

### 5.3 訂單與支付 API

#### 5.3.1 創建訂單
```
POST /api/orders
Headers: { Authorization: Bearer <token> }
Body: {
  eventId: string,
  items: Array<{
    ticketTypeId: string,
    quantity: number
  }>
}
Response: Order
```

#### 5.3.2 支付訂單
```
POST /api/orders/:orderId/pay
Headers: { Authorization: Bearer <token> }
Body: {
  paymentMethod: string,
  paymentData: object
}
Response: {
  paymentUrl?: string,
  status: string
}
```

#### 5.3.3 支付回調（Webhook）
```
POST /api/payments/webhook
Body: PaymentWebhookData
```

#### 5.3.4 鑄造 NFT 票券
```
POST /api/orders/:orderId/mint
Headers: { Authorization: Bearer <token> }
Response: {
  status: string,
  nftTickets: NFTTicket[]
}
```

### 5.4 AI 對話 API

#### 5.4.1 發送訊息
```
POST /api/ai/chat
Headers: { Authorization: Bearer <token> }
Body: {
  message: string,
  conversationId?: string
}
Response: {
  reply: string,
  conversationId: string,
  intent?: string,
  suggestions?: Array<{
    type: 'event' | 'ticket',
    data: object
  }>
}
```

#### 5.4.1 獲取對話歷史
```
GET /api/ai/conversations/:conversationId
Headers: { Authorization: Bearer <token> }
Response: Conversation
```

### 5.5 驗票 API

#### 5.5.1 驗證票券
```
POST /api/verification/verify
Headers: { Authorization: Bearer <verifier_token> }
Body: {
  ticketId: string (NFT Object ID or ticket number),
  eventId: string
}
Response: {
  valid: boolean,
  ticketInfo?: {
    ticketNumber: string,
    ticketType: string,
    seatZone?: string,
    owner: string
  },
  error?: string
}
```

#### 5.5.2 獲取驗證記錄
```
GET /api/verification/records
Headers: { Authorization: Bearer <verifier_token> }
Query: { eventId?, startDate?, endDate?, page?, limit? }
Response: {
  records: TicketVerification[],
  total: number
}
```

### 5.6 Kiosk 轉售 API

#### 5.6.1 上架轉售
```
POST /api/tickets/:ticketId/resell
Headers: { Authorization: Bearer <token> }
Body: {
  price: number
}
Response: {
  kioskUrl: string,
  listingId: string
}
```

#### 5.6.2 取消轉售
```
POST /api/tickets/:ticketId/cancel-resell
Headers: { Authorization: Bearer <token> }
```

#### 5.6.3 獲取轉售市場
```
GET /api/marketplace/listings
Query: { eventId?, minPrice?, maxPrice?, page?, limit? }
Response: {
  listings: ResellListing[],
  total: number
}
```

---

## 6. 技術實現細節

### 6.1 前端技術棧

#### 6.1.1 框架選擇
- **推薦：Next.js 14+ (App Router)**
  - Server Components
  - API Routes
  - 優化性能
- **或：React + Vite**
  - 更輕量
  - 快速開發

#### 6.1.2 UI 框架
- **推薦：Tailwind CSS + shadcn/ui**
  - 現代化設計
  - 組件豐富
- **或：Material-UI / Chakra UI**

#### 6.1.3 狀態管理
- **Context API** - 用戶狀態、對話狀態
- **Zustand** - 全局狀態（可選）
- **React Query** - 服務器狀態管理

#### 6.1.4 必要庫
- `@mysten/sui.js` - Sui SDK
- `@mysten/kiosk` - Kiosk SDK
- `qrcode.react` - QR Code 生成
- `react-qr-scanner` - QR Code 掃描
- `axios` - HTTP 請求
- `socket.io-client` - WebSocket（即時更新）

### 6.2 後端技術棧

#### 6.2.1 框架選擇
- **推薦：Node.js + Express / Fastify**
  - TypeScript
  - 快速開發
- **或：Python + FastAPI**
  - 更好的 AI 整合
  - 類型安全

#### 6.2.2 資料庫
- **PostgreSQL** - 主要資料庫
- **Redis** - 快取、Session 存儲
- **MongoDB** - 對話歷史（可選）

#### 6.2.3 必要服務
- **Enoki SDK** - zkLogin + Gas Sponsor
- **OpenAI/Anthropic API** - AI 對話
- **Walrus API** - 檔案存儲
- **Sui SDK** - 鏈上操作
- **支付 Gateway** - Stripe / PayPal / 其他

### 6.3 Sui Move 合約

#### 6.3.1 合約結構
```
contracts/
├── ticket_nft/
│   ├── sources/
│   │   ├── ticket_nft.move
│   │   └── event_info.move
│   └── Move.toml
```

#### 6.3.2 核心功能
- NFT 鑄造（Mint）
- NFT 轉移（Transfer）
- Metadata 管理
- Kiosk 整合

### 6.4 部署架構

#### 6.4.1 前端部署
- **Vercel** - Next.js 部署
- **或：Netlify / Cloudflare Pages**

#### 6.4.2 後端部署
- **Railway / Render** - 簡單部署
- **或：AWS / GCP / Azure** - 生產環境

#### 6.4.3 資料庫
- **Supabase / Neon** - PostgreSQL
- **Upstash** - Redis

#### 6.4.4 環境變數
```
# Frontend
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_SUI_NETWORK=testnet/mainnet
NEXT_PUBLIC_ENOKI_API_KEY=

# Backend
DATABASE_URL=
REDIS_URL=
ENOKI_API_KEY=
ENOKI_GAS_STATION_ID=
WALRUS_API_KEY=
OPENAI_API_KEY=
SUI_NETWORK=
SUI_RPC_URL=
```

---

## 20. 開發優先級建議

### Phase 1: MVP 核心功能（第一週）
1. ✅ 用戶登入（Enoki zkLogin）
2. ✅ 活動創建與展示（基本版）
3. ✅ NFT 票券鑄造（基本版）
4. ✅ 簡單的購票流程（非 AI）
5. ✅ 驗票系統（基本版）

### Phase 2: AI 與進階功能（第二週）
1. ✅ AI 對話介面
2. ✅ 意圖識別
3. ✅ 個人頁面與票券管理
4. ✅ QR Code 生成

### Phase 3: 進階功能（第三週）
1. ✅ Kiosk 轉售功能
2. ✅ 主辦方後台完善
3. ✅ 支付流程完善
4. ✅ 優化與測試

---

## 21. 待確認問題

1. **支付方式：**
   - 是否必須支援加密貨幣？
   - 傳統支付 Gateway 選擇？

2. **平台抽成：**
   - 是否需要抽成機制？
   - 抽成比例？

3. **轉售規則：**
   - 是否允許轉售？
   - 轉售價格限制？

4. **驗票後 NFT 處理：**
   - 保留 NFT？
   - 標記為已使用？
   - 銷毀 NFT？

5. **Walrus 整合：**
   - 是否有 Walrus API Key？
   - 檔案上傳限制？

6. **Enoki 配置：**
   - 是否有 Enoki API Key？
   - Gas Station ID？

---

---

## 7. 安全性機制與防護

### 7.1 防刷票機制

#### 7.1.1 購買頻率限制
**功能細節：**
- **用戶級別限制：**
  - 單一用戶在短時間內（如 5 分鐘）最多購買 N 張票（可配置）
  - 單一活動，單一用戶最多購買 M 張票（防止囤票）
  - 使用 Redis 記錄購買頻率，設置 TTL

- **IP 級別限制：**
  - 單一 IP 在短時間內最多購買數量限制
  - 檢測異常 IP（VPN、代理）並標記
  - 使用滑動窗口算法計算請求頻率

- **實現邏輯：**
  ```javascript
  async function checkPurchaseLimit(userId, eventId, quantity) {
    const key = `purchase:${userId}:${eventId}`;
    const count = await redis.incr(key);
    await redis.expire(key, 300); // 5分鐘
    
    const maxPerUser = 5; // 每個用戶最多5張
    if (count > maxPerUser) {
      throw new Error('Purchase limit exceeded');
    }
    
    // 檢查總購買數量
    const totalKey = `purchase:total:${userId}`;
    const totalCount = await redis.incr(totalKey);
    await redis.expire(totalKey, 3600); // 1小時
    
    if (totalCount > 20) {
      throw new Error('Hourly purchase limit exceeded');
    }
  }
  ```

#### 7.1.2 驗證碼機制
**功能細節：**
- **購買前驗證：**
  - 高價值票券（如 VIP）購買前需要驗證碼
  - 使用 reCAPTCHA v3 或 hCaptcha
  - 或自定義圖形驗證碼

- **驗證碼觸發條件：**
  - 單筆訂單金額超過閾值
  - 短時間內多次購買
  - 異常行為檢測

#### 7.1.3 實名制驗證（可選）
**功能細節：**
- **身份驗證：**
  - 購買特定活動需要實名認證
  - 上傳身份證件（OCR 識別）
  - 與票券 NFT 綁定身份資訊

- **防黃牛機制：**
  - 一人一證一票
  - 驗票時核對身份
  - 轉售時需要驗證買家身份

### 7.2 API 安全防護

#### 7.2.1 Rate Limiting
**功能細節：**
- **分層限流：**
  - IP 級別：每 IP 每分鐘最多 60 請求
  - 用戶級別：每用戶每分鐘最多 100 請求
  - API 級別：關鍵 API（如支付）更嚴格限制

- **實現方式：**
  - 使用 Redis + Token Bucket 算法
  - 或使用 Nginx rate limiting
  - 或使用專門的限流中間件（如 express-rate-limit）

- **限流策略：**
  ```javascript
  // 不同 API 不同限流規則
  const rateLimitRules = {
    '/api/auth/login': { windowMs: 15 * 60 * 1000, max: 5 }, // 15分鐘5次
    '/api/orders': { windowMs: 60 * 1000, max: 10 }, // 1分鐘10次
    '/api/ai/chat': { windowMs: 60 * 1000, max: 30 }, // 1分鐘30次
    '/api/verification/verify': { windowMs: 60 * 1000, max: 100 }, // 1分鐘100次
  };
  ```

#### 7.2.2 請求驗證
**功能細節：**
- **JWT Token 驗證：**
  - 所有需要認證的 API 驗證 JWT
  - Token 過期自動刷新
  - Token 黑名單機制（登出時加入黑名單）

- **請求簽名：**
  - 關鍵操作（如支付、轉售）需要請求簽名
  - 使用 HMAC-SHA256 簽名
  - 防止請求被篡改

- **CORS 配置：**
  - 嚴格限制允許的來源
  - 生產環境只允許特定域名

#### 7.2.3 SQL Injection 防護
**功能細節：**
- 使用參數化查詢（Prepared Statements）
- ORM 框架自動處理（如 Prisma、TypeORM）
- 輸入驗證和清理

#### 7.2.4 XSS 防護
**功能細節：**
- 所有用戶輸入進行 HTML 轉義
- 使用 Content Security Policy (CSP)
- 使用安全的模板引擎

### 7.3 數據安全

#### 7.3.1 敏感數據加密
**功能細節：**
- **加密存儲：**
  - 用戶 Email、電話等敏感資訊加密存儲
  - 使用 AES-256 加密
  - 加密金鑰使用環境變數管理

- **傳輸加密：**
  - 所有 API 使用 HTTPS
  - WebSocket 使用 WSS

#### 7.3.2 數據備份
**功能細節：**
- **自動備份：**
  - 資料庫每日自動備份
  - 保留最近 30 天的備份
  - 異地備份（不同區域）

- **備份驗證：**
  - 定期測試備份恢復
  - 備份完整性檢查

---

## 8. 錯誤處理與容錯機制

### 8.1 錯誤分類與處理

#### 8.1.1 錯誤類型
**功能細節：**
- **用戶錯誤（4xx）：**
  - 400 Bad Request：請求格式錯誤
  - 401 Unauthorized：未登入或 Token 無效
  - 403 Forbidden：權限不足
  - 404 Not Found：資源不存在
  - 409 Conflict：資源衝突（如票券已售完）
  - 429 Too Many Requests：請求過於頻繁

- **服務器錯誤（5xx）：**
  - 500 Internal Server Error：服務器內部錯誤
  - 502 Bad Gateway：上游服務錯誤
  - 503 Service Unavailable：服務暫時不可用
  - 504 Gateway Timeout：請求超時

- **區塊鏈錯誤：**
  - Sui 鏈連接失敗
  - 交易失敗（Gas 不足、合約錯誤等）
  - NFT 鑄造失敗

#### 8.1.2 錯誤處理策略
**功能細節：**
- **前端錯誤處理：**
  - 友好的錯誤提示訊息
  - 錯誤日誌記錄（Sentry 等）
  - 自動重試機制（網絡錯誤）
  - 錯誤邊界（Error Boundary）防止整個應用崩潰

- **後端錯誤處理：**
  - 統一錯誤格式：
    ```json
    {
      "error": {
        "code": "TICKET_SOLD_OUT",
        "message": "票券已售完",
        "details": {},
        "timestamp": "2024-01-01T00:00:00Z"
      }
    }
    ```
  - 錯誤日誌記錄（結構化日誌）
  - 錯誤通知（關鍵錯誤發送告警）

### 8.2 容錯機制

#### 8.2.1 重試機制
**功能細節：**
- **指數退避重試：**
  - 網絡請求失敗自動重試
  - 重試間隔：1s, 2s, 4s, 8s（最多 3 次）
  - 關鍵操作（如 NFT 鑄造）需要手動重試按鈕

- **重試場景：**
  - Sui 鏈查詢失敗
  - 支付 Gateway 連接失敗
  - AI API 調用失敗
  - 檔案上傳失敗

#### 8.2.2 降級策略
**功能細節：**
- **AI 服務降級：**
  - AI API 失敗時，使用關鍵字匹配搜尋
  - 顯示預設推薦活動
  - 提供傳統表單購票方式

- **鏈上操作降級：**
  - Sui 鏈暫時不可用時，先記錄訂單
  - 鏈恢復後批量處理 NFT 鑄造
  - 通知用戶延遲發放票券

- **支付降級：**
  - 主要支付方式失敗，提供備用支付方式
  - 記錄支付失敗，稍後重試

#### 8.2.3 事務管理
**功能細節：**
- **數據庫事務：**
  - 訂單創建和庫存扣減使用事務
  - 確保數據一致性
  - 失敗時自動回滾

- **分佈式事務（Saga 模式）：**
  - 支付成功 → NFT 鑄造 → 發送通知
  - 任何步驟失敗，執行補償操作
  - 使用消息隊列確保最終一致性

---

## 9. 緩存策略

### 9.1 多層緩存架構

#### 9.1.1 前端緩存
**功能細節：**
- **瀏覽器緩存：**
  - 靜態資源（圖片、CSS、JS）長期緩存
  - API 響應緩存（使用 Cache-Control）
  - Service Worker 緩存（PWA 支援）

- **React Query 緩存：**
  - 活動列表緩存 5 分鐘
  - 活動詳情緩存 10 分鐘
  - 用戶資訊緩存直到登出

#### 9.1.2 後端緩存
**功能細節：**
- **Redis 緩存：**
  - 活動列表：緩存 5 分鐘
  - 活動詳情：緩存 10 分鐘
  - 用戶資訊：緩存 30 分鐘
  - NFT 查詢結果：緩存 1 分鐘（鏈上數據）

- **緩存鍵設計：**
  ```
  events:list:{filters}:{page} -> Event[]
  events:detail:{eventId} -> Event
  users:info:{userId} -> User
  tickets:user:{userId} -> NFTTicket[]
  sui:object:{objectId} -> ObjectData
  ```

- **緩存失效策略：**
  - 活動更新時，清除相關緩存
  - 用戶購買後，清除活動庫存緩存
  - 使用 Cache Tags 批量清除

#### 9.1.3 CDN 緩存
**功能細節：**
- **靜態資源：**
  - 圖片、影片使用 CDN
  - 緩存時間：1 年（帶版本號）
  - 自動壓縮和優化

- **API 響應緩存（可選）：**
  - 公開 API（如活動列表）使用 CDN 緩存
  - 緩存時間：1-5 分鐘

### 9.2 緩存更新策略

#### 9.2.1 Cache-Aside 模式
**功能細節：**
- 讀取：先查緩存，沒有則查數據庫，再寫入緩存
- 更新：更新數據庫，刪除緩存
- 適用於：活動列表、活動詳情

#### 9.2.2 Write-Through 模式
**功能細節：**
- 寫入：同時更新數據庫和緩存
- 適用於：用戶資訊更新

---

## 10. 通知系統

### 10.1 通知類型

#### 10.1.1 用戶通知
**功能細節：**
- **購買相關：**
  - 支付成功通知
  - NFT 鑄造成功通知
  - 購買失敗通知
  - 退款通知

- **活動相關：**
  - 活動即將開始提醒（提前 1 天、1 小時）
  - 活動取消通知
  - 活動改期通知
  - 新活動推薦

- **票券相關：**
  - 轉售成功通知
  - 轉售取消通知
  - 收到轉售票券通知

#### 10.1.2 主辦方通知
**功能細節：**
- **銷售相關：**
  - 新訂單通知
  - 支付成功通知
  - 銷售統計日報/週報

- **活動相關：**
  - 活動審核結果
  - 活動即將開始提醒
  - 異常情況告警（大量退款、異常購買）

### 10.2 通知渠道

#### 10.2.1 站內通知
**功能細節：**
- **通知中心：**
  - 右上角通知圖標
  - 未讀數量標記
  - 通知列表頁面
  - 標記已讀功能

- **實時推送：**
  - WebSocket 連接
  - 新通知即時顯示
  - 瀏覽器通知（需要用戶授權）

#### 10.2.2 Email 通知
**功能細節：**
- **發送時機：**
  - 重要操作（支付、NFT 鑄造）
  - 活動提醒
  - 定期摘要（可選）

- **Email 模板：**
  - 使用 HTML 模板
  - 響應式設計
  - 品牌風格統一

#### 10.2.3 SMS 通知（可選）
**功能細節：**
- **發送場景：**
  - 活動開始前 1 小時提醒
  - 緊急通知（活動取消）

- **實現方式：**
  - 使用 Twilio 或類似服務
  - 需要用戶授權和手機號碼

### 10.3 通知實現

#### 10.3.1 消息隊列
**功能細節：**
- **使用 RabbitMQ / Redis Queue：**
  - 異步發送通知
  - 防止阻塞主流程
  - 支持重試和失敗處理

- **通知流程：**
  ```
  事件發生 → 創建通知任務 → 加入隊列 → 
  通知服務處理 → 發送通知 → 記錄發送狀態
  ```

#### 10.3.2 通知模板管理
**功能細節：**
- **模板系統：**
  - 每種通知類型對應一個模板
  - 支持變數替換（如 {userName}, {eventName}）
  - 多語言支持

---

## 11. 監控與分析

### 11.1 系統監控

#### 11.1.1 性能監控
**功能細節：**
- **關鍵指標：**
  - API 響應時間（P50, P95, P99）
  - 錯誤率
  - 請求量（QPS）
  - 數據庫查詢時間
  - Sui 鏈查詢時間

- **監控工具：**
  - APM：New Relic / Datadog / Sentry
  - 日誌聚合：ELK Stack / Loki
  - 指標收集：Prometheus + Grafana

#### 11.1.2 資源監控
**功能細節：**
- **服務器資源：**
  - CPU 使用率
  - 內存使用率
  - 磁盤使用率
  - 網絡帶寬

- **數據庫監控：**
  - 連接數
  - 查詢性能
  - 慢查詢日誌
  - 鎖等待

#### 11.1.3 告警機制
**功能細節：**
- **告警規則：**
  - 錯誤率 > 5% → 立即告警
  - API 響應時間 > 2s → 警告
  - 服務器 CPU > 80% → 警告
  - 數據庫連接池耗盡 → 緊急告警

- **告警渠道：**
  - Email
  - Slack / Discord
  - 短信（緊急情況）

### 11.2 業務分析

#### 11.2.1 用戶行為分析
**功能細節：**
- **追蹤事件：**
  - 頁面瀏覽（Page View）
  - 活動查看（Event View）
  - 購票流程各步驟（Funnel）
  - AI 對話互動
  - 支付完成
  - 轉售行為

- **分析工具：**
  - Google Analytics
  - Mixpanel / Amplitude
  - 自建分析系統

#### 11.2.2 業務指標
**功能細節：**
- **銷售指標：**
  - 總銷售額（GMV）
  - 訂單數量
  - 平均訂單金額（AOV）
  - 轉化率（瀏覽 → 購買）
  - 各活動銷售排名

- **用戶指標：**
  - 日活躍用戶（DAU）
  - 月活躍用戶（MAU）
  - 新用戶註冊數
  - 用戶留存率
  - 平均會話時長

- **活動指標：**
  - 活動瀏覽量
  - 活動轉化率
  - 各票種銷售情況
  - 退票率

#### 11.2.3 數據報表
**功能細節：**
- **主辦方報表：**
  - 活動銷售報表（日/週/月）
  - 用戶畫像分析
  - 銷售趨勢圖

- **平台報表：**
  - 整體業務概覽
  - 各主辦方表現
  - 平台收入統計

---

## 12. 退款與取消機制

### 12.1 退款政策

#### 12.1.1 退款規則
**功能細節：**
- **退款條件：**
  - 活動取消：全額退款
  - 活動改期：用戶可選擇退款或保留票券
  - 用戶主動退款：根據退款政策（如活動開始前 7 天可退款）
  - 不可退款票券：標記為 "No Refund"

- **退款金額計算：**
  - 全額退款
  - 部分退款（扣除手續費）
  - 退款到原支付方式

#### 12.1.2 退款流程
**功能細節：**
- **用戶發起退款：**
  1. 用戶在「我的票券」選擇要退款的票券
  2. 檢查是否符合退款條件
  3. 確認退款金額
  4. 提交退款申請
  5. 主辦方審核（自動或手動）
  6. 審核通過後執行退款
  7. 銷毀或標記 NFT 為已退款
  8. 通知用戶退款完成

- **自動退款：**
  - 活動取消時自動退款
  - 批量處理退款
  - 使用消息隊列異步處理

#### 12.1.3 NFT 處理
**功能細節：**
- **退款後 NFT 處理：**
  - 選項 1：銷毀 NFT（Burn）
  - 選項 2：標記為已退款（修改 metadata）
  - 選項 3：轉移到主辦方錢包

- **實現方式：**
  ```move
  // Move 合約中的退款函數
  public fun refund_ticket(
    ticket: TicketNFT,
    ctx: &mut TxContext
  ) {
    // 標記為已退款
    ticket.is_refunded = true;
    // 或銷毀
    // transfer::public_transfer(ticket, @0x0);
  }
  ```

### 12.2 活動取消處理

#### 12.2.1 取消流程
**功能細節：**
- **主辦方取消活動：**
  1. 主辦方在後台選擇取消活動
  2. 選擇取消原因
  3. 確認取消
  4. 系統自動：
     - 停止售票
     - 通知所有購票用戶
     - 發起自動退款
     - 更新活動狀態

- **系統自動取消：**
  - 活動開始前 24 小時，售票量 < 10% → 警告
  - 活動開始前 12 小時，售票量 < 5% → 建議取消
  - 極端天氣等不可抗力 → 自動取消

#### 12.2.2 通知機制
**功能細節：**
- **多渠道通知：**
  - 站內通知
  - Email 通知
  - SMS 通知（如果用戶提供手機號）
  - 推送通知（如果用戶安裝 App）

- **通知內容：**
  - 活動取消原因
  - 退款金額和時間
  - 替代活動推薦（如果有）

---

## 13. 權限管理系統

### 13.1 角色定義

#### 13.1.1 用戶角色
**功能細節：**
- **一般用戶（User）：**
  - 瀏覽活動
  - 購買票券
  - 管理自己的票券
  - 使用 AI 對話

- **主辦方（Organizer）：**
  - 所有一般用戶權限
  - 創建和管理活動
  - 查看銷售統計
  - 管理驗票人員

- **驗票人員（Verifier）：**
  - 驗證票券
  - 查看驗證記錄
  - 查看驗證統計

- **平台管理員（Admin）：**
  - 所有權限
  - 審核主辦方
  - 管理平台設定
  - 查看全平台數據

#### 13.1.2 權限細分
**功能細節：**
- **活動權限：**
  - `events:create` - 創建活動
  - `events:edit` - 編輯活動（只能編輯自己的）
  - `events:delete` - 刪除活動
  - `events:view` - 查看活動
  - `events:view:all` - 查看所有活動（管理員）

- **票券權限：**
  - `tickets:view:own` - 查看自己的票券
  - `tickets:resell` - 轉售票券
  - `tickets:verify` - 驗證票券（驗票人員）

- **財務權限：**
  - `finance:view:own` - 查看自己的財務（主辦方）
  - `finance:view:all` - 查看所有財務（管理員）

### 13.2 權限檢查

#### 13.2.1 中間件實現
**功能細節：**
```javascript
// 權限檢查中間件
function requirePermission(permission) {
  return async (req, res, next) => {
    const user = req.user;
    const hasPermission = await checkUserPermission(user.id, permission);
    
    if (!hasPermission) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to perform this action'
      });
    }
    
    next();
  };
}

// 使用範例
router.post('/events', 
  authenticate,
  requirePermission('events:create'),
  createEvent
);
```

#### 13.2.2 資源級別權限
**功能細節：**
- **所有權檢查：**
  - 主辦方只能編輯自己的活動
  - 用戶只能查看自己的票券
  - 驗票人員只能驗證指定活動的票券

- **實現方式：**
  ```javascript
  async function checkEventOwnership(userId, eventId) {
    const event = await db.events.findUnique({
      where: { id: eventId },
      include: { organizer: true }
    });
    
    return event.organizer.userId === userId;
  }
  ```

---

## 14. 日誌與審計

### 14.1 日誌分類

#### 14.1.1 操作日誌
**功能細節：**
- **記錄內容：**
  - 用戶操作（登入、登出、購買、轉售）
  - 主辦方操作（創建活動、編輯活動）
  - 管理員操作（審核、設定修改）
  - 驗票操作（驗證成功/失敗）

- **日誌格式：**
  ```json
  {
    "timestamp": "2024-01-01T00:00:00Z",
    "level": "info",
    "userId": "user-123",
    "action": "purchase_ticket",
    "resource": "order-456",
    "details": {
      "eventId": "event-789",
      "quantity": 2,
      "amount": 3000
    },
    "ip": "192.168.1.1",
    "userAgent": "Mozilla/5.0..."
  }
  ```

#### 14.1.2 審計日誌
**功能細節：**
- **關鍵操作審計：**
  - 財務操作（退款、結算）
  - 權限變更
  - 敏感數據訪問
  - 系統設定修改

- **審計日誌特點：**
  - 不可修改（只追加）
  - 長期保存（至少 1 年）
  - 加密存儲
  - 定期備份

### 14.2 日誌管理

#### 14.2.1 日誌收集
**功能細節：**
- **集中式日誌：**
  - 使用 ELK Stack（Elasticsearch + Logstash + Kibana）
  - 或使用雲服務（AWS CloudWatch、Google Cloud Logging）

- **日誌傳輸：**
  - 應用直接寫入日誌服務
  - 或使用 Filebeat 收集本地日誌

#### 14.2.2 日誌查詢
**功能細節：**
- **查詢功能：**
  - 按時間範圍查詢
  - 按用戶 ID 查詢
  - 按操作類型查詢
  - 按錯誤級別查詢

- **可視化：**
  - 日誌儀表板
  - 錯誤趨勢圖
  - 操作統計

---

## 15. 性能優化策略

### 15.1 數據庫優化

#### 15.1.1 索引優化
**功能細節：**
- **關鍵索引：**
  ```sql
  -- 活動表索引
  CREATE INDEX idx_events_status ON events(status);
  CREATE INDEX idx_events_start_time ON events(start_time);
  CREATE INDEX idx_events_organizer ON events(organizer_id);
  CREATE INDEX idx_events_search ON events USING GIN(to_tsvector('english', name || ' ' || description));
  
  -- 訂單表索引
  CREATE INDEX idx_orders_user ON orders(user_id);
  CREATE INDEX idx_orders_event ON orders(event_id);
  CREATE INDEX idx_orders_created ON orders(created_at);
  
  -- 票券表索引
  CREATE INDEX idx_tickets_user ON nft_tickets(user_id);
  CREATE INDEX idx_tickets_event ON nft_tickets(event_id);
  CREATE INDEX idx_tickets_sui_object ON nft_tickets(sui_object_id);
  CREATE INDEX idx_tickets_number ON nft_tickets(ticket_number);
  ```

#### 15.1.2 查詢優化
**功能細節：**
- **避免 N+1 查詢：**
  - 使用 JOIN 或 include（Prisma）
  - 批量查詢相關數據

- **分頁優化：**
  - 使用 cursor-based pagination（游標分頁）
  - 避免 OFFSET（大偏移量性能差）

- **讀寫分離：**
  - 讀操作使用只讀副本
  - 寫操作使用主數據庫

### 15.2 前端優化

#### 15.2.1 代碼分割
**功能細節：**
- **路由級別分割：**
  - 每個路由單獨打包
  - 按需加載

- **組件級別分割：**
  - 大型組件使用 React.lazy
  - 第三方庫按需引入

#### 15.2.2 資源優化
**功能細節：**
- **圖片優化：**
  - 使用 WebP 格式
  - 響應式圖片（srcset）
  - 懶加載（Lazy Loading）
  - 圖片壓縮

- **代碼優化：**
  - Tree Shaking
  - Minification
  - Gzip/Brotli 壓縮

### 15.3 鏈上操作優化

#### 15.3.1 批量操作
**功能細節：**
- **批量鑄造：**
  - 一次交易鑄造多張 NFT
  - 減少 Gas 費用
  - 提高效率

- **批量查詢：**
  - 使用 multiGetObjects 一次查詢多個 NFT
  - 減少網絡請求

#### 15.3.2 異步處理
**功能細節：**
- **非阻塞操作：**
  - NFT 鑄造使用消息隊列
  - 異步處理，立即返回訂單
  - 後台處理完成後通知用戶

---

## 16. 測試策略

### 16.1 單元測試

#### 16.1.1 後端單元測試
**功能細節：**
- **測試覆蓋：**
  - 業務邏輯函數
  - 數據驗證
  - 錯誤處理

- **測試框架：**
  - Jest（Node.js）
  - pytest（Python）

#### 16.1.2 前端單元測試
**功能細節：**
- **測試覆蓋：**
  - React 組件
  - 工具函數
  - Hooks

- **測試框架：**
  - Jest + React Testing Library

### 16.2 集成測試

#### 16.2.1 API 測試
**功能細節：**
- **測試場景：**
  - 完整 API 流程
  - 數據庫交互
  - 外部服務調用（Mock）

- **測試工具：**
  - Supertest（Node.js）
  - Postman / Newman

#### 16.2.2 端到端測試
**功能細節：**
- **測試場景：**
  - 完整用戶流程（註冊 → 購票 → 驗票）
  - 主辦方流程（創建活動 → 查看統計）
  - AI 對話流程

- **測試工具：**
  - Playwright / Cypress
  - 自動化測試腳本

### 16.3 區塊鏈測試

#### 16.3.1 Move 合約測試
**功能細節：**
- **測試內容：**
  - NFT 鑄造
  - NFT 轉移
  - 權限檢查
  - 錯誤處理

- **測試框架：**
  - Sui Move 測試框架
  - 本地測試網

#### 16.3.2 鏈上集成測試
**功能細節：**
- **測試環境：**
  - Sui Testnet
  - 測試帳戶和資金
  - 自動化測試腳本

---

## 17. 移動端優化

### 17.1 響應式設計

#### 17.1.1 移動端適配
**功能細節：**
- **斷點設計：**
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px

- **觸控優化：**
  - 按鈕大小至少 44x44px
  - 間距適宜
  - 手勢支持（滑動、長按）

#### 17.1.2 PWA 支持
**功能細節：**
- **功能：**
  - Service Worker（離線支持）
  - Web App Manifest
  - 添加到主屏幕
  - 推送通知

### 17.2 移動端特殊功能

#### 17.2.1 相機整合
**功能細節：**
- **QR Code 掃描：**
  - 驗票人員使用手機掃描
  - 直接調用相機 API
  - 即時識別和驗證

#### 17.2.2 地理位置
**功能細節：**
- **附近活動：**
  - 使用 GPS 定位
  - 推薦附近活動
  - 顯示距離

---

## 18. 國際化與多語言

### 18.1 多語言支持

#### 18.1.1 語言列表
**功能細節：**
- **支持語言：**
  - 繁體中文
  - 簡體中文
  - English
  - 日文（可選）

#### 18.1.2 實現方式
**功能細節：**
- **i18n 框架：**
  - react-i18next（前端）
  - i18next（後端）

- **翻譯管理：**
  - 翻譯文件結構：
    ```
    locales/
      zh-TW/
        common.json
        events.json
        tickets.json
      en/
        common.json
        events.json
        tickets.json
    ```

- **動態切換：**
  - 用戶選擇語言
  - 存儲在 localStorage
  - 或根據瀏覽器語言自動檢測

### 18.2 本地化

#### 18.2.1 時間本地化
**功能細節：**
- **時區處理：**
  - 所有時間存儲為 UTC
  - 前端根據用戶時區顯示
  - 活動時間顯示本地時間

#### 18.2.2 貨幣本地化
**功能細節：**
- **貨幣格式：**
  - 根據地區顯示貨幣符號
  - 數字格式（千分位分隔符）
  - 匯率轉換（可選）

---

## 19. 擴展性設計

### 19.1 水平擴展

#### 19.1.1 無狀態設計
**功能細節：**
- **應用服務器：**
  - 無狀態設計，可輕鬆擴展
  - Session 存儲在 Redis
  - 負載均衡

#### 19.1.2 數據庫擴展
**功能細節：**
- **讀寫分離：**
  - 主從複製
  - 讀操作分散到多個副本

- **分片（Sharding）：**
  - 按用戶 ID 分片
  - 或按活動 ID 分片

### 19.2 微服務架構（未來）

#### 19.2.1 服務拆分
**功能細節：**
- **服務劃分：**
  - 用戶服務（User Service）
  - 活動服務（Event Service）
  - 訂單服務（Order Service）
  - 支付服務（Payment Service）
  - AI 服務（AI Service）
  - 通知服務（Notification Service）

#### 19.2.2 服務通信
**功能細節：**
- **同步通信：**
  - REST API
  - GraphQL（可選）

- **異步通信：**
  - 消息隊列（RabbitMQ / Kafka）
  - 事件驅動架構

---

## 總結

這是一個完整的 NFT 票務系統架構設計，涵蓋了：
- 賣方（主辦方）的完整功能
- 買方（用戶）的完整體驗
- 驗票流程的詳細設計
- 數據結構和 API 設計
- 技術實現細節
- **新增：安全性機制、錯誤處理、緩存策略、通知系統、監控分析、退款機制、權限管理、日誌審計、性能優化、測試策略、移動端優化、國際化、擴展性設計**

接下來可以根據這個架構開始實作。你覺得還有哪些部分需要補充或修改嗎？

