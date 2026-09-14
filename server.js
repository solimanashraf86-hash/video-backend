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
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

app.post('/api/generate', async (req, res) => {
  const { prompt, imageUrl } = req.body;

  if (!process.env.REPLICATE_API_TOKEN) {
    return res.status(400).json({ 
      error: 'مفتاح REPLICATE_API_TOKEN غير موجود في إعدادات Vercel.' 
    });
  }

  if (!prompt && !imageUrl) {
    return res.status(400).json({ error: 'يرجى إدخال وصف أو رفع صورة.' });
  }

  try {
    const inputPayload = {
      prompt: prompt || 'cinematic subtle motion, realistic high quality 8k'
    };

    if (imageUrl) {
      inputPayload.first_frame_image = imageUrl;
    }

    const output = await replicate.run(
      "minimax/video-01",
      {
        input: inputPayload
      }
    );

    let videoUrl = null;
    if (Array.isArray(output) && output.length > 0) {
      videoUrl = output[0];
    } else if (typeof output === 'string') {
      videoUrl = output;
    } else if (output && output.url) {
      videoUrl = typeof output.url === 'function' ? output.url() : output.url;
    } else if (output && typeof output === 'object') {
      videoUrl = String(output);
    }

    if (!videoUrl) {
      throw new Error('تعذر استخراج رابط الفيديو من الخادم.');
    }

    res.json({
      success: true,
      videoUrl: videoUrl,
      message: 'تم توليد الفيديو من الصورة بنجاح!'
    });

  } catch (error) {
    console.error('Generation Error:', error);
    res.status(500).json({ 
      error: error.message || 'حدث خطأ أثناء معالجة الفيديو.' 
    });
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
