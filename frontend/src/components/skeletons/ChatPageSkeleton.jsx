const ChatPageSkeleton = () => {
  return (
    <div className="flex h-full w-full" aria-busy="true">
      {/* Sidebar skeleton */}
      <aside className="hidden sm:flex w-[380px] lg:w-[400px] bg-base-100  flex-col">
        <div className="p-4 space-y-4 border-b border-base-300">
          <div className="skeleton h-6 w-24" />
          <div className="skeleton h-10 w-full rounded-full" />
          <div className="flex gap-2">
            {['All', 'Unread', 'Groups', 'Favorites'].map((item, i) => (
              <div key={i} className="skeleton h-8 w-16 rounded-full" />
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="px-4 py-3 flex gap-3 border-b border-base-200">
              <div className="skeleton w-12 h-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-40" />
                <div className="skeleton h-3 w-24" />
              </div>
              <div className="skeleton w-6 h-6 rounded-full" />
            </div>
          ))}
        </div>
      </aside>

      {/* Main content skeleton */}
      <div className="flex-1 flex items-center justify-center bg-base-200/40 overflow-hidden">
        <div className="space-y-4 text-center p-4">
          <div className="skeleton w-16 h-16 rounded-2xl mx-auto" />
          <div className="skeleton h-6 w-40 mx-auto" />
          <div className="skeleton h-4 w-64 mx-auto" />
          <div className="skeleton h-10 w-32 mx-auto rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default ChatPageSkeleton;