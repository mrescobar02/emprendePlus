/** @format */

import {
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface Props {
  current: number;
  goal: number;
}

export default function MonthlyGoalGauge({ current, goal }: Props) {
  const percent = Math.min((current / goal) * 100, 100);

  const data = [
    {
      name: "Fondo",
      value: goal,
      fill: "#E5E7EB",
    },
    {
      name: "Progreso",
      value: current,
      fill: "#4ade80",
    },
  ];

  return (
    <div style={{ height: 250 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="70%"
          outerRadius="100%"
          barSize={20}
          data={data}
          startAngle={180}
          endAngle={0}
        >
          <RadialBar
            dataKey="value"
            background={false}
            cornerRadius={10}
            isAnimationActive={true}
          />
          <Tooltip
            formatter={(value: number, name: string) => {
              if (name === "Fondo")
                return [`$${goal.toLocaleString()}`, "Meta"];
              if (name === "Progreso")
                return [`$${current.toLocaleString()}`, "Ventas actuales"];
              return [value, name];
            }}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <p className="text-center font-semibold mt-2 text-neutral-700 dark:text-neutral-300">
        {percent.toFixed(1)}% de ${goal.toLocaleString()}
      </p>
    </div>
  );
}
