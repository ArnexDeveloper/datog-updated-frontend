import React from 'react';

const SkeletonLine: React.FC<{ width?: string | number; height?: number }> = ({ width = '100%', height = 14 }) => (
  <div
    style={{
      height,
      width,
      background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
      backgroundSize: '200% 100%',
      animation: 'jc-shimmer 1.2s infinite',
      borderRadius: 3,
      display: 'inline-block',
    }}
  />
);

export default SkeletonLine;
