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

// 請求日誌中間件
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.path} - Query:`, req.query);
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

app.post('/v1/payments', (req, res) => {
  const login = readDB('postPayments.json');
  res.json(login);
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
