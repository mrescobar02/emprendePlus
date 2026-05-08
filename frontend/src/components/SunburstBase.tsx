/** @format */

import { useRef, useEffect } from "react";
import * as d3 from "d3";

export type DataNode = {
  name: string;
  value?: number;
  children?: DataNode[];
};

export type HierarchyNode = {
  data: DataNode;
  width: number;
};

const SunburstBase = ({ data, width: ResponsiveWidth }: HierarchyNode) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // ————— Parámetros del gráfico —————
    const width = ResponsiveWidth;
    const height = width;
    const radius = width / 6;

    // 0) Crea el DIV del tooltip, oculto por defecto
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "sb-tooltip")
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("padding", "4px 8px")
      .style("background", "rgba(0,0,0,0.7)")
      .style("color", "#fff")
      .style("font-size", "10px")
      .style("border-radius", "4px")
      .style("opacity", 0);

    // Limpia cualquier cosa que hubiera
    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", [-width / 2, -height / 2, width, width])
      .style("font", "10px sans-serif");
    svg.selectAll("*").remove();

    const root = d3.hierarchy(data).sum((d: DataNode) => d.value ?? 0);

    const color = d3.scaleOrdinal(
      d3.quantize(d3.interpolateRainbow, data.children!.length + 1)
    );
    const partition = d3
      .partition<DataNode>()
      .size([2 * Math.PI, root.height + 1]);
    partition(root);

    // Inicializa current = target para cada nodo
    root.each((d: any) => (d.current = d));

    // ————— 2) Generador de arcos —————
    const arc = d3
      .arc<any>()
      .startAngle((d) => d.x0)
      .endAngle((d) => d.x1)
      .padAngle((d) => Math.min((d.x1 - d.x0) / 2, 0.005))
      .padRadius(() => radius * 1.5)
      .innerRadius((d) => d.y0 * radius)
      .outerRadius((d) => Math.max(d.y0 * radius, d.y1 * radius - 1));

    // ————— 3) Dibujar arcos —————
    const path = svg
      .append("g")
      .selectAll("path")
      .data(root.descendants().slice(1))
      .join("path")
      .attr("fill", (d: any) => {
        let node: any = d;
        while (node.depth > 1) node = node.parent;
        return color(node.data.name);
      })
      .attr("fill-opacity", (d: any) =>
        arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0
      )
      .attr("pointer-events", (d: any) =>
        arcVisible(d.current) ? "auto" : "none"
      )
      .attr("d", (d: any) => arc(d.current))
      .on("mouseover", (_, d: any) => {
        tooltip.style("opacity", 1).html(
          `${d
            .ancestors()
            .map((d: any) => d.data.name)
            .reverse()
            .join("/")}<br/>${d3.format(",d")(d.value)}`
        );
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY + 10 + "px");
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      });

    // ————— 4) Hacer clickeables los padres —————
    path
      .filter((d: any) => d.children)
      .style("cursor", "pointer")
      .on("click", clicked);

    // ————— 5) Dibujar labels —————
    const label = svg
      .append("g")
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
      .style("user-select", "none")
      .selectAll("text")
      .data(root.descendants().slice(1))
      .join("text")
      .attr("dy", "0.35em")
      .attr("fill", "currentColor")
      .attr("fill-opacity", (d: any) => +labelVisible(d.current))
      .attr("transform", (d: any) => labelTransform(d.current))
      .text((d: any) => d.data.name);

    // ————— 6) Círculo central “back” —————
    const parent = svg
      .append("circle")
      .datum(root)
      .attr("r", radius)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .style("cursor", "pointer")
      .on("click", clicked);

    // ————— 7) Función de clic y transición —————
    function clicked(event: any, p: any) {
      parent.datum(p.parent || root);

      // Calcula el target de cada nodo
      root.each((d: any) => {
        d.target = {
          x0:
            Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) *
            2 *
            Math.PI,
          x1:
            Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) *
            2 *
            Math.PI,
          y0: Math.max(0, d.y0 - p.depth),
          y1: Math.max(0, d.y1 - p.depth),
        };
      });

      const t = d3.transition().duration(event.altKey ? 7500 : 750);

      // Transición de arcos
      path
        .transition(t)
        .tween("data", (d: any) => {
          const i = d3.interpolate(d.current, d.target);
          return (t: any) => (d.current = i(t));
        })
        .filter(function (d: any) {
          return Boolean(
            +(this as SVGPathElement).getAttribute("fill-opacity")! ||
              arcVisible(d.target)
          );
        })
        .attr("fill-opacity", (d: any) =>
          arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0
        )
        .attr("pointer-events", (d: any) =>
          arcVisible(d.target) ? "auto" : "none"
        )
        .attrTween("d", (d: any) => {
          const interpolator = d3.interpolate(d.current, d.target);
          return (t: number) => arc(interpolator(t)) || "";
        });

      // Transición de labels
      label
        .filter(function (d: any) {
          return Boolean(
            +((this as SVGTextElement).getAttribute("fill-opacity") ?? 0) ||
              labelVisible(d.target)
          );
        })
        .transition(t)
        .attr("fill-opacity", (d: any) => +labelVisible(d.target))
        .attrTween("transform", (d: any) => () => labelTransform(d.current));
    }

    // ————— 8) Helpers de visibilidad —————
    function arcVisible(d: any) {
      return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
    }
    function labelVisible(d: any) {
      return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
    }
    function labelTransform(d: any) {
      const x = ((d.x0 + d.x1) / 2) * (180 / Math.PI);
      const y = ((d.y0 + d.y1) / 2) * radius;
      return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    }

    // ————— 9) Limpieza al desmontar —————
    return () => {
      svg.selectAll("*").remove();
    };
  }, []);

  return <svg ref={svgRef} width="100%" height="100%"></svg>;
};

export default SunburstBase;
