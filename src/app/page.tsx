'use client';

import { useState } from 'react';
import { PricingItem } from '@/lib/price-api';
import { getRegionDisplayName } from '@/lib/azure-regions';

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PricingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [openaiResponse, setOpenaiResponse] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setLoadingMessage('Processing your query...');
    setResults([]);
    setOpenaiResponse(null);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const response = await fetch('/api/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to fetch results');
      }

      const data = await response.json();
      
      if (!data.Items || !Array.isArray(data.Items)) {
        throw new Error('Invalid response format');
      }
      
      setResults(data.Items);
      if (data.query) {
        setOpenaiResponse(data.query);
      }
      
      if (data.Items.length === 0) {
        setError('No matching prices found. Try being more specific or using different terms.');
      } else {
        setError(null);
      }
    } catch (error) {
      console.error('Error:', error);
      setResults([]);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          setError('Request timed out. Please try a more specific search.');
        } else if (error.message.includes('Invalid response format')) {
          setError('Could not understand the query. Please try rephrasing it.');
        } else {
          setError(error.message);
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Azure Retail Price Search
          </h1>
          <p className="text-gray-600 mb-8 space-y-2">
            <span className="block">
              Search for Azure service prices using natural language. Try queries like:
            </span>
            <span className="block pl-4 text-blue-600 font-medium">
              &quot;Show me virtual machine F16s v2 prices in West Europe&quot; or &quot;App Service P3mv3 in east us&quot;
            </span>
            <span className="block mt-4 text-sm text-gray-500">
              This app created by GitHub Copilot Agent mode, GitHub Models, Azure Static Web App and Next.js
            </span>
            <span className="block text-sm text-gray-500">
              API Data Source: <a href="https://prices.azure.com/api/retail/prices" className="text-blue-600 hover:underline">https://prices.azure.com/api/retail/prices</a>
              <br />
              Code Repo: <a href="https://github.com/xuhaoruins/azurepricesearch" className="text-blue-600 hover:underline">https://github.com/xuhaoruins/azurepricesearch</a>
            </span>
          </p>
          
          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex gap-4">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type your query here..."
                className="flex-1 p-4 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black bg-gray-50 hover:bg-white transition-colors"
                disabled={loading}
              />
              <button 
                type="submit"
                disabled={loading || !query.trim()}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-blue-300 disabled:to-blue-400 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-md"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Searching...
                  </span>
                ) : 'Search'}
              </button>
            </div>
          </form>
        </div>

        {error && (
          <div className="mb-6 p-6 bg-red-50 text-red-700 rounded-xl border border-red-200 shadow-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {openaiResponse && (
          <div className="mb-6 p-6 bg-blue-50 text-blue-700 rounded-xl border border-blue-200 shadow-sm">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Query Interpretation:
            </h3>
            <pre className="whitespace-pre-wrap text-sm bg-blue-100/50 p-3 rounded-lg">{openaiResponse}</pre>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600 animate-pulse">{loadingMessage || 'Loading...'}</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <span className="text-sm text-gray-600">
                Found {results.length} results
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meter</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {results.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{item.armSkuName}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">${item.retailPrice.toFixed(4)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.unitOfMeasure}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{getRegionDisplayName(item.armRegionName)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{item.meterName}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{item.productName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
