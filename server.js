// TechEase AI Proxy Server
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = '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'; // <-- Insert your OpenAI API key here (keep this secret!)

app.post('/api/ask', async (req, res) => {
  const { userMsg } = req.body;
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {role: 'system', content: 'You are a helpful IT support assistant. Answer user questions clearly and concisely.'},
          {role: 'user', content: userMsg}
        ],
        max_tokens: 200
      })
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'AI proxy server error.' });
  }
});

app.listen(3001, () => console.log('TechEase AI Proxy server running on http://localhost:3001'));
