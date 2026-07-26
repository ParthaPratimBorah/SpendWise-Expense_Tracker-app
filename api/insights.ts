import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, systemInstruction } = (req.body as { prompt?: string; systemInstruction?: string }) || {};
    const apiKey = process.env.GEMINI_API_KEY;

    if (!prompt) {
      return res.status(400).json({ error: 'A prompt is required.' });
    }

    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return res.status(200).json({ text: response.text });
  } catch (err: any) {
    console.error('Vercel Gemini API error:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate AI insights.' });
  }
}
