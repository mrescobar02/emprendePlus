/** @format */

// src/components/Loading.tsx
import React from "react";

const Loading: React.FC<{ size?: number }> = ({ size = 6 }) => (
  <div
    className={`
      inline-block
      w-${size} h-${size}
      border-4
      border-blue-600 border-t-transparent
      rounded-full
      animate-spin
      dark:border-blue-300 dark:border-t-transparent
    `}
  />
);

export default Loading;
