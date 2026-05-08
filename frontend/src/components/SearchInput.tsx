/** @format */

// src/components/Header/SearchInput.tsx
import React from "react";

const SearchInput: React.FC = () => (
  <div className="relative w-full max-w-xs">
    <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
      <svg
        className="shrink-0 size-4 text-gray-400 dark:text-white/60" /* ... */
      />
    </div>
    <input
      type="text"
      placeholder="Search"
      className="py-2 ps-10 pe-16 block w-full bg-white border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400"
    />
    <button
      type="button"
      className="absolute inset-y-0 end-0 inline-flex items-center pe-3 pointer-events-none"
      aria-label="Shortcut"
    >
      <svg className="size-3 text-gray-400 dark:text-white/60" /* … */ />
      <span className="mx-1 text-xs">/</span>
    </button>
  </div>
);

export default SearchInput;
