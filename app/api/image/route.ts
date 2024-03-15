import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export const runtime = 'edge';

export async function POST(req: Request, res: Response) {
  const body = await req.text();
  const { prompt } = JSON.parse(body);
  
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: `Create 16:9 aspect ratio illustration. The painting features a textured 
appearance with visible brush strokes, enhancing the dramatic and moody atmosphere. 
${prompt}`,
    n: 1,
    size: "1792x1024",
  });
  const image_url = response.data?.[0]?.url;
  console.log('response.data:', response.data);
  return NextResponse.json({ imageUrl: image_url });
}