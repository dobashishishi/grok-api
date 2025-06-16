const express = require("express");
const cors = require("cors");
const { OpenAI } = require("openai");

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/api/generate", async (req, res) => {
  const { topic } = req.body;
  try {
    const messages = [
      {
        role: "system",
        content: "あなたは英語教師です。英語学習者に合わせてクイズを作成してください。",
      },
      {
        role: "user",
        content: `「${topic}」に関する英単語クイズを1問作ってください。問題文、4択の選択肢（choices）、正解の番号（answerIndex）をJSON形式で返してください。`,
      },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Grok の代替（後ほど差し替え）
      messages,
      temperature: 0.7,
    });

    const text = completion.choices[0].message.content.trim();
    const quiz = JSON.parse(text);

    res.json(quiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "問題生成でエラーが発生しました。" });
  }
});

app.post("/api/score", async (req, res) => {
  const { question, userAnswer } = req.body;
  try {
    const messages = [
      {
        role: "system",
        content: "あなたは英語教師です。クイズの回答を採点し、正誤と簡単な解説を日本語で返してください。",
      },
      {
        role: "user",
        content: `問題: ${JSON.stringify(question)}\nユーザーの回答: ${userAnswer}`,
      },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Grok の代替（後ほど差し替え）
      messages,
      temperature: 0,
    });

    res.json({ result: completion.choices[0].message.content.trim() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "採点でエラーが発生しました。" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
