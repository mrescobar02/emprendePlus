/** @format */

// src/components/Sidebar.tsx
import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import "preline/dist/preline.js"; // importa Preline
import { NavItem } from "../types/navigation";
import EmprendePlusLogo from "./Logos/EmprendePlusLogo";

interface SidebarProps {
  items: NavItem[];
}

declare global {
  interface Window {
    Preline?: {
      init: () => void;
    };
  }
}
const Sidebar: React.FC<SidebarProps> = ({ items }) => {
  useEffect(() => {
    window?.Preline?.init();
  }, []);

  return (
    <aside
      id="hs-application-sidebar"
      className="hs-overlay transition-all duration-300 transform
        w-65 h-full fixed inset-y-0 start-0 z-60
        bg-white border-e border-gray-200
        lg:block lg:translate-x-0 lg:end-auto lg:bottom-0
        dark:bg-neutral-800 dark:border-neutral-700
        hidden xs:block"
      role="dialog"
      aria-label="Sidebar"
    >
      <div className="relative flex flex-col h-full">
        {/* Logo */}
        <div className="px-6 pt-4 flex items-center mb-7">
          <EmprendePlusLogo />
        </div>

        {/* Nav */}
        <div className="h-full overflow-y-auto p-3">
          <ul className="flex flex-col space-y-1" data-hs-accordion-always-open>
            {items.map((item, i) => {
              const hasChildren =
                Array.isArray(item.children) && item.children.length > 0;
              const accId = `sidebar-acc-${i}`;

              if (!hasChildren) {
                return (
                  <li key={i}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center gap-x-3.5 py-2 px-2.5 text-sm rounded-lg
                         ${
                           isActive
                             ? "bg-gray-100 text-gray-800 dark:bg-neutral-700 dark:text-white font-semibold"
                             : "text-gray-800 hover:bg-gray-100 dark:text-neutral-200 dark:hover:bg-neutral-700"
                         }`
                      }
                    >
                      {item.icon}
                      {item.label}
                    </NavLink>
                  </li>
                );
              }

              return (
                <li key={i} className="hs-accordion" id={accId}>
                  <button
                    type="button"
                    className="
                      hs-accordion-toggle w-full flex items-center gap-x-3.5
                      py-2 px-2.5 text-sm rounded-lg
                      text-gray-800 hover:bg-gray-100
                      dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700
                    "
                    aria-expanded="false"
                    data-hs-accordion-target={`#${accId}-child`}
                    aria-controls={`${accId}-child`}
                  >
                    {item.icon}
                    {item.label}
                    {/* icono “down” */}
                    <svg
                      className="hs-accordion-active:hidden ms-auto block size-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                    {/* icono “up” */}
                    <svg
                      className="hs-accordion-active:block ms-auto hidden size-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  </button>

                  <div
                    id={`${accId}-child`}
                    className="
                      hs-accordion-content overflow-hidden transition-[height] duration-300
                      hidden ps-8 pt-1
                    "
                    role="region"
                    aria-labelledby={accId}
                  >
                    <ul className="space-y-1">
                      {item.children!.map((sub, j) => (
                        <li key={j}>
                          <NavLink
                            to={sub.to}
                            className={({ isActive }) =>
                              `flex items-center gap-x-3.5 py-2 px-2.5 text-sm rounded-lg
                               ${
                                 isActive
                                   ? "bg-gray-100 text-gray-800 dark:bg-neutral-700 dark:text-white font-semibold"
                                   : "text-gray-800 hover:bg-gray-100 dark:text-neutral-200 dark:hover:bg-neutral-700"
                               }`
                            }
                          >
                            {sub.icon}
                            {sub.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
