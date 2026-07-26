export interface AiInsightResponse {
  text?: string;
  error?: string;
}

export const generateAiInsights = async (
  prompt: string,
  systemInstruction?: string
): Promise<string> => {
  try {
    const response = await fetch('/api/insights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        systemInstruction,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error ${response.status}`);
    }

    const data: AiInsightResponse = await response.json();
    if (!data.text) {
      throw new Error('Server returned an empty insight response.');
    }

    return data.text;
  } catch (err: any) {
    console.error('Gemini Service Client Error:', err);
    throw new Error(err.message || 'Failed to analyze spending with Gemini AI.');
  }
};
