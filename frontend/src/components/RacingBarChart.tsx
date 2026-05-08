/** @format */

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { schemeTableau10 } from "d3-scale-chromatic";
import { scaleLinear, scaleBand, scaleOrdinal } from "@visx/scale";
import { Group } from "@visx/group";

import usePrevious from "../hooks/usePrevious";
import RacingAxisTop from "./RacingAxisTop";
import RacingBarGroup from "./RacingBarGroup";

export interface FrameDatum {
  name: string;
  value: number;
  category?: string;
}
export interface Keyframe {
  date: Date;
  data: FrameDatum[];
}

export enum EDateDisplay {
  MONTH = "month",
  YEAR = "year",
  BOTH = "both",
}

export interface RacingBarChartProps {
  keyframes: Keyframe[];
  numOfBars: number;
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  dateDisplay?: EDateDisplay;
  onStart?: () => void;
  onStop?: () => void;
}

export interface RacingBarChartHandle {
  replay: () => void;
  start: () => void;
  stop: () => void;
  playing: boolean;
}

// Map de formateadores
const dateFormatters: Record<EDateDisplay, Intl.DateTimeFormat> = {
  [EDateDisplay.MONTH]: new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }),
  [EDateDisplay.YEAR]: new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }),
  [EDateDisplay.BOTH]: new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }),
};

const RacingBarChart = forwardRef<RacingBarChartHandle, RacingBarChartProps>(
  (
    {
      keyframes,
      numOfBars,
      width,
      height,
      margin,
      dateDisplay = EDateDisplay.BOTH,
      onStart = () => {},
      onStop = () => {},
    },
    ref
  ) => {
    // Estado de la animación

    const [{ frameIdx, playing, animKey }, setAnim] = useState({
      frameIdx: 0,
      playing: false,
      animKey: 0,
    });
    const timeoutRef = useRef<number | null>(null);

    // Avanzar frames
    useEffect(() => {
      if (playing && timeoutRef.current == null) {
        timeoutRef.current = window.setTimeout(() => {
          setAnim(({ frameIdx: idx, ...rest }) => {
            const isLast = idx === keyframes.length - 1;
            return {
              ...rest,
              frameIdx: isLast ? idx : idx + 1,
              playing: playing && !isLast,
            };
          });
          timeoutRef.current = null;
        }, 250);
      }
      return () => {
        if (timeoutRef.current != null) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      };
    }, [frameIdx, playing, keyframes.length]);

    // Exponer API por ref
    useImperativeHandle(
      ref,
      () => ({
        replay: () => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          setAnim(({ animKey: k, ...rest }) => ({
            ...rest,
            frameIdx: 0,
            playing: true,
            animKey: k + 1,
          }));
        },
        start: () => setAnim((a) => ({ ...a, playing: true })),
        stop: () => setAnim((a) => ({ ...a, playing: false })),
        get playing() {
          return playing;
        },
      }),
      [playing]
    );

    // Llamar onStart/onStop al cambiar playing
    const prevPlaying = usePrevious(playing);
    useEffect(() => {
      if (prevPlaying !== undefined && prevPlaying !== playing) {
        playing ? onStart() : onStop();
      }
    }, [playing, prevPlaying, onStart, onStop]);

    // Preparar datos y escalas
    const frame = keyframes[frameIdx];
    const values = frame.data.map((d) => d.value);
    const xMax = width - margin.left - margin.right;
    const yMax = height - margin.top - margin.bottom;
    const domainMax = Math.max(...values, 0);

    const xScale = useMemo(
      () =>
        scaleLinear({
          domain: [0, domainMax],
          range: [0, xMax],
        }),
      [domainMax, xMax]
    );

    const yScale = useMemo(
      () =>
        scaleBand<string>({
          domain: frame.data.slice(0, numOfBars).map((d) => d.name),
          range: [0, yMax],
          padding: 0.1,
        }),
      [frame.data, numOfBars, yMax]
    );

    const colorScale = useMemo(() => {
      const names = keyframes[0]?.data.map((d) => d.name) || [];
      const s = scaleOrdinal<string, string>({
        range: [...schemeTableau10],
      }).domain(names);
      return (name: string) => s(name);
    }, [keyframes]);

    // Renderizar SVG
    return (
      <svg width={width} height={height}>
        <Group top={margin.top} left={margin.left} key={animKey}>
          <RacingBarGroup
            frameData={frame.data.slice(0, numOfBars)}
            xScale={xScale}
            yScale={yScale}
            colorScale={colorScale}
          />

          {/* Etiqueta de fecha */}
          <text
            x={xMax}
            y={yMax}
            textAnchor="end"
            className="text-gray-800 dark:text-neutral-200"
            style={{ fontSize: "1.25em" }}
            fill="currentColor"
          >
            {dateFormatters[dateDisplay].format(frame.date)}
          </text>

          {/* Línea vertical de base */}
          <line
            x1={0}
            y1={0}
            x2={0}
            y2={yMax}
            stroke="currentColor"
            opacity={0.5}
          />

          {/* Eje superior animado */}
          <RacingAxisTop domainMax={domainMax} xMax={xMax} />
        </Group>
      </svg>
    );
  }
);

export default RacingBarChart;
