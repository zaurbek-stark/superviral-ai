import { Message } from '../types/message';

type Props = {
  messages: Message[];
  setMessage: (msg: string) => void;
};

export const getVideoText = async ({ messages, setMessage }: Props) => {
  const response = await fetch('/api/text', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ messages })
  });

  if (!response.body) {
    throw new Error('No response body');
  }

  const reader = response.body.getReader();
  let chunks = [];

  const decoder = new TextDecoder('utf-8');
  let text = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    chunks.push(value);
    text = chunks.map(chunk => decoder.decode(chunk)).join('');
    setMessage(text);
  }
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