import { Video } from '../types/video';

export const getVideoPrompt  = (props: Partial<Video>) => {
  const { idea, channel, style } = props;
  const prompt = `
VIDEO IDEA: ${idea}
---------
YOUTUBE CHANNEL DESCRIPTION: ${channel}
---------
VIDEO STYLE: ${style}`;
 return prompt;
}