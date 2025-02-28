'use client';

import { useState, useRef, useEffect } from 'react';
import { PricingItem } from '@/lib/price-api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  id?: string; // Add unique identifier for messages
};

type ResultsData = {
  items: PricingItem[];
  filter: string;
  aiResponse?: string;
};

export default function ChatInterface({ onResults }: { onResults: (data: ResultsData) => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typingAnimation, setTypingAnimation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add initial message
    setMessages([
      {
        role: 'assistant',
        content: 'Welcome to Azure Price Agent! You can ask everything about Azure prices.',
        id: 'welcome-message'
      }
    ]);
  }, []);

  useEffect(() => {
    // 修改滚动逻辑，仅在聊天容器内部滚动，而不是整个页面
    if (messagesEndRef.current && chatContainerRef.current) {
      const chatContainer = chatContainerRef.current.querySelector('.overflow-y-auto');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Generate a unique ID for the message
    const userMessageId = `user-${Date.now()}`;
    
    // Add user message with unique ID
    setMessages(prev => [...prev, { 
      role: 'user', 
      content: userMessage,
      id: userMessageId
    }]);
    
    // Force immediate update to display user message
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Add loading message
    const loadingMsgId = `assistant-${Date.now()}`;
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: 'Searching...',
      id: loadingMsgId
    }]);
    setLoading(true);
    setTypingAnimation(true);

    try {
      const response = await fetch('/api/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMessage }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Query failed');
      }

      const data = await response.json();
      
      // Use AI's detailed response instead of hardcoded response
      let responseContent = data.aiResponse || 'I found some relevant information.';
      
      if (data.Items && Array.isArray(data.Items) && data.Items.length > 0) {
        // If AI doesn't provide a response, use default message
        if (!data.aiResponse) {
          responseContent = `I found ${data.Items.length} matching price records.`;
        }
        
        // Pass result data to parent component
        onResults({ 
          items: data.Items,
          filter: data.filter,
          aiResponse: data.aiResponse
        });
      } else if (!data.aiResponse) {
        responseContent = 'Sorry, no matching price information found. Please try a more specific query or use different terms.';
      }
      
      // Show typing animation briefly before revealing full message
      setTimeout(() => {
        setTypingAnimation(false);
        // Update assistant message - find the loading message by ID and replace it
        setMessages(prev => prev.map(msg => 
          msg.id === loadingMsgId 
            ? { ...msg, content: responseContent } 
            : msg
        ));
      }, 500);
    } catch (error) {
      console.error('Error:', error);
      
      setTypingAnimation(false);
      // Update error message - find the loading message by ID and replace it
      setMessages(prev => prev.map(msg => 
        msg.id === loadingMsgId 
          ? { ...msg, content: `Query error: ${error instanceof Error ? error.message : 'Unknown error'}` }
          : msg
      ));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={chatContainerRef} className="flex flex-col bg-white rounded-xl shadow-lg overflow-hidden h-full">
      {/* Message display area */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <div 
            key={msg.id || index} 
            className={`mb-4 ${msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}`}
            data-role={msg.role}
          >
            <div 
              className={`relative max-w-[85%] animate-fadeIn ${
                msg.role === 'user' 
                  ? 'ml-auto' 
                  : 'mr-auto'
              }`}
              style={{
                animationDelay: `${index * 0.1}s`,
                animationFillMode: 'backwards'
              }}
            >
              <div 
                className={`p-3.5 rounded-2xl shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-800 border border-gray-200/50'
                }`}
              >
                {msg.role === 'user' ? (
                  // User messages displayed as plain text
                  <div className="whitespace-pre-wrap text-sm md:text-base">{msg.content}</div>
                ) : (
                  // Assistant messages rendered as Markdown
                  <div className={`markdown-content ${typingAnimation && msg.content === 'Searching...' ? 'animate-pulse' : ''}`}>
                    {typingAnimation && msg.content === 'Searching...' ? (
                      <div className="flex items-center space-x-1 h-6">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    ) : (
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        skipHtml={true}
                        components={{
                          pre: (props) => <pre className="bg-gray-800 text-white p-3 rounded-md overflow-auto my-2 text-sm" {...props} />,
                          code: (props) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono" {...props} />,
                          p: (props) => <p className="text-sm md:text-base mb-2 last:mb-0" {...props} />
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>
                )}
              </div>
              
              <div 
                className={`text-xs mt-1 px-1 ${
                  msg.role === 'user' ? 'text-right text-gray-600' : 'text-gray-500'
                }`}
              >
                {msg.role === 'user' ? 'You' : 'Azure Price Agent'}
              </div>
              
              {/* Message tail */}
              <div
                className={`absolute w-2 h-2 ${
                  msg.role === 'user'
                    ? 'right-0 -mr-1 bg-blue-500'
                    : 'left-0 -ml-1 bg-gray-100'
                } bottom-[16px] transform rotate-45`}
              ></div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form 
        onSubmit={handleSubmit} 
        className="border-t border-gray-200 p-3 md:p-4 bg-gradient-to-r from-gray-50 to-gray-100"
      >
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter your pricing query..."
              className="w-full p-3 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all shadow-sm text-sm md:text-base"
              disabled={loading}
              spellCheck={false}
              autoFocus
            />
            {input.trim() && !loading && (
              <button 
                type="button"
                onClick={() => setInput('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            )}
          </div>
          <button 
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 disabled:from-blue-300 disabled:to-indigo-400 disabled:cursor-not-allowed transition-all shadow-sm flex items-center"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            )}
          </button>
        </div>
        
        {/* Example queries - small suggestions */}
        <div className="mt-2 flex flex-wrap gap-2">
          <button 
            type="button" 
            onClick={() => setInput("What's the price of Standard D8s v4 in East US?")}
            disabled={loading}
            className="text-xs bg-white py-1 px-2 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            D8s v4 in East US
          </button>
          <button 
            type="button" 
            onClick={() => setInput("Compare prices of GPU VMs in West US 2")}
            disabled={loading}
            className="text-xs bg-white py-1 px-2 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            GPU VMs in West US 2
          </button>
        </div>
      </form>
    </div>
  );
}