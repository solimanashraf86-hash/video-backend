import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Replicate from 'replicate';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

app.get('/', (req, res) => {
  res.send('AI Video Server is Live');
});

app.post('/api/generate', async (req, res) => {
  const { prompt, image } = req.body;
  if (!prompt && !image) {
    return res.status(400).json({ error: "الوصف النصي مطلوب." });
  }

  try {
    const input = {
      prompt: prompt || "Cinematic commercial footage, 8k",
      prompt_optimizer: true
    };
    if (image) input.first_frame_image = image;

    const output = await replicate.run("minimax/video-01", { input });
    res.json({ status: "completed", video_url: output });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "فشلت المعالجة السحابية." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
