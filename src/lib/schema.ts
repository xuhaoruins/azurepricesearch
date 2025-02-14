export const pricingSchema = {
    type: "object",
    properties: {
        armRegionName: {
            type: "string",
            description: "The Azure region name where the service is available (e.g., eastus, westeurope)",
        },
        productName: {
            type: "string",
            description: "The name of the Azure service or product category (e.g., Virtual Machines, Storage)",
        },
        meterName: {
            type: "string",
            description: "The specific SKU, tier, or size of the product (e.g., Standard D2s v3, Basic)",
        },
    },
    required: ["armRegionName", "productName", "meterName"],
    additionalProperties: false
} as const;

export type PricingQueryResponse = {
    armRegionName: string;
    productName: string;
    meterName: string;
};