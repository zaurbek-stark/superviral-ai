'use client';

import Chat from './components/Chat';
import Header from './components/Header';

export default function Home() {
  return (
    <main className="App">
      <div className="w-full flex flex-col items-center justify-center">
        <Header />
        <Chat />
      </div>
    </main>
  )
}