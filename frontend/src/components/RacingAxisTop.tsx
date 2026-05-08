/** @format */

import { forwardRef } from "react";
import { scaleLinear } from "@visx/scale";
import { AxisTop as VxAxisTop } from "@visx/axis";

interface Props {
  domainMax: number;
  xMax: number;
}

const RacingAxisTop = forwardRef<any, Props>(({ domainMax, xMax }) => {
  const numTicks = xMax > 500 ? 5 : Math.floor(xMax / 100);
  const xScale = scaleLinear({
    domain: [0, domainMax],
    range: [0, xMax],
  });

  return (
    <VxAxisTop
      stroke="currentColor"
      top={0}
      left={0}
      scale={xScale}
      numTicks={numTicks}
      tickLabelProps={() => ({
        textAnchor: "middle",
        dy: "-0.25em",
        fontSize: 12,
        fill: "currentColor",
      })}
    />
  );
});

export default RacingAxisTop;
