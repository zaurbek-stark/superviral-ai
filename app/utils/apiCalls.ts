import { Message } from '../types/message';

export const getVideoText = async (promptMessages: Message[]) => {
  const response = await fetch('/api/text', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ promptMessages })
  });
  const { text } = await response.json() as { text: string };
  return { text };
}

export const getThumbnail = async (prompt: string) => {
  try {
    const response = await fetch(`/api/image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
      })
    });
    const data = await response.json();
    return data.imageUrl;
  } catch (e) {
    console.log(e);
  }
}