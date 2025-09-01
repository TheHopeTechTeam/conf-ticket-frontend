### 📁 專案結構

```
src/
├── components/           # 可重複使用的 UI 組件
│   └── common/
│       ├── Layout/       # 頁面佈局
│       ├── Header/       # 頁首組件
│       ├── Footer/       # 頁尾組件
│       ├── PaymentSelect/# 付款方式選擇
│       ├── CreditCard/   # 信用卡表單
│       └── ...
├── pages/               # 頁面組件
│   ├── Main/           # 主頁面
│   ├── Login/          # 登入頁面
│   ├── Booking/        # 票券預訂
│   ├── Payment/        # 付款頁面
│   ├── Tickets/        # 我的票券
│   └── ...
├── hooks/              # 自定義 React Hooks
│   ├── useAuth.ts      # 身份驗證
│   ├── useTapPay.ts    # TapPay 整合
│   └── ...
├── contexts/           # React Context
├── constants/          # 常數定義
├── types/             # TypeScript 型別定義
└── api/               # API 服務層
```

### 環境需求

- Node.js 18+
- pnpm

### 安裝依賴

```bash
pnpm install
```

### 環境變數設定

創建 `.env` 檔案並設定以下變數：

```env
VITE_TAPPAY_APP_ID=your_tappay_app_id
VITE_TAPPAY_APP_KEY=your_tappay_app_key
VITE_APPLE_MERCHANT_ID=your_apple_merchant_id
VITE_GOOGLE_MERCHANT_ID=your_google_merchant_id
```

### 開發模式

```bash
# 啟動前端開發服務器
pnpm run dev

# 啟動模擬 API 服務器
pnpm run mock-server

# 同時啟動前端和模擬 API
pnpm run dev-with-api-watch
```

### 構建專案

```bash
# TypeScript 編譯檢查並構建
pnpm run build

# 預覽構建結果
pnpm run preview
```

### 程式碼品質檢查

```bash
# ESLint 檢查
pnpm run lint
```

### 可用腳本

- `pnpm run dev` - 啟動開發服務器
- `pnpm run build` - 構建生產版本
- `pnpm run lint` - 程式碼檢查
- `pnpm run preview` - 預覽構建結果
- `pnpm run mock-server` - 啟動 Mock API 服務器
- `pnpm run mock-server:watch` - 監控模式啟動 Mock API
- `pnpm run dev-with-api` - 同時啟動前端和 API 服務

### 主要頁面

1. **主頁面** (`/`) - 系統入口，提供主要功能導航
2. **登入頁面** (`/login`) - 使用者身份驗證
3. **票券預訂** (`/booking`) - 選擇和預訂票券
4. **付款頁面** (`/payment`) - 處理付款流程
5. **我的票券** (`/tickets`) - 查看已購買的票券
6. **個人檔案** (`/profile`) - 管理使用者資訊
7. **退費申請** (`/refund`) - 申請票券退費
8. **票券分發** (`/ticket-distribution`) - 分發票券給其他使用者

### 身份驗證

系統使用 React Context 來管理使用者身份驗證狀態：

- 受保護的路由需要使用者登入
- 自動重導向未驗證使用者到登入頁面
- 支援登入狀態持久化
