export default function Loading() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-5">
        {/* Loader */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-[3px] border-gray-200" />

          <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-indigo-600 border-r-indigo-400 animate-spin" />

          <div className="absolute inset-[9px] rounded-full bg-white shadow-sm flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
          </div>
        </div>

        {/* Loading text */}
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-800">
            Loading
            <span className="inline-flex ml-1">
              <span className="animate-bounce [animation-delay:0ms]">.</span>
              <span className="animate-bounce [animation-delay:150ms]">.</span>
              <span className="animate-bounce [animation-delay:300ms]">.</span>
            </span>
          </p>

          <p className="mt-1 text-xs text-gray-400">Please wait a moment</p>
        </div>
      </div>
    </main>
  );
}
