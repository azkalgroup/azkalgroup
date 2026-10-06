import React from 'react';

export default function SkeletonCard({ height = 'h-32' }: { height?: string }) {
  return (
    <div className={`bg-gray-200 rounded-xl animate-pulse ${height}`}></div>
  );
}
