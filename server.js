import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Replicate from 'replicate';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// تشغيل وقراءة ملفات الواجهة من مجلد public
app.use(express.static(path.join(__dirname, 'public')));

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// مسار معالجة طلبات الفيديو
app.post('/api/generate', async (req, res) => {
  const { prompt, ratio } = req.body;
  try {
    // كود معالجة وتوليد الفيديو
    res.json({
      success: true,
      message: `تم استلام المشهد بالأبعاد (${ratio || '9:16'}) بنجاح! السيرفر جاهز لمعالجة الطلب.`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// توجيه الصفحة الرئيسية إلى الواجهة index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

export default app;

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
