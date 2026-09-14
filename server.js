import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client } from '@gradio/client';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/generate', async (req, res) => {
  const { prompt, imageUrl } = req.body;

  if (!prompt && !imageUrl) {
    return res.status(400).json({ error: 'يرجى إدخال وصف أو رفع صورة.' });
  }

  try {
    const client = await Client.connect("multimodalart/Wan2.1-T2V-1.3B");

    let result;
    if (imageUrl) {
      const imageBlob = await (await fetch(imageUrl)).blob();
      result = await client.predict("/generate", {
        prompt: prompt || "cinematic high quality motion, ultra-detailed 8k",
        input_image: imageBlob
      });
    } else {
      result = await client.predict("/generate", {
        prompt: prompt
      });
    }

    const videoData = result.data?.[0];
    const videoUrl = typeof videoData === 'object' && videoData.url ? videoData.url : videoData;

    if (!videoUrl) {
      throw new Error('تعذر استخراج رابط الفيديو من المزود المجاني.');
    }

    res.json({
      success: true,
      videoUrl: videoUrl,
      message: 'تم توليد الفيديو بنجاح!'
    });

  } catch (error) {
    console.error('HuggingFace Error:', error);
    res.status(500).json({ 
      error: error.message || 'فشلت معالجة الفيديو في الخادم المجاني.' 
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
