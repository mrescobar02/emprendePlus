import React from "react";
import { useTransition, animated } from "react-spring";
import type { ScaleBand } from "d3";

interface FrameDatum {
  name: string;
  value: number;
  category?: string;
}

interface Props {
  frameData: FrameDatum[];
  xScale: (v: number) => number;
  yScale: ScaleBand<string>;
  colorScale: (n: string) => string;
}

const AnimatedRect = animated("rect");
const AnimatedText = animated("text");

const RacingBarGroup = React.forwardRef<any, Props>(
  ({ frameData, xScale, yScale, colorScale }, ref) => {
    const barHeight = yScale.bandwidth();

    const transitions = useTransition<
      FrameDatum,
      {
        x: number;
        width: number;
        y: number;
      }
    >(frameData, {
      keys: (d) => d.name,
      from: (d) => ({
        x: 0,
        width: 0,
        y: yScale(d.name) ?? 0,
      }),
      enter: (d) => ({
        x: 0,
        width: xScale(d.value),
        y: yScale(d.name) ?? 0,
      }),
      update: (d) => ({
        x: 0,
        width: xScale(d.value),
        y: yScale(d.name) ?? 0,
      }),
      leave: (d) => ({
        x: 0,
        width: 0,
        y: yScale(d.name) ?? 0,
      }),
      config: { tension: 170, friction: 26 },
    });

    return (
      <g ref={ref}>
        {transitions((props, item) => (
          <g key={item.name}>
            {/* La barra animada */}
            <AnimatedRect
              x={props.x}
              y={props.y}
              width={props.width}
              height={barHeight}
              fill={colorScale(item.name)}
            />
            {/* El texto con el nombre, 4px a la derecha del final de la barra */}
            <AnimatedText
              x={props.width.to((w) => Math.max(w - 20, 0))}
              y={props.y.to((y) => y + yScale.bandwidth()! / 2 - 5)}
              fill="white"
              fontWeight={"bold"}
              fontSize={12}
              textAnchor="end"
            >
              {item.name}
            </AnimatedText>

            <AnimatedText
              x={props.width.to((w) => Math.max(w - 20, 0))}
              y={props.y.to((y) => y + yScale.bandwidth()! / 2 + 5)}
              dy="0.35em"
              fontSize={12}
              fill="currentColor"
              textAnchor="end"
            >
              {item.value}
            </AnimatedText>
          </g>
        ))}
      </g>
    );
  }
);

export default RacingBarGroup;
