'use client';

export default function QueryFilter({ filter }: { filter: string }) {
  if (!filter) return null;
  
  return (
    <div className="bg-blue-50 rounded-xl border border-blue-200 shadow-sm p-4 mb-6">
      <div className="flex items-center gap-2 mb-2">
        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <h3 className="font-medium text-blue-800">查询解析</h3>
      </div>
      
      <div className="bg-white border border-blue-100 rounded-lg p-3 font-mono text-sm text-gray-700 overflow-x-auto">
        {filter}
      </div>
      
      <p className="mt-2 text-xs text-blue-600">
        以上是生成的 OData 查询过滤器，使用 Azure 价格 API 进行查询
      </p>
    </div>
  );
}