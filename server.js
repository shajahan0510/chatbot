require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// 1. Tell server to serve static files (css, js, images) from 'public'
app.use(express.static(path.join(__dirname, 'public')));

// 2. Explicitly handle the root URL to send the HTML file
// This fixes the "Cannot GET /" error
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialize Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, model, temperature, systemPrompt } = req.body;

    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: 'Messages are required' });
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt || 'You are a helpful assistant.' },
        ...messages
      ],
      model: model || 'llama-3.3-70b-versatile',
      temperature: temperature || 0.7,
      max_tokens: 4096,
    });

    const responseMessage = chatCompletion.choices[0]?.message?.content || '';
    
    res.json({ 
      success: true, 
      message: responseMessage 
    });

  } catch (error) {
    console.error('Groq API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch response from Groq' 
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
