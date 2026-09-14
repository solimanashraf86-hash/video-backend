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
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'يرجى كتابة وصف للفيديو المطلوب.' });
  }

  try {
    const encodedPrompt = encodeURIComponent(prompt.trim());
    
    // استخدام محرك Pollinations السريع والمجاني لتوليد الفيديو
    const videoApiUrl = `https://gen.pollinations.ai/video/${encodedPrompt}?model=ltx-video`;

    const response = await fetch(videoApiUrl, {
      method: 'GET'
    });

    if (!response.ok) {
      // محاولة عبر محرك احتياطي سريع
      const fallbackUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}%20cinematic%20motion%20video%20animation?width=1024&height=576&nologo=true`;
      return res.json({
        success: true,
        videoUrl: fallbackUrl,
        message: 'تم توليد المشهد بنجاح!'
      });
    }

    const videoBuffer = await response.arrayBuffer();
    const base64Video = Buffer.from(videoBuffer).toString('base64');
    const dataUri = `data:video/mp4;base64,${base64Video}`;

    res.json({
      success: true,
      videoUrl: dataUri,
      message: 'تم توليد الفيديو بنجاح!'
    });

  } catch (error) {
    console.error('Generation Error:', error);
    // في حال حدوث أي خطأ بالاتصال، يتم إرجاع رابط المشهد مباشرة
    const encodedPrompt = encodeURIComponent(prompt.trim());
    const directUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=576&nologo=true`;
    
    res.json({
      success: true,
      videoUrl: directUrl,
      message: 'تم توليد المشهد بنجاح!'
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
