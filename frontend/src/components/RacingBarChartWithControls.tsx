/** @format */

// src/components/RacingBarChartWithControls.tsx
import React, { useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import ChartToolsButtons from "./ChartToolsButtons";
import ResponsiveChartWrapper from "./ResponsiveChartWrapper";
import RacingBarChart, { RacingBarChartHandle } from "./RacingBarChart";
import { Keyframe } from "../hooks/useKeyframes";

interface Props {
  keyframes: Keyframe[];
  numOfBars: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
}

const RacingBarChartWithControls: React.FC<Props> = ({
  keyframes,
  numOfBars,
  height = 500,
  margin = { top: 32, right: 6, bottom: 6, left: 6 },
}) => {
  const chartRef = useRef<RacingBarChartHandle>(null);
  const [playing, setPlaying] = useState(false);

  const buttons = [
    {
      icon: <RotateCcw />,
      onClick: () => chartRef.current?.replay(),
      tooltip: "Reiniciar",
    },
    {
      icon: playing ? <Pause /> : <Play />,
      onClick: () =>
        playing ? chartRef.current?.stop() : chartRef.current?.start(),
      tooltip: playing ? "Pausar" : "Reproducir",
    },
  ];

  return (
    <div className="dark:text-gray-200">
      <ChartToolsButtons buttons={buttons} />
      <ResponsiveChartWrapper className={`h-[${height}px]`}>
        {(width) =>
          keyframes.length > 0 && (
            <RacingBarChart
              ref={chartRef}
              keyframes={keyframes}
              numOfBars={numOfBars}
              width={width}
              height={height}
              margin={margin}
              onStart={() => setPlaying(true)}
              onStop={() => setPlaying(false)}
            />
          )
        }
      </ResponsiveChartWrapper>
    </div>
  );
};

export default RacingBarChartWithControls;
