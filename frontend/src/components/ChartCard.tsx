import { ReactNode } from "react";
export type ChartCardProps = {
  title?: string;
  value?: string;
  changeBadge?: ReactNode;
  children: ReactNode;
  className?: string;
  widthMode?: "auto" | "full" | "fit";
};

const ChartCard = ({
  title,
  value,
  changeBadge,
  children,
  className = "",
  widthMode = "auto",
}: ChartCardProps) => {
  const widthClasses = {
    auto: "",
    full: "w-full",
    fit: "w-fit",
  } as const;

  return (
    <div
      className={[
        "p-4 md:p-5 flex flex-col",
        "bg-white border border-gray-200 shadow-2xs rounded-xl",
        "dark:bg-neutral-800 dark:border-neutral-700",
        "min-w-0",
        "dark:text-gray-200",
        widthClasses[widthMode],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Header: título, valor y badge */}
      {(title || value || changeBadge) && (
        <div className="flex justify-between items-center mb-4">
          <div>
            {title && (
              <h2 className="text-sm text-gray-500 dark:text-neutral-500">
                {title}
              </h2>
            )}
            {value && (
              <p className="text-xl sm:text-2xl font-medium text-gray-800 dark:text-neutral-200">
                {value}
              </p>
            )}
          </div>
          {changeBadge && <div>{changeBadge}</div>}
        </div>
      )}
      <div className="flex-1 min-w-0 overflow-hidden">{children}</div>
    </div>
  );
};

export default ChartCard;
