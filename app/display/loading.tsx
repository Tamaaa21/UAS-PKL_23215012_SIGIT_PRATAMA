export default function DisplayLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#001a4d] to-[#002b80] flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <div className="space-y-2">
          <div className="h-5 w-48 bg-white/10 rounded animate-pulse mx-auto" />
          <div className="h-4 w-32 bg-white/10 rounded animate-pulse mx-auto" />
        </div>
      </div>
    </div>
  );
}
