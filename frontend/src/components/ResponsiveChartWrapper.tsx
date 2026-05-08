/** @format */

// src/components/ResponsiveChartWrapper.tsx
import React, { useRef } from "react";
import { useContainerWidth } from "../hooks/useContainerWidth";

type ResponsiveChartWrapperProps = {
  children: (width: number) => React.ReactNode;
  className?: string;
};

const ResponsiveChartWrapper: React.FC<ResponsiveChartWrapperProps> = ({
  children,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const width = useContainerWidth(containerRef);

  return (
    <div ref={containerRef} className={`w-full ${className}`}>
      {width > 0 ? children(width) : null}
    </div>
  );
};

export default ResponsiveChartWrapper;
