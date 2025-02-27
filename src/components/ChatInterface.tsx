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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Add initial message
    setMessages([
      {
        role: 'assistant',
        content: 'Welcome to Azure Price Agent! You can ask about Azure product prices using natural language. For example: "What is the price of Redis Cache General Purpose B5 in South Central US?"',
        id: 'welcome-message'
      }
    ]);
  }, []);

  useEffect(() => {
    // Scroll to the latest message
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      
      // Update assistant message - find the loading message by ID and replace it
      setMessages(prev => prev.map(msg => 
        msg.id === loadingMsgId 
          ? { ...msg, content: responseContent } 
          : msg
      ));
    } catch (error) {
      console.error('Error:', error);
      
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

  // Debug output
  console.log('Current messages:', messages);

  return (
    <div className="flex flex-col bg-white rounded-xl shadow-lg overflow-hidden h-full">
      {/* Message display area */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <div 
            key={msg.id || index} 
            className={`mb-4 ${msg.role === 'user' ? 'ml-auto max-w-[85%]' : 'mr-auto max-w-[90%]'}`}
            data-role={msg.role} // Add data attribute for debugging
          >
            <div 
              className={`p-3 rounded-lg ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {msg.role === 'user' ? (
                // User messages displayed as plain text
                <div className="whitespace-pre-wrap">{msg.content}</div>
              ) : (
                // Assistant messages rendered as Markdown
                <div className="markdown-content">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    skipHtml={true}
                    components={{
                      pre: ({node, ...props}) => <pre {...props} />,
                      code: ({node, ...props}) => <code {...props} />,
                      p: ({node, ...props}) => <p {...props} />
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
            <div 
              className={`text-xs mt-1 ${
                msg.role === 'user' ? 'text-right text-gray-600' : 'text-gray-500'
              }`}
            >
              {msg.role === 'user' ? 'You' : 'Azure Price Agent'}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form 
        onSubmit={handleSubmit} 
        className="border-t border-gray-200 p-4 bg-gray-50"
      >
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your pricing query..."
            className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
            spellCheck={false}
            autoFocus
          />
          <button 
            type="submit"
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-blue-300 disabled:to-blue-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </span>
            ) : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}