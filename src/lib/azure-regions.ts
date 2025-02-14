export const azureRegions = [
  {
    "displayName": "East US",
    "name": "eastus"
  },
  {
    "displayName": "South Central US",
    "name": "southcentralus"
  },
  {
    "displayName": "West US 2",
    "name": "westus2"
  },
  {
    "displayName": "West US 3",
    "name": "westus3"
  },
  {
    "displayName": "Australia East",
    "name": "australiaeast"
  },
  {
    "displayName": "Southeast Asia",
    "name": "southeastasia"
  },
  {
    "displayName": "North Europe",
    "name": "northeurope"
  },
  {
    "displayName": "Sweden Central",
    "name": "swedencentral"
  },
  {
    "displayName": "UK South",
    "name": "uksouth"
  },
  {
    "displayName": "West Europe",
    "name": "westeurope"
  },
  {
    "displayName": "Central US",
    "name": "centralus"
  },
  {
    "displayName": "South Africa North",
    "name": "southafricanorth"
  },
  {
    "displayName": "Central India",
    "name": "centralindia"
  },
  {
    "displayName": "East Asia",
    "name": "eastasia"
  },
  {
    "displayName": "Japan East",
    "name": "japaneast"
  },
  {
    "displayName": "Korea Central",
    "name": "koreacentral"
  },
  {
    "displayName": "Canada Central",
    "name": "canadacentral"
  },
  {
    "displayName": "France Central",
    "name": "francecentral"
  },
  {
    "displayName": "Germany West Central",
    "name": "germanywestcentral"
  },
  {
    "displayName": "Norway East",
    "name": "norwayeast"
  },
  {
    "displayName": "Switzerland North",
    "name": "switzerlandnorth"
  },
  {
    "displayName": "UAE North",
    "name": "uaenorth"
  },
  {
    "displayName": "Brazil South",
    "name": "brazilsouth"
  },
  {
    "displayName": "East US 2",
    "name": "eastus2"
  },
  {
    "displayName": "UK West",
    "name": "ukwest"
  },
  {
    "displayName": "UAE Central",
    "name": "uaecentral"
  },
  {
    "displayName": "Brazil Southeast",
    "name": "brazilsoutheast"
  }
] as const;

export type AzureRegion = typeof azureRegions[number]["name"];

export function getRegionDisplayName(name: string): string {
  const region = azureRegions.find(r => r.name === name);
  return region ? region.displayName : name;
}