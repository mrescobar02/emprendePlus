// src/components/finances/BasicRadarChart.tsx
import React, { useState, useEffect, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts/core";
import { RadarChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { EChartsCoreOption } from "echarts/core";

// 1) Registramos los módulos que necesitamos
echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  RadarChart,
  CanvasRenderer,
]);

export interface RadarIndicator {
  name: string;
  max: number;
}

export interface RadarSeriesItem {
  value: number[];
  name: string;
}

type Props = {
  width?: string | number;
  height?: string | number;
  title?: string;
  indicators: RadarIndicator[]; // nombres y valores máximos de cada eje
  seriesName: string;           // etiqueta que aparecerá en leyenda/tooltip
  seriesData: number[];         // valores de la serie, en el mismo orden que `indicators`
};

export const BasicRadarChart: React.FC<Props> = ({
  width = "100%",
  height = 300,
  title = "",
  indicators,
  seriesName,
  seriesData,
}) => {
  // Detectamos si el usuario está en modo oscuro o claro
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    setIsDark(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Construimos la opción de ECharts (<EChartsCoreOption> en TypeScript)
  const option = useMemo<EChartsCoreOption>(
    () => ({
      // Fondo transparente para que se vea el gris del contenedor padre
      

      title: {
        text: title,
        left: "center",
        textStyle: {
          color: isDark ? "#F3F4F6" : "#1F2937", // gray-100 en dark, gray-800 en light
        },
      },

      tooltip: {
        trigger: "item",
        textStyle: {
          color: isDark ? "#F3F4F6" : "#1F2937",
        },
        backgroundColor: isDark ? "#374151" : "#FFFFFF", // gray-700 en dark, blanco en light
        borderColor: isDark ? "#4B5563" : "#D1D5DB",
        borderWidth: 1,
      },

      legend: {
        data: [seriesName],
        bottom: 0,
        textStyle: {
          color: isDark ? "#D1D5DB" : "#374151", // gray-300 en dark, gray-700 en light
        },
        itemWidth: 12,
        itemHeight: 8,
        inactiveColor: isDark ? "#6B7280" : "#9CA3AF", // gray-500/gray-400
      },

      radar: {
        indicator: indicators.map((ind) => ({
          name: ind.name,
          max: ind.max,
          nameTextStyle: {
            color: isDark ? "#E5E7EB" : "#4B5563", // gray-200 en dark, gray-600 en light
          },
        })),
        shape: "polygon",
        splitNumber: 4,
        axisName: {
          color: isDark ? "#E5E7EB" : "#4B5563", // gray-200 / gray-600
        },
        splitLine: {
          lineStyle: {
            color: isDark
              ? ["rgba(107,114,128, 0.3)"] // gray-500 al 30% en dark
              : ["rgba(156,163,175, 0.3)"], // gray-400 al 30% en light
          },
        },
        splitArea: {
          areaStyle: {
            color: isDark
              ? ["rgba(30,41,59, 0.0)", "rgba(30,41,59, 0.1)"] // neutral-800 degradado
              : ["rgba(248,250,252, 0.0)", "rgba(248,250,252, 0.5)"], // gray-100 degradado
          },
        },
        axisLine: {
          lineStyle: {
            color: isDark
              ? "rgba(107,114,128, 0.5)" // gray-500 al 50%
              : "rgba(203,213,225, 0.5)", // gray-300 al 50%
          },
        },
      },

      series: [
        {
          name: seriesName,
          type: "radar",
          data: [
            {
              value: seriesData,
              name: seriesName,
              areaStyle: {
                opacity: 0.25,
                // Azul suave: usamos blue-500 en light, blue-600 en dark
                color: isDark ? "#2563EB" : "#3B82F6",
              },
            },
          ],
          itemStyle: {
            // Color de puntos: blue-400 en dark, blue-600 en light
            color: isDark ? "#60A5FA" : "#2563EB",
          },
          lineStyle: {
            width: 2,
            // Línea: blue-400 en dark, blue-600 en light
            color: isDark ? "#60A5FA" : "#2563EB",
          },
        },
      ],
    }),
    [isDark, title, indicators, seriesName, seriesData]
  );

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-md border border-gray-200 dark:border-neutral-700 p-4">
      <ReactECharts
        echarts={echarts}
        option={option}
        style={{ width, height }}
      />
    </div>
  );
};
