export default function HomeLoading() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navbar skeleton */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#003399] h-16">
        <div className="max-w-full mx-auto px-6 h-full flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-400/30 animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-3 w-16 bg-blue-400/30 rounded animate-pulse" />
            <div className="h-2.5 w-36 bg-blue-400/20 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Hero skeleton */}
      <div className="relative min-h-screen bg-gradient-to-b from-[#001a4d] to-[#002b80] flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="h-8 w-64 bg-white/10 rounded animate-pulse mx-auto" />
          <div className="h-8 w-48 bg-white/10 rounded animate-pulse mx-auto" />
        </div>
      </div>

      {/* Section skeletons */}
      <div className="py-20 max-w-7xl mx-auto px-6 md:px-16">
        <div className="flex gap-12">
          <div className="w-1/2 space-y-4">
            <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="w-1/2 aspect-[4/3] bg-gray-200 rounded-2xl animate-pulse" />
        </div>
      </div>

      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <div className="text-center space-y-3 mb-12">
            <div className="h-5 w-32 bg-gray-200 rounded-full animate-pulse mx-auto" />
            <div className="h-8 w-56 bg-gray-200 rounded animate-pulse mx-auto" />
          </div>
          <div className="grid grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="h-44 bg-gray-200 animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
