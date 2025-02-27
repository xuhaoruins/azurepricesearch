'use client';

import { PricingItem } from '@/lib/price-api';
import { getRegionDisplayName } from '@/lib/azure-regions';

export default function PriceResults({ items }: { items: PricingItem[] }) {
  if (!items.length) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden my-6">
      <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
        <h2 className="text-lg font-semibold text-gray-800">
          Price Results <span className="text-sm font-normal text-gray-500">({items.length} records)</span>
        </h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Price</th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Unit</th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24 max-w-[180px]">Meter</th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">RI Term</th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Savings Plan</th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32 max-w-xs">Product</th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Region</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-2 py-2 text-xs font-medium text-blue-600 truncate" title={item.armSkuName}>
                  {item.armSkuName}
                </td>
                <td className="px-2 py-2 text-xs font-medium text-gray-900">
                  ${typeof item.retailPrice === 'number' ? item.retailPrice.toFixed(4) : item.retailPrice}
                </td>
                <td className="px-2 py-2 text-xs text-gray-500 truncate" title={item.unitOfMeasure}>
                  {item.unitOfMeasure}
                </td>
                <td className="px-2 py-2 text-xs text-gray-900 truncate max-w-[180px]" title={item.meterName}>
                  {item.meterName}
                </td>
                <td className="px-2 py-2 text-xs text-gray-900 truncate" title={item.reservationTerm || '-'}>
                  {item.reservationTerm || '-'}
                </td>
                <td className="px-2 py-2 text-xs text-gray-900">
                  {item.savingsPlan && Array.isArray(item.savingsPlan) && item.savingsPlan.length > 0 ? (
                    <div className="flex flex-col space-y-1">
                      {item.savingsPlan.map((plan, idx) => (
                        <div key={idx} className="text-xs">
                          <span className="font-medium">{plan.term}:</span> ${plan.retailPrice}
                        </div>
                      ))}
                    </div>
                  ) : '-'}
                </td>
                <td className="px-2 py-2 text-xs text-gray-900 truncate" title={item.productName}>
                  {item.productName}
                </td>
                <td className="px-2 py-2 text-xs text-gray-900 truncate" title={getRegionDisplayName(item.armRegionName)}>
                  {getRegionDisplayName(item.armRegionName)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {items.length > 10 && (
        <div className="border-t border-gray-200 px-2 py-2 bg-gray-50 text-right text-sm text-gray-500">
          Showing all {items.length} records
        </div>
      )}
    </div>
  );
}