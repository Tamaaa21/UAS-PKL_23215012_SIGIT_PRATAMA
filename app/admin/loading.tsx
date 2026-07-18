export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar skeleton */}
      <div className="hidden md:flex w-64 bg-[#003399] flex-col p-4 space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-blue-400/30 animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-3 w-20 bg-blue-400/30 rounded animate-pulse" />
            <div className="h-2.5 w-16 bg-blue-400/20 rounded animate-pulse" />
          </div>
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 w-full bg-blue-400/10 rounded-lg animate-pulse" />
        ))}
      </div>

      {/* Main content skeleton */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#003399] border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="h-4 w-36 bg-gray-200 rounded animate-pulse mx-auto" />
        </div>
      </div>
    </div>
  );
}
