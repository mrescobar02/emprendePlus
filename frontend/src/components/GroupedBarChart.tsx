/** @format */

// src/components/GroupedBarChart.tsx
import React, { useRef, useEffect } from "react";
import {
  select,
  scaleBand,
  scaleLinear,
  axisBottom,
  axisLeft,
  max,
  pointer,
} from "d3";

export interface MonthlyData {
  month: string;
  primary: number;
  secondary: number;
}

interface GroupedBarChartProps {
  data: MonthlyData[];
  firstDataTitle?: string;
  secondDataTitle?: string;
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
}

const GroupedBarChart: React.FC<GroupedBarChartProps> = ({
  data,
  firstDataTitle = "Primario",
  secondDataTitle = "Secundario",
  width = 700,
  height = 300,
  margin = { top: 20, right: 20, bottom: 40, left: 50 },
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data.length) return;
    const svg = select(svgRef.current);
    svg.selectAll("*").remove();

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // escalas
    const x0 = scaleBand<string>()
      .domain(data.map((d) => d.month))
      .range([0, innerWidth])
      .padding(0.2);

    const x1 = scaleBand<string>()
      .domain(["primary", "secondary"])
      .range([0, x0.bandwidth()])
      .padding(0.1);

    const y = scaleLinear()
      .domain([0, max(data, (d) => Math.max(d.primary, d.secondary))!])
      .nice()
      .range([innerHeight, 0]);

    // contenedor interior
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // tooltip DIV
    const tooltip = select("body")
      .append("div")
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("background", "white")
      .style("padding", "4px 8px")
      .style("border", "1px solid rgba(0,0,0,0.1)")
      .style("border-radius", "4px")
      .style("font-size", "12px")
      .style("color", "#111827") // text-gray-800
      .style("display", "none");

    // dibujar barras
    const colors = { primary: "#3B82F6", secondary: "#9CA3AF" };
    g.selectAll("g.bar-group")
      .data(data)
      .join("g")
      .attr("class", "bar-group")
      .attr("transform", (d) => `translate(${x0(d.month)},0)`)
      .selectAll("rect")
      .data((d) =>
        (["primary", "secondary"] as const).map((key) => ({
          key,
          value: d[key],
        }))
      )
      .join("rect")
      .attr("x", (d) => x1(d.key)!)
      .attr("y", (d) => y(d.value))
      .attr("width", x1.bandwidth())
      .attr("height", (d) => innerHeight - y(d.value))
      .attr("fill", (d) => colors[d.key])
      .on("mouseover", (_event, d) => {
        tooltip
          .style("display", "block")
          .html(
            `<strong>${
              d.key === "primary" ? firstDataTitle : secondDataTitle
            }</strong>: ${d.value}`
          );
      })
      .on("mousemove", (event) => {
        const [_x, _yPos] = pointer(event);
        tooltip
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY + 10}px`);
      })
      .on("mouseout", () => {
        tooltip.style("display", "none");
      });

    // ejes
    const xAxisG = g
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(axisBottom(x0).tickSizeOuter(0));
    const yAxisG = g.append("g").call(axisLeft(y).ticks(5));

    // axes color = currentColor (so Tailwind dark/light themes apply)
    [xAxisG, yAxisG].forEach((axisG) => {
      axisG.selectAll("path, line").attr("stroke", "currentColor");
      axisG.selectAll("text").attr("fill", "currentColor");
    });

    const legend = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, 0)`);

    const legendItems = [
      { label: firstDataTitle, color: colors.primary },
      { label: secondDataTitle, color: colors.secondary },
    ];

    legendItems.forEach((item, index) => {
      const itemGroup = legend
        .append("g")
        .attr("transform", `translate(${index * 150}, 0)`);

      itemGroup
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", item.color);

      itemGroup
        .append("text")
        .attr("x", 18)
        .attr("y", 10)
        .attr("fill", "currentColor")
        .style("font-size", "12px")
        .text(item.label);
    });

    // cleanup tooltip on unmount
    return () => {
      tooltip.remove();
    };
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

export default GroupedBarChart;
