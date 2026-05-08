/** @format */

// src/components/LineChart.tsx
import React, { useRef, useEffect } from "react";
import {
  select,
  scaleTime,
  scaleLinear,
  axisBottom,
  axisLeft,
  line,
  curveMonotoneX,
  area,
  extent,
  max,
  bisector,
  pointer,
} from "d3";
import { localeEs } from "./types/chartFormatsTypes";

export interface DataPoint {
  date: Date;
  value: number;
}

interface LineChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  width = 700,
  height = 300,
  margin = { top: 20, right: 30, bottom: 30, left: 40 },
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data.length) return;

    const svg = select(svgRef.current);
    svg.selectAll("*").remove();

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // escalas
    const xScale = scaleTime()
      .domain(extent(data, (d) => d.date) as [Date, Date])
      .range([0, innerWidth]);
    const yScale = scaleLinear()
      .domain([0, max(data, (d) => d.value)!])
      .nice()
      .range([innerHeight, 0]);

    // grupo interior
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // ejes
    const xAxisG = g
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(
        axisBottom(xScale)
          .ticks(6)
          .tickFormat((d) => localeEs.format("%b")(d as Date))
      );
    const yAxisG = g.append("g").call(axisLeft(yScale).ticks(5));

    [xAxisG, yAxisG].forEach((axisG) => {
      axisG.selectAll("path, line").attr("stroke", "currentColor");
      axisG.selectAll("text").attr("fill", "currentColor");
    });

    // área bajo la curva
    const areaGenerator = area<DataPoint>()
      .x((d) => xScale(d.date))
      .y0(innerHeight)
      .y1((d) => yScale(d.value))
      .curve(curveMonotoneX);
    g.append("path")
      .datum(data)
      .attr("fill", "rgba(59,130,246,0.2)")
      .attr("d", areaGenerator);

    // línea
    const lineGenerator = line<DataPoint>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.value))
      .curve(curveMonotoneX);
    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#3B82F6")
      .attr("stroke-width", 2)
      .attr("d", lineGenerator);

    // tooltip
    const tooltipG = g.append("g").style("display", "none");
    tooltipG.append("circle").attr("r", 4).attr("fill", "#3B82F6");
    const tooltipText = tooltipG
      .append("text")
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .attr("font-size", 12)
      .attr("fill", "currentColor");

    // captura de eventos
    svg
      .append("rect")
      .attr("transform", `translate(${margin.left},${margin.top})`)
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("mouseover", () => tooltipG.style("display", null))
      .on("mouseout", () => tooltipG.style("display", "none"))
      .on("mousemove", (event) => {
        const [mx] = pointer(event, svg.node());
        const x0 = xScale.invert(mx - margin.left);
        const i = bisector<DataPoint, Date>((d) => d.date).left(data, x0, 1);
        const d0 = data[i - 1],
          d1 = data[i];
        const dClosest =
          !d1 ||
          x0.getTime() - d0.date.getTime() < d1.date.getTime() - x0.getTime()
            ? d0
            : d1;
        tooltipG.attr(
          "transform",
          `translate(${xScale(dClosest.date)},${yScale(dClosest.value)})`
        );
        tooltipText.text(dClosest.value.toString());
      });
  }, [data, width, height, margin]);

  return (
    <div className="w-full max-w-full">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto text-gray-800 dark:text-neutral-200"
      />
    </div>
  );
};

export default LineChart;
