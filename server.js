const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const app = express();
app.use(
  cors({
    origin: "https://assistant-six-puce.vercel.app/",
  }),
);
app.use(express.json());

const client = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.get("/", (req, res) => {
  res.send("Ai Server is running");
});

app.post("/api/ask", async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const systemInstruction = `
You are an expert programming tutor.
Explain programming concepts in simple Roman Urdu.
Always give easy examples.
If the user asks for code, explain the code step by step.
`;

    const contents = [
      ...(history || []).map((item) => ({
        role: item.role === "user" ? "user" : "model",
        parts: [
          {
            text: item.parts?.[0]?.text || "",
          },
        ],
      })),

      {
        role: "user",
        parts: [
          {
            text: message,
          },
        ],
      },
    ];

    const response = await client.models.generateContent({
      model: "gemini-3.6-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    res.json({
      success: true,
      reply: response.text || "No reply from AI",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});

module.exports = app;
