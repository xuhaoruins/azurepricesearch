import OpenAI from 'openai';

// 定义 Azure VM 大小类型，与 priceagent.py 对齐
export const azureVmSize = [
    {
        "VM_Type": "General Purpose",
        "Series_Family": "A-family",
        "Purpose": "Entry-level economical workloads",
        "Description": "Balanced CPU-to-memory ratio, suitable for testing, development, small to medium databases, low to medium traffic web servers",
        "armSkuName_Example": "Standard_A1_v2",
        "Keywords": "economical, entry-level, balanced"
      },
      {
        "VM_Type": "General Purpose",
        "Series_Family": "B-family",
        "Purpose": "Burstable workloads",
        "Description": "CPU credit model for variable workloads, ideal for web servers, proof of concepts, small databases, development environments",
        "armSkuName_Example": "Standard_B1s",
        "Keywords": "burstable, credits, variable performance"
      },
      {
        "VM_Type": "General Purpose",
        "Series_Family": "D-family",
        "Purpose": "Enterprise-grade applications, relational databases, in-memory caching, data analytics",
        "Description": "High CPU-to-memory ratio, faster processors, more memory per core",
        "armSkuName_Example": "Standard_D2_v5",
        "Keywords": "enterprise, relational databases, in-memory caching"
      },
      {
        "VM_Type": "General Purpose",
        "Series_Family": "DC-family",
        "Purpose": "Confidential computing with data protection and integrity",
        "Description": "Enhanced security features, hardware-based Trusted Execution Environments (TEEs)",
        "armSkuName_Example": "Standard_DC2s_v3",
        "Keywords": "confidential, security, TEE"
      },
      {
        "VM_Type": "Compute Optimized",
        "Series_Family": "F-family",
        "Purpose": "Medium traffic web servers, network appliances, batch processes, application servers",
        "Description": "High CPU-to-memory ratio, powerful processors for compute-intensive tasks",
        "armSkuName_Example": "Standard_F2s_v2",
        "Keywords": "compute-intensive, high CPU, batch processing"
      },
      {
        "VM_Type": "Compute Optimized",
        "Series_Family": "FX-family",
        "Purpose": "Electronic Design Automation (EDA), large memory relational databases, medium to large caches, in-memory analytics",
        "Description": "High frequency CPUs, large cache per core, exceptional computational power",
        "armSkuName_Example": "Standard_FX4mds",
        "Keywords": "EDA, large memory, high frequency"
      },
      {
        "VM_Type": "Memory Optimized",
        "Series_Family": "E-family",
        "Purpose": "Relational databases, medium to large caches, in-memory analytics",
        "Description": "High memory-to-core ratio, supports memory-intensive workloads",
        "armSkuName_Example": "Standard_E2_v5",
        "Keywords": "memory-intensive, high memory, caches"
      },
      {
        "VM_Type": "Memory Optimized",
        "Series_Family": "Eb-family",
        "Purpose": "High remote storage performance for memory-intensive workloads",
        "Description": "Similar to E-family but with enhanced storage capabilities",
        "armSkuName_Example": "Standard_Eb4s_v5",
        "Keywords": "remote storage, high performance, memory-intensive"
      },
      {
        "VM_Type": "Memory Optimized",
        "Series_Family": "EC-family",
        "Purpose": "Confidential computing for memory-intensive workloads",
        "Description": "Security features combined with high memory capacities",
        "armSkuName_Example": "Standard_EC2s_v5",
        "Keywords": "confidential, memory-intensive, security"
      },
      {
        "VM_Type": "Memory Optimized",
        "Series_Family": "M-family",
        "Purpose": "Extremely large databases, large amounts of memory",
        "Description": "Ultra-high memory capacities, high vCPU capabilities",
        "armSkuName_Example": "Standard_M128ms",
        "Keywords": "ultra-high memory, large databases, high vCPU"
      },
      {
        "VM_Type": "Storage Optimized",
        "Series_Family": "L-family",
        "Purpose": "High disk throughput and I/O, big data, SQL and NoSQL databases, data warehousing, large transactional databases",
        "Description": "High disk throughput, large local disk storage capacities",
        "armSkuName_Example": "Standard_L8s_v3",
        "Keywords": "storage-intensive, high throughput, big data"
      },
      {
        "VM_Type": "GPU Accelerated",
        "Series_Family": "NC-family",
        "Purpose": "Compute-intensive, graphics-intensive, visualization",
        "Description": "Equipped with NVIDIA GPUs for acceleration",
        "armSkuName_Example": "Standard_NC6",
        "Keywords": "GPU, NVIDIA, visualization"
      },
      {
        "VM_Type": "GPU Accelerated",
        "Series_Family": "ND-family",
        "Purpose": "Large memory compute-intensive, large memory graphics-intensive, large memory visualization",
        "Description": "Specialized for deep learning and AI with powerful GPUs",
        "armSkuName_Example": "Standard_ND40rs_v2",
        "Keywords": "deep learning, AI, large memory"
      },
      {
        "VM_Type": "GPU Accelerated",
        "Series_Family": "NG-family",
        "Purpose": "Virtual Desktop (VDI), cloud gaming",
        "Description": "Optimized for graphics and streaming with AMD Radeon™ PRO GPUs",
        "armSkuName_Example": "Standard_NG32ads_V620_v1",
        "Keywords": "gaming, VDI, AMD Radeon"
      },
      {
        "VM_Type": "GPU Accelerated",
        "Series_Family": "NV-family",
        "Purpose": "Virtual desktop (VDI), single-precision compute, video encoding and rendering",
        "Description": "Designed for graphics-intensive applications with NVIDIA or AMD GPUs",
        "armSkuName_Example": "Standard_NV6",
        "Keywords": "graphics, rendering, NVIDIA"
      },
      {
        "VM_Type": "FPGA Accelerated",
        "Series_Family": "NP-family",
        "Purpose": "Machine learning inference, video transcoding, database search and analytics",
        "Description": "Equipped with FPGAs for custom hardware acceleration",
        "armSkuName_Example": "Standard_NP10s",
        "Keywords": "FPGA, inference, transcoding"
      },
      {
        "VM_Type": "High Performance Compute",
        "Series_Family": "HB-family",
        "Purpose": "High memory bandwidth, fluid dynamics, weather modeling",
        "Description": "High-performance CPUs and fast memory for compute-intensive workloads",
        "armSkuName_Example": "Standard_HB120rs_v2",
        "Keywords": "HPC, high bandwidth, weather modeling"
      },
      {
        "VM_Type": "High Performance Compute",
        "Series_Family": "HC-family",
        "Purpose": "High density compute, finite element analysis, molecular dynamics, computational chemistry",
        "Description": "Exceptional computational capabilities for intensive processing",
        "armSkuName_Example": "Standard_HC44rs",
        "Keywords": "finite element analysis, molecular dynamics, computational chemistry"
      },
      {
        "VM_Type": "High Performance Compute",
        "Series_Family": "HX-family",
        "Purpose": "Large memory capacity, Electronic Design Automation (EDA)",
        "Description": "High memory and CPU performance for memory-intensive HPC tasks",
        "armSkuName_Example": "Standard_HX176rs",
        "Keywords": "large memory, EDA, high performance"
      }
];

export const azureRegions = [
    {
    "Australia Central": "australiacentral",
    "Australia Central 2": "australiacentral2",
    "Australia East": "australiaeast",
    "Australia Southeast": "australiasoutheast",
    "Brazil South": "brazilsouth",
    "Brazil Southeast": "brazilsoutheast",
    "Brazil US": "brazilus",
    "Canada Central": "canadacentral",
    "Canada East": "canadaeast",
    "Central India": "centralindia",
    "Central US": "centralus",
    "Central US EUAP": "centraluseuap",
    "East Asia": "eastasia",
    "East US": "eastus",
    "East US 2": "eastus2",
    "East US 2 EUAP": "eastus2euap",
    "East US STG": "eastusstg",
    "France Central": "francecentral",
    "France South": "francesouth",
    "Germany North": "germanynorth",
    "Germany West Central": "germanywestcentral",
    "Israel Central": "israelcentral",
    "Italy North": "italynorth",
    "Japan East": "japaneast",
    "Japan West": "japanwest",
    "Jio India Central": "jioindiacentral",
    "Jio India West": "jioindiawest",
    "Korea Central": "koreacentral",
    "Korea South": "koreasouth",
    "Mexico Central": "mexicocentral",
    "New Zealand North": "newzealandnorth",
    "North Central US": "northcentralus",
    "North Europe": "northeurope",
    "Norway East": "norwayeast",
    "Norway West": "norwaywest",
    "Poland Central": "polandcentral",
    "Qatar Central": "qatarcentral",
    "South Africa North": "southafricanorth",
    "South Africa West": "southafricawest",
    "South Central US": "southcentralus",
    "South Central US STG": "southcentralusstg",
    "South India": "southindia",
    "Southeast Asia": "southeastasia",
    "Spain Central": "spaincentral",
    "Sweden Central": "swedencentral",
    "Sweden South": "swedensouth",
    "Switzerland North": "switzerlandnorth",
    "Switzerland West": "switzerlandwest",
    "UAE Central": "uaecentral",
    "UAE North": "uaenorth",
    "UK South": "uksouth",
    "UK West": "ukwest",
    "West Central US": "westcentralus",
    "West Europe": "westeurope",
    "West India": "westindia",
    "West US": "westus",
    "West US 2": "westus2",
    "West US 3": "westus3"
  }
];

export async function queryPricing(prompt: string): Promise<{filter: string, items: any[], aiResponse: string}> {
    if (!process.env.GITHUB_TOKEN || !process.env.OPENAI_API_BASE_URL) {
        throw new Error('Missing environment variables');
    }

    const client = new OpenAI({
        baseURL: process.env.OPENAI_API_BASE_URL,
        apiKey: process.env.GITHUB_TOKEN,
        defaultQuery: { 'api-version': '2023-07-01-preview' }
    });

    // 构建与 priceagent.py 类似的系统消息
    const messages = [
        {
            role: "system" as const,
            content: `你是Azure价格查询助手，如果用户询问Azure产品价格相关问题，必须先调用odata_query，才能够回复。`
        },
        { 
            role: "user" as const, 
            content: `Azure region mapping: ${JSON.stringify(azureRegions)}` 
        },
        { 
            role: "user" as const, 
            content: `Azure virtual machine size context: ${JSON.stringify(azureVmSize)}` 
        },
        { role: "user" as const, content: prompt }
    ];

    // 定义函数
    const functions = [
        {
            name: "odata_query",
            description: "根据传入的 OData 查询条件从 Azure 零售价格 API 中获取数据，并返回合并后的 JSON 记录列表，仅使用 `armRegionName` and `armSkuName`进行模糊查询",
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
        // 第一次调用，获取函数参数
        const response = await client.chat.completions.create({
            messages,
            temperature: 0,
            model: process.env.MODEL_NAME || 'gpt-4',
            functions: functions,
            function_call: "auto"
        });

        // 处理函数调用
        const functionCall = response.choices[0]?.message?.function_call;
        if (!functionCall || functionCall.name !== "odata_query") {
            throw new Error('Invalid function call response from AI');
        }

        console.log("Function call:", functionCall.name);
        console.log("Function arguments:", functionCall.arguments);

        // 解析查询参数
        const args = JSON.parse(functionCall.arguments || "{}");
        const queryFilter = args.query;

        if (!queryFilter) {
            throw new Error('Invalid query filter generated');
        }

        // 获取价格数据
        const priceData = await fetchPrices(queryFilter);
        
        // 准备第二次调用 - 与 priceagent.py 中的做法类似
        // 删除特定消息
        const filteredMessages = messages.filter(m => 
            !(m.role === "user" && (
                m.content.startsWith("Azure region mapping:") || 
                m.content.startsWith("Azure virtual machine size context:")
            ))
        );
        
        // 添加函数返回消息
        filteredMessages.push({
            role: "function" as const,
            name: "odata_query",
            content: JSON.stringify(priceData.Items)
        });
        
        try {
            // 执行第二次调用
            const secondResponse = await client.chat.completions.create({
                messages: filteredMessages,
                temperature: 0.7,
                model: process.env.MODEL_NAME || 'gpt-4'
            });
            
            const aiResponse = secondResponse.choices[0]?.message?.content || '';
            
            // 返回查询参数、数据和AI回复
            return {
                filter: queryFilter,
                items: priceData.Items,
                aiResponse: aiResponse
            };
        } catch (error) {
            console.error('Second OpenAI API Error:', error);
            
            // 检查是否是 token 限制错误 - 任何第二次调用的错误都视为结果过多
            return {
                filter: queryFilter,
                items: priceData.Items,
                aiResponse: "您查询的条件过于宽泛，请查询更加具体的产品。"
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
            const processedItems = data.Items.map((item: any) => {
                delete item.currencyCode;
                delete item.unitPrice;
                delete item.isPrimaryMeterRegion;
                delete item.CustomerEntityId;
                delete item.CustomerEntityType;
                delete item.tierMinimumUnits;
                delete item.effectiveStartDate;
                delete item.meterId;
                delete item.productId;
                delete item.skuId;
                delete item.serviceName;
                delete item.serviceFamily;
                delete item.serviceId;
                return item;
            });
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
    savingsPlan?: Array<{term: string, retailPrice: string}>;
}