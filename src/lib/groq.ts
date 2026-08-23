export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL_NAME = 'openai/gpt-oss-120b';

const SYSTEM_PROMPT =
  'You are CycleWise AI Health Assistant. Provide concise, empathetic menstrual health guidance. Always include a disclaimer.';

/**
 * Sends a chat query to Groq AI service.
 */
export async function sendGroqChat(
  userPrompt: string,
  history: ChatMessage[] = []
): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;

  if (!apiKey) {
    // Offline / Mock fallback response when API key is not configured
    await new Promise((resolve) => setTimeout(resolve, 800));
    return (
      "I'm here to support your cycle and wellness journey! During this phase of your cycle, maintaining good hydration, gentle stretching, and balanced nutrition rich in iron and magnesium can help ease your symptoms.\n\n" +
      "⚠️ Disclaimer: I am an AI assistant and not a medical doctor. If you experience severe pain, unusual symptoms, or need medical advice, please consult a qualified healthcare provider."
    );
  }

  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.filter((m) => m.role !== 'system'),
    { role: 'user', content: userPrompt },
  ];

  const response = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      messages,
      temperature: 0.5,
      max_completion_tokens: 300,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const assistantReply = data?.choices?.[0]?.message?.content;

  if (!assistantReply) {
    throw new Error('No response returned from Groq AI service.');
  }

  return assistantReply;
}
