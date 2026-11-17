import cors from 'cors';
import express from 'express';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

// 取得當前檔案的目錄路徑
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// 中間件
app.use(cors());
app.use(express.json());

// 請求日誌中間件（用來確認請求真的打到 mock server）
app.use((req, res, next) => {
  console.log(`[mock] ${req.method} ${req.url}`);
  next();
});

// 讀取 JSON 檔案的函數
function readDB(filename) {
  try {
    const filePath = path.join(__dirname, 'data', filename);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  File not found: ${filePath}, returning empty array`);
      return [];
    }
    const data = fs.readJsonSync(filePath);
    return data;
  } catch (error) {
    return [];
  }
}

// === API 路由 ===
// 用戶路由
app.post('/v1/auth', (req, res) => {
  const login = readDB('auth.json');
  res.json(login);
});

app.get('/v1/members', (req, res) => {
  const login = readDB('members.json');
  res.json(login);
});

app.patch('/v1/members/:memberId', (req, res) => {
  const login = readDB('members.json');
  res.json(login);
});

app.get('/v1/ticketTypes', (req, res) => {
  const login = readDB('ticketTypes.json');
  res.json(login);
});

app.post('/v1/payments', (req, res) => {
  const login = readDB('postPayments.json');
  res.json(login);
});

// ===== 付款流程測試情境（#310）=====
// 用 POST /__scenario 切換，例如 {"payment":"202","orderSequence":["pending","completed"]}
const defaultScenario = () => ({
  create: 'ok', // ok | error | hang
  payment: '200', // 200 | 202 | 500 | 500-charged | 422 | slow | hang
  slowMs: 20000, // payment=slow 時延遲多久才回 200
  // GET /v1/orders/:id 依序回傳的狀態；最後一個會一直重複
  // 可用值：pending | completed | failed | error(回 500) | hang(不回應)
  orderSequence: ['completed'],
});
let scenario = defaultScenario();
let orderPollIndex = 0;
let orderSeq = 0;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

app.get('/__scenario', (req, res) => res.json({ scenario, orderPollIndex }));
app.post('/__scenario', (req, res) => {
  scenario = { ...defaultScenario(), ...req.body };
  orderPollIndex = 0;
  console.log('[mock] scenario =', scenario);
  res.json(scenario);
});

// 建立訂單
app.post('/v1/orders/create', (req, res) => {
  if (scenario.create === 'hang') return; // 不回應，讓前端 timeout
  if (scenario.create === 'error') {
    return res.status(500).json({ message: '[mock] 建立訂單失敗' });
  }
  orderSeq += 1;
  res.json({ orderId: `order-test-${orderSeq}` });
});

// 付款
app.post('/v1/payments/create', async (req, res) => {
  const { orderId } = req.body;
  orderPollIndex = 0; // 新的付款從頭開始輪詢序列

  switch (scenario.payment) {
    case '200':
      return res
        .status(200)
        .json({ message: 'Order payment successful. 訂單已完成付款。' });
    case '202':
      return res.status(202).json({
        message: '[mock] needs 3DS',
        // 直接導回本機付款頁，模擬 3DS 驗證成功後的回傳
        redirectUrl: `http://localhost:5173/conf-ticket/payment?order_number=${orderId}&status=0`,
      });
    case '500':
      return res
        .status(500)
        .json({ message: '金流服務交易未成功，請稍候再試。若持續發生請聯繫客服。' });
    case '500-charged':
      // TapPay 已扣款、但 BE 寫入付款紀錄失敗（BE 訊息與正式環境相同）
      return res
        .status(500)
        .json({ message: '已進入付款流程但伺服器發生未預期錯誤。請聯繫客服。' });
    case '422':
      return res.status(422).json({
        message: '訂單狀態錯誤，請聯繫客服。',
        orderId,
        orderStatus: 'completed',
      });
    case 'slow':
      await sleep(scenario.slowMs);
      return res
        .status(200)
        .json({ message: 'Order payment successful. 訂單已完成付款。' });
    case 'hang':
      return; // 不回應，讓前端 timeout
  }
});

// 查詢單筆訂單（3DS 輪詢、結果不明時確認）
app.get('/v1/orders/:id', (req, res) => {
  const seq = scenario.orderSequence;
  const status = seq[Math.min(orderPollIndex, seq.length - 1)];
  orderPollIndex += 1;
  console.log(`[mock] order ${req.params.id} poll #${orderPollIndex} → ${status}`);

  if (status === 'hang') return;
  if (status === 'error') {
    return res.status(500).json({ message: '[mock] 查詢失敗' });
  }
  res.json({ id: req.params.id, status, tickets: [] });
});

// 錯誤處理
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

// 錯誤處理
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(404).json({
    error: 'Not found',
    message: err.message,
  });
});

app.listen(PORT, () => {
  console.log('Conference Ticket API Server Started!');
});
