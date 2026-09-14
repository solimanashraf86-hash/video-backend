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
    // توليد رابط المشهد الذكي
    const mediaUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}%20cinematic%20video%20animation?width=1024&height=576&nologo=true`;

    return res.json({
      success: true,
      mediaUrl: mediaUrl,
      message: 'تم تجهيز المشهد بنجاح!'
    });

  } catch (error) {
    console.error('Generation Error:', error);
    return res.status(500).json({ error: 'حدث خطأ أثناء معالجة الطلب.' });
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
