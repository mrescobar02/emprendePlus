/** @format */

import ReactECharts from "echarts-for-react";

const hours = [
  "12am",
  "1am",
  "2am",
  "3am",
  "4am",
  "5am",
  "6am",
  "7am",
  "8am",
  "9am",
  "10am",
  "11am",
  "12pm",
  "1pm",
  "2pm",
  "3pm",
  "4pm",
  "5pm",
  "6pm",
  "7pm",
  "8pm",
  "9pm",
  "10pm",
  "11pm",
];

const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

interface SalesHeatmapProps {
  data: number[][]; // [hour, day, value]
  startHour?: number;
  endHour?: number;
}

export default function SalesHeatmap({
  data,
  startHour = 0,
  endHour = 23,
}: SalesHeatmapProps) {
  // Asegura que el rango es válido
  const hourRange = Array.from(
    { length: endHour - startHour + 1 },
    (_, i) => i + startHour
  );
  const filteredHours = hourRange.map((h) => hours[h]);
  const filteredData = data.filter(
    ([hour]) => hour >= startHour && hour <= endHour
  );

  const option = {
    tooltip: { position: "top" },
    grid: { height: "80%", top: "10%" },
    xAxis: {
      type: "category",
      data: filteredHours,
      splitArea: { show: true },
    },
    yAxis: {
      type: "category",
      data: days,
      splitArea: { show: true },
    },
    visualMap: {
      min: 0,
      max: Math.max(...filteredData.map((d) => d[2]), 5),
      calculable: true,
      orient: "horizontal",
      left: "center",
      bottom: "10px",
    },
    series: [
      {
        name: "Ventas",
        type: "heatmap",
        data: filteredData.map(([hour, day, value]) => [
          hour - startHour,
          day,
          value,
        ]),
        label: { show: false },
        emphasis: {
          itemStyle: { shadowBlur: 10, shadowColor: "rgba(0, 0, 0, 0.5)" },
        },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 300 }} />;
}
