'use client';

import { useState } from 'react';
import { PricingItem } from '@/lib/price-api';
import ChatInterface from '@/components/ChatInterface';
import PriceResults from '@/components/PriceResults';

export default function Home() {
  const [results, setResults] = useState<PricingItem[]>([]);

  const handleResults = ({items, filter}: {items: PricingItem[], filter: string}) => {
    setResults(items);
    // Only log to console, don't display in frontend
    console.log('OData Query Filter:', filter);
    window.scrollTo({top: document.getElementById('results')?.offsetTop || 0, behavior: 'smooth'});
  };

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Azure Price Agent
          </h1>
          
          <p className="text-gray-600 mb-8">
            <span className="block mb-2">
              Search Azure service prices using natural language. You can ask about specific services, regions, and specifications.
            </span>
            <span className="block text-sm text-gray-500">
              Data Source: <a href="https://prices.azure.com/api/retail/prices" className="text-blue-600 hover:underline">Azure Retail Prices API</a>
            </span>
            <span className="block text-sm text-gray-500">
              GitHub: <a href="https://github.com/xuhaoruins/azurepricesearch" className="text-blue-600 hover:underline">Azure Price Agent repo</a>
            </span>
          </p>
          
          <div className="h-96 mb-6 border border-gray-200 rounded-xl overflow-hidden">
            <ChatInterface onResults={handleResults} />
          </div>
        </div>
        
        <div id="results">
          {results.length > 0 && <PriceResults items={results} />}
        </div>
      </div>
    </main>
  );
}
