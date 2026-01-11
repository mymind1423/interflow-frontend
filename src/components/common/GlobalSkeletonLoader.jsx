import React from 'react';

const GlobalSkeletonLoader = () => {
  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300" style={{ background: 'var(--bg-body)' }}>
      {/* Navbar Skeleton */}
      <div className="border-b border-transparent h-18 md:h-20 flex items-center px-4 md:px-8 justify-between sticky top-0 z-50 glass-panel">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl animate-pulse" style={{ background: 'var(--skeleton-base)' }} />
          <div className="w-32 h-6 rounded animate-pulse hidden md:block" style={{ background: 'var(--skeleton-base)' }} />
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-24 h-9 rounded-full animate-pulse" style={{ background: 'var(--skeleton-highlight)' }} />
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <div className="w-9 h-9 rounded-full animate-pulse" style={{ background: 'var(--skeleton-highlight)' }} />
          {/* Auth Buttons / Profile */}
          <div className="w-28 h-10 rounded-full animate-pulse hidden md:block" style={{ background: 'var(--skeleton-base)' }} />
          {/* Mobile Menu */}
          <div className="w-9 h-9 rounded-lg animate-pulse md:hidden" style={{ background: 'var(--skeleton-base)' }} />
        </div>
      </div>

      {/* Main Content Skeleton (Hero Style) */}
      <div className="flex-1 max-w-screen-2xl mx-auto w-full px-4 md:px-8 py-12 flex flex-col md:flex-row gap-12 items-center">
        {/* Left Text */}
        <div className="flex-1 w-full space-y-6">
          <div className="w-32 h-6 rounded animate-pulse" style={{ background: 'var(--skeleton-base)' }} />
          <div className="w-full h-16 rounded-2xl animate-pulse" style={{ background: 'var(--skeleton-base)' }} />
          <div className="w-3/4 h-16 rounded-2xl animate-pulse" style={{ background: 'var(--skeleton-base)' }} />
          <div className="w-full h-24 rounded-lg animate-pulse mt-8" style={{ background: 'var(--skeleton-highlight)' }} />
          <div className="flex gap-4 mt-8">
            <div className="w-40 h-12 rounded-xl animate-pulse" style={{ background: 'var(--skeleton-base)' }} />
            <div className="w-40 h-12 rounded-xl animate-pulse" style={{ background: 'var(--skeleton-base)' }} />
          </div>
        </div>

        {/* Right Image/Dashboard Preview */}
        <div className="flex-1 w-full relative">
          <div className="aspect-square md:aspect-video w-full rounded-3xl animate-pulse" style={{ background: 'var(--skeleton-highlight)' }} />
        </div>
      </div>
    </div>
  );
};

export default GlobalSkeletonLoader;
