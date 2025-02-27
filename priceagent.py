from tabulate import tabulate 

def build_pricing_table(json_data):
    """
    构造定价表格。如果传入的是字典，则从 "Items" 键获取数据，
    如果传入的是列表，则直接使用列表中的记录。
    增加 SavingsPlan 列显示 savingsPlan 信息。
    """
    table_data = []
    table_data.append(['Product', 'SKU', 'Retail Price', 'Unit of Measure', 'Region', 'Meter', 'RI Term', 'SavingsPlan'])
    
    # 如果 json_data 是字典，则从 "Items" 键获取数据，否则将其视为列表
    items = json_data.get("Items", []) if isinstance(json_data, dict) else json_data
    
    for item in items:
        meter = item.get('meterName', '')
        # 格式化 savingsPlan 字段内容
        savings_plan = item.get('savingsPlan', [])
        if isinstance(savings_plan, list) and savings_plan:
            savings_plan_str = '; '.join(
                [f"{plan.get('term', '')}: {plan.get('retailPrice', '')}" for plan in savings_plan]
            )
        else:
            savings_plan_str = ''
        
        table_data.append([
            item.get('productName', ''),
            item.get('armSkuName', ''),
            item.get('retailPrice', ''),
            item.get('unitOfMeasure', ''),
            item.get('location', ''),
            meter,
            item.get('reservationTerm', ''),
            savings_plan_str
        ])
    return table_data

def odata_query(query: str):
    """
    根据传入的 OData 查询条件从 Azure 零售价格 API 中获取数据，
    并返回合并后的 JSON 记录列表。假设返回的记录存储在 "Items" 字段中。

    参数:
        query (str): OData 查询条件

    返回:
        list: 查询结果记录列表
    """
    import requests

    api_url = "https://prices.azure.com/api/retail/prices?api-version=2023-01-01-preview"
    all_items = []

    response = requests.get(api_url, params={'$filter': query})
    response.raise_for_status()
    data = response.json()

    all_items.extend(data.get("Items", []))
    next_page = data.get("NextPageLink")

    while next_page:
        response = requests.get(next_page)
        response.raise_for_status()
        data = response.json()
        all_items.extend(data.get("Items", []))
        next_page = data.get("NextPageLink")

    return all_items

#function schema
functions = [
    {
        "name": "odata_query",
        "description": "根据传入的 OData 查询条件从 Azure 零售价格 API 中获取数据，并返回合并后的 JSON 记录列表，仅使用 `armRegionName` and `armSkuName`进行模糊查询",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": f"""OData 查询条件，使用模糊查询的方式，例如：
                    - armRegionName eq 'southcentralus' and contains(armSkuName, 'Redis')
                    - armRegionName eq 'southcentralus' and contains(armSkuName, 'NV') or contains(armSkuName, 'ND')"""
                }
            },
            "required": ["query"]
        }
    }
]

azure_regions = [
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
]

azure_vm_size = [
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
]

import os
import io
import json

from IPython.display import display, Markdown, HTML, Image, JSON
from utils import create_aoai_client
import warnings
warnings.filterwarnings('ignore')

client = create_aoai_client()

def handle_chat_request(prompt, client, functions):
    import json
    # 构造初始消息列表
    message = [
        {"role": "system", "content": "你是Azure价格查询助手，如果用户询问Azure产品价格相关问题，必须先调用odata_query，才能够回复。"},
        {"role": "user", "content": f"Azure region mapping: {azure_regions}"},
        {"role": "user", "content": f"Azure virtual machine size context: {azure_vm_size}"},
        {"role": "user", "content": prompt}
    ]
    
    # 第一次调用
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=message,
        functions=functions,
        function_call="auto"  # 自动调用
    )
    
    if response.choices[0].message.function_call:
        function_call = response.choices[0].message.function_call
        if function_call:  # 增加 function_call 不为空判断
            function_name = function_call.name
            print("调用的函数:", function_name)
            print("传入的参数:", function_call.arguments)
            
            if function_name == "odata_query":
                # 从 JSON 中获取键为 'str' 的中文字符串
                args = json.loads(function_call.arguments)
                function_response = odata_query(args["query"])
                    
                # 删除每个记录中的指定字段
                keys_to_remove = [
                    "currencyCode",
                    "unitPrice",
                    "isPrimaryMeterRegion",
                    "CustomerEntityId",
                    "CustomerEntityType",
                    "tierMinimumUnits",
                    "effectiveStartDate",
                    "meterId",
                    "productId",
                    "skuId",
                    "serviceName",
                    "serviceFamily",
                    "serviceId"
                ]
                for record in function_response:
                    for key in keys_to_remove:
                        record.pop(key, None)
                        
                print("函数返回:", function_response)
                
                # 删除包含指定内容的消息
                message = [
                    m for m in message 
                    if not (m.get("role") == "user" and 
                            (m.get("content", "").startswith("Azure region mapping:") or
                            m.get("content", "").startswith("Azure virtual machine size context:")))
                ]

                # 将返回值转换为字符串后追加到消息列表中
                message.append(
                    {
                        "role": "function",
                        "name": function_name,
                        "content": str(function_response)
                    }
                )
                
                response = client.chat.completions.create(
                    model="gpt-4o",
                    messages=message
                )
    
    final_message = response.choices[0].message.content
    
    # 同时返回 function_response 和最终回复的消息
    return function_response, final_message

prompt = "请问在南中部美国地区，Azure_Redis_Cache_General_Purpose_B5的价格是多少？"

func_resp, reply_message = handle_chat_request(prompt, client, functions)

display(Markdown(reply_message))
table_data = build_pricing_table(func_resp)
print(tabulate(table_data, headers='firstrow', tablefmt='psql'))