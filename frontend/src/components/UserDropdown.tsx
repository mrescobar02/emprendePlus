/** @format */

// src/components/Header/UserDropdown.tsx
import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

export interface UserDropdownProps {
  userName: string;
  businessName: string;
  email: string;
  avatarUrl?: string;
  onLogout?: () => void;
}

const initials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

const UserDropdown: React.FC<UserDropdownProps> = ({
  userName,
  businessName,
  email,
  avatarUrl,
  onLogout,
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    { label: "Mi Emprendimiento", to: "/business" },
    { label: "Perfil", to: "/profile" },
  ];

  return (
    <div ref={ref} className="relative inline-block text-left">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-3 focus:outline-none"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <div className="flex flex-col items-end">
          <span className="text-sm font-medium text-gray-800 dark:text-white">
            {userName}
          </span>
          <span className="text-xs text-gray-500 dark:text-neutral-400">
            {businessName}
          </span>
        </div>
        {avatarUrl && !imgFailed ? (
          <img
            src={avatarUrl}
            alt={`${userName} avatar`}
            className="w-10 h-10 rounded-full object-cover object-center bg-gray-200"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <span className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold select-none">
            {initials(userName) || "?"}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-md dark:bg-neutral-800 dark:border-neutral-700"
          role="menu"
        >
          <div className="py-3 px-5 bg-gray-100 rounded-t-lg dark:bg-neutral-700">
            <p className="text-xs text-gray-500 dark:text-neutral-500">
              {userName}
            </p>
            <p className="text-sm font-medium text-gray-800 dark:text-neutral-200">
              {businessName}
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-neutral-400">
              {email}
            </p>
          </div>
          <div className="py-1">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-700"
                role="menuitem"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <hr className="my-1 border-gray-200 dark:border-neutral-700" />
            <button
              onClick={() => {
                setOpen(false);
                onLogout?.();
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-neutral-700"
              role="menuitem"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
