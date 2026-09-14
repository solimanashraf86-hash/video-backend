import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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
    const finalPrompt = prompt || "cinematic slow motion, photorealistic, 8k resolution";

    const response = await fetch("https://api-inference.huggingface.co/models/damo-vilab/text-to-video-ms-1.7b", {
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST",
      body: JSON.stringify({ inputs: finalPrompt })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`خطأ من الخادم: ${response.status} - ${errorText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64Video = Buffer.from(arrayBuffer).toString('base64');
    const dataUri = `data:video/mp4;base64,${base64Video}`;

    res.json({
      success: true,
      videoUrl: dataUri,
      message: 'تم توليد الفيديو بنجاح مجاناً!'
    });

  } catch (error) {
    console.error('Generation Error:', error);
    res.status(500).json({ 
      error: error.message || 'حدث خطأ أثناء معالجة الفيديو في الخادم المجاني.' 
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
