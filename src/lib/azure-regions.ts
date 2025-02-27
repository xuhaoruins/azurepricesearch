// 区域名称映射，基于 priceagent.py 中的数据
export const azureRegions: Record<string, string> = {
  "australiacentral": "Australia Central",
  "australiacentral2": "Australia Central 2",
  "australiaeast": "Australia East",
  "australiasoutheast": "Australia Southeast",
  "brazilsouth": "Brazil South",
  "brazilsoutheast": "Brazil Southeast",
  "brazilus": "Brazil US",
  "canadacentral": "Canada Central",
  "canadaeast": "Canada East",
  "centralindia": "Central India",
  "centralus": "Central US",
  "centraluseuap": "Central US EUAP",
  "eastasia": "East Asia",
  "eastus": "East US",
  "eastus2": "East US 2",
  "eastus2euap": "East US 2 EUAP",
  "eastusstg": "East US STG",
  "francecentral": "France Central",
  "francesouth": "France South",
  "germanynorth": "Germany North",
  "germanywestcentral": "Germany West Central",
  "israelcentral": "Israel Central",
  "italynorth": "Italy North",
  "japaneast": "Japan East",
  "japanwest": "Japan West",
  "jioindiacentral": "Jio India Central",
  "jioindiawest": "Jio India West",
  "koreacentral": "Korea Central",
  "koreasouth": "Korea South",
  "mexicocentral": "Mexico Central",
  "newzealandnorth": "New Zealand North",
  "northcentralus": "North Central US",
  "northeurope": "North Europe",
  "norwayeast": "Norway East",
  "norwaywest": "Norway West",
  "polandcentral": "Poland Central",
  "qatarcentral": "Qatar Central",
  "southafricanorth": "South Africa North",
  "southafricawest": "South Africa West",
  "southcentralus": "South Central US",
  "southcentralusstg": "South Central US STG",
  "southindia": "South India",
  "southeastasia": "Southeast Asia",
  "spaincentral": "Spain Central",
  "swedencentral": "Sweden Central",
  "swedensouth": "Sweden South",
  "switzerlandnorth": "Switzerland North",
  "switzerlandwest": "Switzerland West",
  "uaecentral": "UAE Central",
  "uaenorth": "UAE North",
  "uksouth": "UK South",
  "ukwest": "UK West",
  "westcentralus": "West Central US",
  "westeurope": "West Europe",
  "westindia": "West India",
  "westus": "West US",
  "westus2": "West US 2",
  "westus3": "West US 3"
};

/**
 * 获取区域的显示名称
 * @param regionCode Azure 区域代码
 * @returns 区域的显示名称，如果找不到映射则返回原始代码
 */
export function getRegionDisplayName(regionCode: string): string {
  if (!regionCode) return "Unknown";
  
  // 先尝试直接匹配，因为有些代码可能是大小写不同
  const normalizedCode = regionCode.toLowerCase();
  
  // 使用映射表查找友好名称
  return azureRegions[normalizedCode] || regionCode;
}

/**
 * 根据显示名称获取区域代码
 * @param displayName 区域显示名称
 * @returns 区域代码，如果找不到映射则返回原始名称
 */
export function getRegionCode(displayName: string): string {
  if (!displayName) return "unknown";
  
  // 遍历映射表查找对应的区域代码
  for (const [code, name] of Object.entries(azureRegions)) {
    if (name.toLowerCase() === displayName.toLowerCase()) {
      return code;
    }
  }
  
  return displayName;
}