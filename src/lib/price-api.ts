import { OpenAI } from 'openai';
import { pricingSchema, type PricingQueryResponse } from './schema';
import { azureRegions } from './azure-regions';

const apidef = `
| Field          | Example Values              | Definition |
|----------------|----------------------------|------------|
| armRegionName  | eastus, westeurope        | Azure region name |
| productName    | Virtual Machines, Storage  | Product category |
| meterName      | Standard D2s v3, P10      | Specific SKU/tier |
`;

const examples = [
    {
        query: "Show me virtual machine prices in East US",
        response: {
            armRegionName: "eastus",
            productName: "Virtual Machines",
            meterName: "Standard D2s v3"
        }
    },
    {
        query: "What's the price of blob storage in West Europe?",
        response: {
            armRegionName: "westeurope",
            productName: "Storage",
            meterName: "Standard"
        }
    }
];

export async function queryPricing(prompt: string): Promise<string> {
    if (!process.env.GITHUB_TOKEN || !process.env.OPENAI_API_BASE_URL) {
        throw new Error('Missing environment variables');
    }

    const client = new OpenAI({
        baseURL: process.env.OPENAI_API_BASE_URL,
        apiKey: process.env.GITHUB_TOKEN, // 请确认该环境变量是否正确（通常是 OPENAI_API_KEY）
        defaultQuery: { 'api-version': '2023-07-01-preview' }
    });

    const messages = [
        {
            role: "system",
            content: `You are an Azure pricing assistant. Extract relevant Azure service information from user queries.
                Extract exactly these three fields:
                1. armRegionName: The Azure region name (e.g., eastus, westeurope)
                2. productName: The Azure service name (e.g., Virtual Machines, Storage)
                3. meterName: The specific SKU or tier (e.g., Standard D2s v3, P10)

                Return only a JSON object with these three fields - nothing else.

                Examples:
                "Show me VM prices in East US" =>
                {
                "armRegionName": "eastus",
                "productName": "Virtual Machines",
                "meterName": "Standard D2s v3"
                }

                "Storage costs in West Europe" =>
                {
                "armRegionName": "westeurope",
                "productName": "Storage",
                "meterName": "Standard"
                }`
        },
        { role: "user", content: prompt }
    ];

    try {
        const response = await client.chat.completions.create({
            messages,
            temperature: 0,
            max_tokens: 150,
            model: process.env.MODEL_NAME || 'gpt-4',
            response_format: { type: "json_object" }
        });

        const content = response?.choices?.[0]?.message?.content;
        if (!content) {
            throw new Error('No response from OpenAI');
        }

        // Validate the response
        const parsed = JSON.parse(content) as PricingQueryResponse;
        if (!parsed.armRegionName || !parsed.productName || !parsed.meterName) {
            throw new Error('Invalid response format from OpenAI');
        }

        return content;
    } catch (error) {
        console.error('OpenAI API Error:', error);
        throw new Error('Failed to process query');
    }
}

export async function fetchPrices(filter: string) {
    const api_url = "https://prices.azure.com/api/retail/prices?api-version=2023-01-01-preview";
    let allItems: any[] = [];
    let nextPageUrl = `${api_url}&$filter=${filter}`;

    while (nextPageUrl) {
        const response = await fetch(nextPageUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch prices');
        }
        const data = await response.json();
        if (data.Items && Array.isArray(data.Items)) {
            allItems = [...allItems, ...data.Items];
        }
        nextPageUrl = data.NextPageLink || '';
    }

    return { Items: allItems };
}

export function convertJsonToFilter(jsonStr: string) {
    try {
        const data = JSON.parse(jsonStr) as PricingQueryResponse;
        const filters = [];
        
        if (data.armRegionName) {
            filters.push(`armRegionName eq '${data.armRegionName.toLowerCase()}'`);
        }
        if (data.productName) {
            filters.push(`contains(productName, '${data.productName}')`);
        }
        if (data.meterName) {
            filters.push(`contains(meterName, '${data.meterName}')`);
        }

        return filters.join(" and ");
    } catch (error) {
        console.error('Error converting JSON to filter:', error);
        throw new Error('Invalid query format');
    }
}

export interface PricingItem {
    armSkuName: string;
    retailPrice: number;
    unitOfMeasure: string;
    armRegionName: string;
    meterName: string;
    productName: string;
    type: string;
}