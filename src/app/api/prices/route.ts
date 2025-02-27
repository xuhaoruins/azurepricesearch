import { queryPricing } from '@/lib/price-api';
import { NextRequest } from 'next/server';

export const maxDuration = 60; // Set max duration to 60 seconds

export async function POST(request: NextRequest) {
    try {
        const { prompt } = await request.json();
        if (!prompt) {
            return Response.json({ error: 'Prompt is required' }, { status: 400 });
        }
        
        // 使用更新后的 queryPricing 函数获取 OData 查询条件、数据和 AI 响应
        const result = await queryPricing(prompt);
        console.log('Generated OData Filter:', result.filter);
        console.log('Items found:', result.items?.length || 0);
        
        return Response.json({
            Items: result.items || [],
            totalCount: result.items?.length || 0,
            filter: result.filter,
            aiResponse: result.aiResponse // 添加 AI 响应到返回结果
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