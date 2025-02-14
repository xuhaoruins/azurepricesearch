import { queryPricing, convertJsonToFilter, fetchPrices } from '@/lib/price-api';
import { NextRequest } from 'next/server';

export const maxDuration = 60; // Set max duration to 60 seconds

export async function POST(request: NextRequest) {
    try {
        const { prompt } = await request.json();
        if (!prompt) {
            return Response.json({ error: 'Prompt is required' }, { status: 400 });
        }
        
        // Get query from OpenAI
        const queryResult = await queryPricing(prompt);
        console.log('OpenAI Response:', queryResult);
        
        // Convert to filter
        const filter = convertJsonToFilter(queryResult);
        console.log('Generated Filter:', filter);
        
        // Fetch prices from Azure with pagination
        const data = await fetchPrices(filter);
        console.log('Items found:', data.Items?.length || 0);
        
        if (!data.Items || !Array.isArray(data.Items)) {
            return Response.json({ Items: [] });
        }
        
        return Response.json({
            Items: data.Items,
            totalCount: data.Items.length,
            filter: filter,
            query: queryResult
        });
    } catch (error) {
        console.error('Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return Response.json(
            { 
                error: 'Failed to process request', 
                details: errorMessage,
                timestamp: new Date().toISOString()
            }, 
            { status: 500 }
        );
    }
}