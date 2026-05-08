/** @format */

// src/components/FullPageLoader.tsx
import React from "react";
import LoadingPulse from "./LoadingPulse";

const FullPageLoader: React.FC = () => (
  <div
    className="
    fixed inset-0
    flex items-center justify-center
    bg-white dark:bg-neutral-900
    z-50
  "
  >
    <div className="w-60">
      <LoadingPulse />
    </div>
  </div>
);

export default FullPageLoader;
