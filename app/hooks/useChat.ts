import { useState } from 'react';
import { getThumbnail, getVideoText } from '../utils/apiCalls';
import { Message } from '../types/message';
import { Video } from '../types/video';
import { getVideoPrompt } from '../prompts/getVideoPrompt';

type ChatState =
  | { stage: 'collectingInputs'; index: number }
  | { stage: 'validateTitle' | 'validateThumbnail' | 'validateScript' | 'finished' };

const questionTopics: { [key in 'idea' | 'channel' | 'style']: string } = {
  idea: "What's your video idea?",
  channel: "What is your channel about?",
  style: "What style of video do you want to make?",
};

const questionOrder = ['idea', 'channel', 'style'] as const;

export const useChat = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatState, setChatState] = useState<ChatState>({ stage: 'collectingInputs', index: 0 });
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: questionTopics[questionOrder[0]] }]);
  const [videoData, setVideoData] = useState<Partial<Video>>({});
  const [thumbnailPrompt, setThumbnailPrompt] = useState<string>('');
  const [textResponse, setTextResponse] = useState<string>('');

  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    setMessages(currentMessages => [...currentMessages, { role, content }]);
  };

  const updateVideoData = (input: string, index: number) => {
    const key = questionOrder[index];
    setVideoData(currentData => ({ ...currentData, [key]: input }));
  };

  const processChatInput = async (input: string) => {
    addMessage('user', input);
    switch (chatState.stage) {
      case 'collectingInputs':
        await handleCollectingInputs(input);
        break;
      case 'validateTitle':
        await validateTitle(input);
        break;
      case 'validateThumbnail':
        await validateThumbnail(input);
        break;
      case 'validateScript':
        await validateScript(input);
        break;
    }
  };

  const handleCollectingInputs = async (input: string) => {
    const { index } = chatState.stage === 'collectingInputs' ? chatState : { index: 0 };
    updateVideoData(input, index);
    
    const nextIndex = index + 1;
    if (nextIndex < questionOrder.length) {
      await wait(1000); // Simulate typing delay
      addMessage('assistant', questionTopics[questionOrder[nextIndex]]);
      setChatState({ stage: 'collectingInputs', index: nextIndex });
    } else {
      // Move to the next stage after collecting all inputs
      setChatState({ stage: 'validateTitle' });
      await generateTitle();
    }
  };

  const generateTitle = async () => {
    const prompt = getVideoPrompt(videoData);
    await getVideoText({
      messages: [{ role: 'user', content: prompt }],
      setMessage: (msg) => setTextResponse(msg),
    });
    addMessage('assistant', 'Which title is your favorite?');
    setChatState({ stage: 'validateTitle' });
  };

  const validateTitle = async (input: string) => {
    // User selects their favorite title
    setVideoData(currentData => ({ ...currentData, title: input }));
    
    // Generate the thumbnail prompt
    const chatForThumbnail = [
      {
        role: "user",
        content: getVideoPrompt({ ...videoData }),
      },
      { role: 'assistant', content: `The titles are: ${textResponse}.\n\nWhich title is your favorite?` },
      { role: 'user', content: input },
    ];
    await getVideoText({
      messages: chatForThumbnail,
      setMessage: (msg) => {
        setThumbnailPrompt(msg);
        setTextResponse(msg);
      }
    });
    addMessage('assistant', 'Good choice! Anything special you want on the thumbnail?');
    setChatState({ stage: 'validateThumbnail' });
  };

  const validateThumbnail = async (input: string) => {
    if (input.toLowerCase().startsWith('yes')) {
      setChatState({ stage: 'validateScript' });
      await validateScript();
    } else {
      // Generate thumbnail based on the prompt and user input for modifications
      const imageUrl = await getThumbnail(`Original prompt: ${thumbnailPrompt}\n---\nMake the following changes: ${input}`);
      addMessage('assistant', `Is this thumbnail ok?`);
      const textWithImage = textResponse.replace(/<art-prompt>.*?<\/art-prompt>|<img src=".*?"\s*\/?>/gs, `<img src="${imageUrl}"/>`);
      setTextResponse(textWithImage);
    }
  };

  const validateScript = async (input?: string) => {
    if (input?.toLowerCase()?.startsWith('yes')) {
      setChatState({ stage: 'finished' });
      addMessage('assistant', 'Great, your video script is ready to go!');
    } else {
      const chatForScript = [
        {
          role: "user",
          content: getVideoPrompt({ ...videoData }),
        },
        ...messages,
        { role: 'user', content: input ?? 'Great! Can you now generate the script?' },
      ];
      await getVideoText({
        messages: chatForScript,
        setMessage: (msg) => {
          const thumbnailImgs = textResponse.match(/<img src=".*?"\s*\/?>/g);
          setTextResponse(`${thumbnailImgs?.[0]} ${msg}`);
        }
      });
      addMessage('assistant', 'Is this script ok?');
    }
  };

  const handleSubmit = async (input: string) => {
    setLoading(true);
    try {
      await processChatInput(input);
    } catch (error) {
      setError('An error occurred while processing your request.');
    } finally {
      setLoading(false);
    }
  };

  return { messages, handleSubmit, loading, error, textResponse };
};
