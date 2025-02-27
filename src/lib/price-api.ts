import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat';
import { azureVmSize } from './azurevmsize';
import { azureRegions } from './azure-regions';
import { agentPrompt } from './agentPrompt';

export async function queryPricing(prompt: string): Promise<{ filter: string, items: PricingItem[], aiResponse: string }> {
    if (!process.env.GITHUB_TOKEN || !process.env.OPENAI_API_BASE_URL) {
        throw new Error('Missing environment variables');
    }

    const client = new OpenAI({
        baseURL: process.env.OPENAI_API_BASE_URL,
        apiKey: process.env.GITHUB_TOKEN,
        defaultQuery: { 'api-version': '2023-07-01-preview' }
    });

    const functionMessages: ChatCompletionMessageParam[] = [
        {
            role: "system",
            content: `你是Azure价格查询助手，如果用户询问Azure产品价格相关问题，必须先调用odata_query，才能够回复。`
        },
        {
            role: "user",
            content: `Azure region mapping: ${JSON.stringify(azureRegions)}`
        },
        {
            role: "user",
            content: `Azure virtual machine size context: ${JSON.stringify(azureVmSize)}`
        },
        { role: "user", content: prompt }
    ];

    // 定义函数
    const functions = [
        {
            name: "odata_query",
            description: "根据传入的 OData 查询条件从 Azure 零售价格 API 中获取数据，并返回合并后的 JSON 记录列表，仅使用 armRegionName and armSkuName进行模糊查询.",
            parameters: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description: "OData 查询条件，使用模糊查询的方式，例如：armRegionName eq 'southcentralus' and contains(armSkuName, 'Redis')"
                    }
                },
                required: ["query"]
            }
        }
    ];

    try {
        const response = await client.chat.completions.create({
            messages: functionMessages,
            temperature: 1,
            model: process.env.MODEL_NAME || 'gpt-4o',
            functions: functions,
            function_call: "auto"
        });

        const functionCall = response.choices[0]?.message?.function_call;
        if (!functionCall || functionCall.name !== "odata_query") {
            throw new Error('Invalid function call response from AI');
        }

        const args = JSON.parse(functionCall.arguments || "{}");
        const queryFilter = args.query;

        if (!queryFilter) {
            throw new Error('Invalid query filter generated');
        }

        const priceData = await fetchPrices(queryFilter);
        
        if (!priceData.Items || !Array.isArray(priceData.Items)) {
            throw new Error('Invalid price data received');
        }

        const chatMessages: ChatCompletionMessageParam[] = [
            {
                role: "system",
                content: agentPrompt
            },
            {
                role: "user",
                content: `Price Context: ${JSON.stringify(priceData.Items)}`
            },
            { role: "user", content: prompt }
        ];

        try {
            const secondResponse = await client.chat.completions.create({
                messages: chatMessages,
                temperature: 0.5,
                model: process.env.MODEL_NAME || 'gpt-4o-mini'
            });

            const aiResponse = secondResponse.choices[0]?.message?.content || '';

            console.log('Returning price data:', {
                itemsCount: priceData.Items.length,
                filter: queryFilter,
                hasAiResponse: !!aiResponse
            });

            return {
                filter: queryFilter,
                items: priceData.Items,
                aiResponse: aiResponse
            };
        } catch (error) {
            console.error('Second OpenAI API Error:', error);
            return {
                filter: queryFilter,
                items: priceData.Items,
                aiResponse: `Error during processing: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    } catch (error) {
        console.error('OpenAI API Error:', error);
        throw new Error('Failed to process query');
    }
}

export async function fetchPrices(filter: string) {
    const api_url = "https://prices.azure.com/api/retail/prices?api-version=2023-01-01-preview";
    let allItems: PricingItem[] = [];
    let nextPageUrl = `${api_url}&$filter=${filter}`;

    while (nextPageUrl) {
        const response = await fetch(nextPageUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch prices');
        }
        const data = await response.json();
        if (data.Items && Array.isArray(data.Items)) {
            const processedItems = data.Items.map((item: Record<string, unknown>) => ({
                armSkuName: item.armSkuName,
                retailPrice: item.retailPrice,
                unitOfMeasure: item.unitOfMeasure,
                armRegionName: item.armRegionName,
                meterName: item.meterName,
                productName: item.productName,
                type: item.type,
                location: item.location,
                reservationTerm: item.reservationTerm,
                savingsPlan: item.savingsPlan
            }));
            allItems = [...allItems, ...processedItems];
        }
        nextPageUrl = data.NextPageLink || '';
    }

    return { Items: allItems };
}

// 原来的 convertJsonToFilter 函数不再需要，直接使用 LLM 生成的 OData 查询

export interface PricingItem {
    armSkuName: string;
    retailPrice: number;
    unitOfMeasure: string;
    armRegionName: string;
    meterName: string;
    productName: string;
    type: string;
    location?: string;
    reservationTerm?: string;
    savingsPlan?: Array<{ term: string, retailPrice: string }>;
}