/** @format */

// src/components/Header/IconButton.tsx
import React from "react";

interface IconButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  className?: string;
}

const IconButton: React.FC<IconButtonProps> = ({
  icon,
  label,
  onClick,
  className = "",
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`size-9.5 inline-flex justify-center items-center text-gray-800 hover:bg-gray-100 focus:outline-none rounded-full ${className} dark:text-white dark:hover:bg-neutral-700`}
    aria-label={label}
  >
    {icon}
  </button>
);

export default IconButton;
