import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="anime-card overflow-hidden">
      <div className="aspect-[3/4] skeleton" />
      <div className="p-3 space-y-2">
        <div className="h-4 skeleton w-3/4" />
        <div className="h-3 skeleton w-1/2" />
        <div className="flex gap-2">
          <div className="h-5 skeleton w-16 rounded-full" />
          <div className="h-5 skeleton w-12 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
