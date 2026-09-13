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
app.use(express.static(path.join(__dirname, 'public')));

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

app.post('/api/generate', async (req, res) => {
  const { prompt, ratio } = req.body;

  if (!process.env.REPLICATE_API_TOKEN) {
    return res.status(400).json({ error: 'مفتاح REPLICATE_API_TOKEN غير موجود في إعدادات Vercel.' });
  }

  try {
    // تشغيل نموذج توليد الفيديو عبر Replicate
    const output = await replicate.run(
      "minimax/video-01",
      {
        input: {
          prompt: prompt,
          aspect_ratio: ratio || "9:16"
        }
      }
    );

    // استخراج رابط الفيديو النهائي
    const videoUrl = Array.isArray(output) ? output[0] : output;

    res.json({
      success: true,
      videoUrl: videoUrl,
      message: 'تم إنشاء الفيديو بنجاح!'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message || 'حدث خطأ أثناء إنشاء الفيديو.' });
  }
});

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
