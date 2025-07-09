// src/components/dashboard/AiAssistant.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: number;
  role: 'user' | 'ai';
  content: string;
}

const quickQuestions = [
  "Analisis penjualan minggu ini",
  "Produk mana yang stoknya paling rendah?",
  "Beri saya 3 rekomendasi untuk meningkatkan keuntungan",
];

export default function AiAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (prompt: string) => {
    if (!prompt.trim()) return;

    const userMessage: Message = { id: Date.now(), role: 'user', content: prompt };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Gagal mendapatkan respons dari AI.');
      }

      const data = await response.json();
      const aiMessage: Message = { id: Date.now() + 1, role: 'ai', content: data.response };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = { id: Date.now() + 1, role: 'ai', content: 'Maaf, terjadi kesalahan. Silakan coba lagi.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot />
          AI Assistant
        </CardTitle>
        <CardDescription>Tanyakan apa saja tentang bisnis Anda.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {messages.length === 0 && !isLoading && (
              <div className="text-center text-muted-foreground p-8">
                <p className="mb-4">Contoh pertanyaan:</p>
                <div className="flex flex-col items-center gap-2">
                  {quickQuestions.map((q, i) => (
                    <Button key={i} variant="outline" size="sm" onClick={() => handleSendMessage(q)}>
                      {q}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((message) => (
              <div key={message.id} className={cn("flex items-start gap-3", message.role === 'user' && 'justify-end')}>
                {message.role === 'ai' && <div className="p-2 rounded-full bg-primary text-primary-foreground"><Bot className="h-5 w-5" /></div>}
                <div className={cn("prose prose-sm max-w-full rounded-lg px-4 py-2", message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
                {message.role === 'user' && <div className="p-2 rounded-full bg-muted"><User className="h-5 w-5" /></div>}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary text-primary-foreground"><Bot className="h-5 w-5 animate-pulse" /></div>
                <div className="text-sm text-muted-foreground">AI sedang berpikir...</div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }}
          className="flex w-full items-center space-x-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ketik pertanyaan Anda..."
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
