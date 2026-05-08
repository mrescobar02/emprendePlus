/** @format */

// src/components/StatsCard.tsx
import React, { useState } from "react";
import ChangeBadge from "./ChangeBadge";
import { CircleHelp } from "lucide-react";

export interface StatsCardProps {
  title: string;
  tooltip?: string;
  value: string;
  /** Porcentaje con signo, p.ej. "1.7%" o "-2.3%" */
  change?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  tooltip,
  value,
  change,
}) => {
  const [isTooltipVisible, setTooltipVisible] = useState(false);

  return (
    <div className="flex flex-colm min-w-48 bg-white border border-gray-200 shadow-2xs rounded-xl dark:bg-neutral-800 dark:border-neutral-700">
      <div className="p-4 md:p-5">
        <div className="flex items-center gap-x-2">
          <p className="text-xs uppercase text-gray-500 dark:text-neutral-500">
            {title}
          </p>
          {tooltip && (
            <div
              className="relative"
              onMouseEnter={() => setTooltipVisible(true)}
              onMouseLeave={() => setTooltipVisible(false)}
            >
              <CircleHelp className="text-neutral-200 dark:text-neutral-500 w-4" />
              {isTooltipVisible && (
                <span
                  className="absolute z-10 py-1 px-2 bg-gray-900 text-xs font-medium text-white rounded-md shadow-2xs dark:bg-neutral-700"
                  role="tooltip"
                  style={{
                    top: "100%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {tooltip}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="mt-1 flex items-center gap-x-2">
          <h3 className="text-xl sm:text-2xl font-medium text-gray-800 dark:text-neutral-200">
            {value}
          </h3>
          {change && <ChangeBadge percent={change} />}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
