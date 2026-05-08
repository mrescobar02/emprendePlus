/** @format */

// src/components/GaugeChart.tsx
import { useRef, useEffect } from "react";
import {
  select,
  scaleLinear,
  arc as d3Arc,
  interpolateHsl,
  rgb,
  line,
  easeElasticOut,
} from "d3";

export interface GaugeChartProps {
  id: string;
  value: number;
  size?: number;
  ringWidth?: number;
  ringInset?: number;
  minValue?: number;
  maxValue?: number;
  majorTicks?: number;
  transitionMs?: number;
  colorScheme?: "default" | "thermometer";
  showPercentageLabel?: boolean;
  showTickLabels?: boolean;
}

const GaugeChart: React.FC<GaugeChartProps> = ({
  id,
  value,
  size = 300,
  ringWidth = 60,
  ringInset = 20,
  minValue = 0,
  maxValue = 10,
  majorTicks = 5,
  transitionMs = 1000,
  colorScheme = "default",
  showPercentageLabel = false,
  showTickLabels = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const cfg = {
      size,
      ringWidth,
      ringInset,
      pointerWidth: 10,
      pointerTailLength: 5,
      pointerHeadLengthPercent: 0.9,
      minAngle: -90,
      maxAngle: +90,
      majorTicks,
      labelInset: 10,
      transitionMs,
    };

    const pad = cfg.labelInset + 8;
    const range = cfg.maxAngle - cfg.minAngle;
    const r = cfg.size / 2;
    const pointerHeadLength = Math.round(r * cfg.pointerHeadLengthPercent);

    const scale = scaleLinear<number, number>()
      .domain([minValue, maxValue])
      .range([0, 1]);

    const ticks = scale.ticks(cfg.majorTicks);
    const tickData = Array(cfg.majorTicks).fill(1 / cfg.majorTicks);

    const arcColorFn =
      colorScheme === "thermometer"
        ? interpolateHsl(rgb("red"), rgb("green"))
        : interpolateHsl(rgb("#e8e2ca"), rgb("#3e6c0a"));

    const arcGen = d3Arc<number>()
      .innerRadius(r - cfg.ringWidth - cfg.ringInset)
      .outerRadius(r - cfg.ringInset)
      .startAngle((d, i) => ((cfg.minAngle + d * i * range) * Math.PI) / 180)
      .endAngle(
        (d, i) => ((cfg.minAngle + d * (i + 1) * range) * Math.PI) / 180
      );

    const root = select(containerRef.current);
    root.selectAll("*").remove();

    const totalW = cfg.size + pad * 2;
    const totalH = cfg.size / 2 + pad * 2 + 20;
    const svg = root
      .append("svg")
      .attr("width", totalW)
      .attr("height", totalH)
      .attr("viewBox", `0 0 ${totalW} ${totalH}`)
      .append("g")
      .attr("transform", `translate(${pad + r}, ${pad + r})`);

    // Arcos
    svg
      .selectAll("path")
      .data(tickData)
      .enter()
      .append("path")
      .attr("fill", (_d, i) => arcColorFn(i / cfg.majorTicks))
      .attr("d", arcGen);

    // Etiquetas de ticks
    {
      showTickLabels &&
        svg
          .selectAll("text.tick")
          .data(ticks)
          .enter()
          .append("text")
          .classed("tick", true)
          .attr("transform", (d) => {
            const ratio = scale(d);
            const angle = cfg.minAngle + ratio * range;
            // si las queremos afuera, aumentamos la traslación
            const dist = cfg.labelInset - r;
            return `rotate(${angle}) translate(0, ${dist})`;
          })
          .attr("text-anchor", "middle")
          .attr("fill", "currentColor")
          .text((d) => d.toString());
    }
    // Puntero
    const adjustedPointerHeadLength = Math.round(
      (pointerHeadLength * (maxValue - 5)) / (maxValue - minValue)
    );

    const lineData: [number, number][] = [
      [cfg.pointerWidth / 2, 0],
      [0, -adjustedPointerHeadLength],
      [-(cfg.pointerWidth / 2), 0],
      [0, cfg.pointerTailLength],
      [cfg.pointerWidth / 2, 0],
    ];
    const pointer = svg
      .append("g")
      .attr("class", "pointer")
      .append("path")
      .datum(lineData)
      .attr(
        "d",
        line()
          .x((d: any) => d[0])
          .y((d: any) => d[1])
      )
      .attr("transform", `rotate(${cfg.minAngle})`)
      .attr("fill", "currentColor");

    // Etiqueta central de porcentaje
    if (showPercentageLabel) {
      const pct =
        Math.round(((value - minValue) / (maxValue - minValue)) * 1000) / 10;

      let labelText: string;
      let labelColor: string;

      if (colorScheme === "thermometer") {
        if (pct <= 20) {
          labelText = "Crítico";
          labelColor = "#E53E3E"; // rojo
        } else if (pct <= 60) {
          labelText = "Peligro";
          labelColor = "#DD6B20"; // naranja
        } else if (pct <= 80) {
          labelText = "Bien";
          labelColor = "#38A169"; // verde
        } else {
          labelText = "Excelente";
          labelColor = "#38A169"; // azul
        }
      } else {
        // fallback: mostramos el porcentaje en textos si no es 'thermometer'
        labelText = `${pct}%`;
        labelColor = "currentColor";
      }

      svg
        .append("text")
        .attr("text-anchor", "middle")
        .attr("y", 0) // centrado verticalmente en el semicírculo
        .attr("dy", "1.3em")
        .attr("fill", labelColor)
        .style("font-size", "1.5em")
        .style("font-weight", "bold")
        .text(labelText);
    }

    const updatePointer = (newValue: number) => {
      const ratio = scale(newValue); // con .clamp(true)
      const rawAngle = cfg.minAngle + ratio * (cfg.maxAngle - cfg.minAngle);
      const angle = Math.max(cfg.minAngle, Math.min(cfg.maxAngle, rawAngle));

      pointer
        .transition()
        .duration(cfg.transitionMs)
        // Elasticidad muy suave: amplitud baja, periodo corto
        .ease(easeElasticOut.amplitude(0.1).period(0.9))
        .attr("transform", `rotate(${angle})`);
    };
    updatePointer(value);

    return () => {
      root.selectAll("*").remove();
    };
  }, [
    size,
    ringWidth,
    ringInset,
    minValue,
    maxValue,
    majorTicks,
    transitionMs,
    value,
    colorScheme,
    showPercentageLabel,
    showTickLabels,
  ]);

  return <div id={id} ref={containerRef} className="dark:text-gray-200" />;
};

export default GaugeChart;
