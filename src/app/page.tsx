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
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-gray-800">Azure Retail Price Search</h1>
        <p className="text-gray-600 mb-8">
          Search for Azure service prices using natural language. Try queries like:
          <br />
          "Show me virtual machine F16s v2 prices in West Europe" or "App Service P3mv3 in east us".
          <br />
          <br />
          This app created by GitHub Copilot Agent mode, GitHub Models, Azure Static Web App and Next.js
          <br />
          API Data Source: https://prices.azure.com/api/retail/prices
          <br />
        </p>
        
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type your query here..."
              className="flex-1 p-4 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              disabled={loading}
            />
            <button 
              type="submit"
              disabled={loading || !query.trim()}
              className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {openaiResponse && (
          <div className="mb-6 p-4 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
            <h3 className="font-semibold mb-2">Query Interpretation:</h3>
            <pre className="whitespace-pre-wrap text-sm">{openaiResponse}</pre>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4" />
            <p className="text-gray-600">{loadingMessage || 'Loading...'}</p>
          </div>
        )}

        {results.length > 0 && (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Found {results.length} results
            </div>
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Region</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Meter</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {results.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{item.armSkuName}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">${item.retailPrice.toFixed(4)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.unitOfMeasure}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{getRegionDisplayName(item.armRegionName)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.meterName}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.productName}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
