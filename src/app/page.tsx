'use client';

import { useState } from 'react';
import { PricingItem } from '@/lib/price-api';
import ChatInterface from '@/components/ChatInterface';
import PriceResults from '@/components/PriceResults';
import Image from 'next/image';

export default function Home() {
  const [results, setResults] = useState<PricingItem[]>([]);

  const handleResults = ({items, filter}: {items: PricingItem[], filter: string}) => {
    setResults(items);
    // Only log to console, don't display in frontend
    console.log('OData Query Filter:', filter);
    // 移除自动滚动到结果位置的代码
    // window.scrollTo({top: document.getElementById('results')?.offsetTop || 0, behavior: 'smooth'});
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4 md:py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header section with improved visual design */}
        <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden mb-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 z-0"></div>
          
          <div className="relative z-10 p-6 md:p-8 lg:p-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-700">
                  Azure Price Agent
                </h1>
                <p className="text-gray-600 text-lg">
                  Search Azure pricing with natural language
                </p>
              </div>
              
              <div className="mt-4 md:mt-0 flex items-center space-x-1">
                <div className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 p-1">
                  <div className="bg-white rounded-full p-1">
                    <Image src="/globe.svg" alt="Azure Cloud" width={24} height={24} className="w-6 h-6" />
                  </div>
                </div>
                <div className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 p-1 ml-2">
                  <div className="bg-white rounded-full p-1">
                    <Image src="/window.svg" alt="Azure Window" width={24} height={24} className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Introduction & Resources */}
            <div className="mb-6 pb-6 border-b border-gray-100">
              <div className="flex flex-wrap items-center text-sm gap-y-2 gap-x-6">
                <a href="https://prices.azure.com/api/retail/prices?api-version=2023-01-01-preview" 
                   className="flex items-center hover:text-blue-600 transition-colors" 
                   target="_blank" 
                   rel="noopener noreferrer">
                  <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                  </svg>
                  Data Source: Azure Retail Prices API
                </a>
                
                <a href="https://github.com/xuhaoruins/azurepricesearch" 
                   className="flex items-center hover:text-blue-600 transition-colors"
                   target="_blank" 
                   rel="noopener noreferrer">
                  <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                  </svg>
                  GitHub Repository
                </a>
              </div>
            </div>
            
            <div className="h-[550px] md:h-[600px] rounded-xl overflow-hidden border border-gray-200 shadow-lg">
              <ChatInterface onResults={handleResults} />
            </div>
          </div>
        </div>
        
        {/* Results section with smooth transition */}
        <div id="results" className={`transition-opacity duration-300 ${results.length > 0 ? 'opacity-100' : 'opacity-0'}`}>
          {results.length > 0 && <PriceResults items={results} />}
        </div>
      </div>
    </main>
  );
}
