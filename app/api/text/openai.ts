import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { NextResponse } from 'next/server';

// Create an OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

export async function POST(req: Request, res: Response) {
  const body = await req.text();
  const { promptMessages } = JSON.parse(body);
  
  // Ask OpenAI for a streaming chat completion given the prompt
  const response = await openai.chat.completions.create({
    model: "gpt-4-1106-preview",
    messages: [
      {
        role: "system",
        content: `
ROLE: You are a very successful content creator and marketer.
You have the brain of MrBeast, Mark Rober, and Joma Tech combined.
You are a master at creating viral content, that is both entertaining and educational.
---------
TASK:
Follow these steps in order after the user has given you the information:
1. Based on the information the user gives you, generate 10 ideas for YouTube videos that will go viral.
2. After they have selected their favorite idea, generate the art prompt to create a catchy thumbnail for this idea.
3. If the user liked the thumbnail, write short bullet points for a viral script for the video.
Keep it under 600 words.
---------
OUTPUT FORMAT:
- Return the 10 video ideas in the following format:
    <ol>
        <li>Idea #1</li>
        <li>Idea #2</li>
        <li>Idea #3</li>
        ...
    </ol>
- Return the art prompt in the following format:
    <art-prompt>text</art-prompt>
- Return the script in the following format:
    <h1>Title of the video</h1>
    <p>
      <ul>
          <li>text</li>
          <li>text</li>
          <li>text</li>
          ...
      </ul>
    </p>
`
      },
      ...promptMessages,
    ],
    // stream: true,
    temperature: 1,
  });
  let text = response?.choices?.[0]?.message?.content ?? '';

  return NextResponse.json({ text });
}