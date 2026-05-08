/** @format */

// src/components/ProductWordCloud.tsx
import { useMemo } from "react";
import Wordcloud from "@visx/wordcloud/lib/Wordcloud";
import { scaleLog } from "@visx/scale";
import { Text } from "@visx/text";

export interface WordData {
  text: string;
  value: number;
}

interface Props {
  words: WordData[];
  width?: number;
  height?: number;
}

const colors = ["#AEC6CF", "#BBDDF2", "#D6EAF8", "#AEDFF7", "#9FC5E8"];
export default function ProductWordCloud({
  words,
  width = 500,
  height = 300,
}: Props) {
  const fontScale = useMemo(
    () =>
      scaleLog({
        domain: [
          Math.min(...words.map((w) => w.value)),
          Math.max(...words.map((w) => w.value)),
        ],
        range: [14, 48],
      }),
    [words]
  );

  const fontSizeSetter = (datum: WordData) => fontScale(datum.value);

  return (
    <div className="w-full h-[300px]">
      <Wordcloud
        words={words}
        width={width}
        height={height}
        fontSize={fontSizeSetter}
        font={"Impact"}
        padding={2}
        spiral={"archimedean"}
        rotate={0}
        random={() => 0.5}
      >
        {(cloudWords) =>
          cloudWords.map((w, i) => (
            <Text
              key={w.text}
              fill={colors[i % colors.length]}
              textAnchor="middle"
              transform={`translate(${w.x}, ${w.y}) rotate(${w.rotate})`}
              fontSize={w.size}
              fontFamily={w.font}
            >
              {w.text}
            </Text>
          ))
        }
      </Wordcloud>
    </div>
  );
}
