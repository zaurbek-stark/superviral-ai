import Image from 'next/image';
import { useRef, useState, ChangeEvent, FormEvent } from 'react';
import { useScroll } from '../hooks/useScroll';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { useChat } from '../hooks/useChat';
import LoadingDots from './LoadingDots';
import { Message } from '../types/message';

type ChatMessageProps = {
  message: Message;
  index: number;
  showLine: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, index, showLine }) => (
  <div key={index} className="chat-line">
    <Image
      className={`avatar ${message.role === 'user' ? 'user-avatar' : 'ai-avatar'}`}
      src={message.role === 'user' ? '/user-avatar.jpg' : '/ai-avatar.jpg'}
      width={32}
      height={32}
      alt="Avatar"
    />
    <div style={{ width: '100%', marginLeft: '16px' }}>
      <div className="message" dangerouslySetInnerHTML={{ __html: message.content }} />
      {showLine && <div className="horizontal-line" />}
    </div>
  </div>
);

type ChatFormProps ={
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  inputValue: string;
  isLoading: boolean;
}

const ChatForm: React.FC<ChatFormProps> = ({ onSubmit, onInputChange, inputValue, isLoading }) => (
  <form onSubmit={onSubmit} className="mainForm">
    <input
      name="input-field"
      placeholder="Say anything"
      onChange={onInputChange}
      value={inputValue}
      type="text"
      className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
    />
    <button
      type="submit"
      disabled={isLoading || !inputValue}
      className="text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center justify-center space-x-2 w-[80px]"
    />
  </form>
);

const Chat: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const chatContainer = useRef<HTMLDivElement>(null);
  const { textResponse, messages, handleSubmit, loading, error } = useChat();
  
  useScroll({ ref: chatContainer, trigger: messages });

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input) return;
    handleSubmit(input);
    setInput('');
  };

  return (
    <div className="split-screen px-4">
      <div className="chat-wrapper">
        <div ref={chatContainer} className="chat">
          {messages?.length > 0
            ? messages.map((message, index) => (
                <ChatMessage
                  message={message}
                  index={index}
                  key={index}
                  showLine={index < messages.length - 1}
                />
              ))
            : error}
        </div>
        <LoadingDots isLoading={loading} />
        <ChatForm
          onSubmit={onSubmit}
          onInputChange={(e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
          inputValue={input}
          isLoading={loading}
        />
      </div>
      <div className="vertical-line"></div>
      <div className="preview">
        <div className="container mb-14">
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>{textResponse}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default Chat;
