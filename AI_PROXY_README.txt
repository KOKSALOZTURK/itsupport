# TechEase AI Proxy Server Setup

This proxy server allows your frontend to securely access the OpenAI API without exposing your API key or running into CORS issues.

## 1. Prerequisites
- Node.js and npm installed (https://nodejs.org/)

## 2. Install Dependencies
Open a terminal in your project folder and run:

    npm init -y
    npm install express node-fetch cors

## 3. Configure Your API Key
- Open `server.js` in a text editor.
- Replace `'YOUR_OPENAI_API_KEY'` with your actual OpenAI API key.

## 4. Start the Proxy Server
In your project folder, run:

    node server.js

You should see:
    TechEase AI Proxy server running on http://localhost:3001

## 5. Use in Your Frontend
Your frontend is already configured to send requests to `http://localhost:3001/api/ask`.

## 6. Security Note
- Never share your OpenAI API key publicly.
- For production, deploy this server securely and restrict access as needed.
