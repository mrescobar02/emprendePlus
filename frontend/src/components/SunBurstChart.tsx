/** @format */

import ResponsiveChartWrapper from "./ResponsiveChartWrapper";
import SunburstBase, { DataNode } from "./SunburstBase";
type SunburstChartsProps = {
  data: DataNode;
};

const SunburstChart = ({ data }: SunburstChartsProps) => {
  return (
    <div className="w-full aspect-square">
      <ResponsiveChartWrapper>
        {(width: number) => <SunburstBase data={data} width={width} />}
      </ResponsiveChartWrapper>
    </div>
  );
};

export default SunburstChart;
