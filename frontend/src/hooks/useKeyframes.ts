// src/hooks/useKeyframes.ts
import { useState, useEffect } from "react";
import { descending } from "d3-array";

export interface BarRaceData {
  date: string;      // e.g. "2021"
  name: string;      // product name
  value: number;     // sales value
  category?: string; // optional
}

export interface Keyframe {
  date: Date;
  data: Array<{
    name: string;
    value: number;
    category?: string;
  }>;
}

/** Construye un map de búsqueda { date → { name → BarRaceData } } */
function buildFindData(data: BarRaceData[]) {
  const map = new Map<string, Record<string, BarRaceData>>();
  data.forEach((d) => {
    if (!map.has(d.date)) map.set(d.date, {});
    map.get(d.date)![d.name] = d;
  });
  return (date: string, name: string): BarRaceData | null => {
    return map.get(date)?.[name] ?? null;
  };
}

/** Genera los keyframes interpolando en `numOfSlice` pasos entre cada par de fechas. */
function makeKeyframes(data: BarRaceData[], numOfSlice: number): Keyframe[] {
  const findData = buildFindData(data);
  const names = Array.from(new Set(data.map((d) => d.name)));
  const dates = Array.from(new Set(data.map((d) => d.date))).sort();

  const frames = dates.map((date) => ({
    date,
    rows: names.map((name) => {
      const dp = findData(date, name);
      return { name, value: dp?.value ?? 0, category: dp?.category };
    }),
  }));

  const keyframes: Keyframe[] = [];
  for (let i = 0; i < frames.length; i++) {
    const curr = frames[i];
    // siempre añado el frame exacto de la fecha
    keyframes.push({
      date: new Date(curr.date),
      data: curr.rows.slice().sort((a, b) => descending(a.value, b.value)),
    });

    const next = frames[i + 1];
    if (!next) continue;
    const t0 = +new Date(curr.date);
    const t1 = +new Date(next.date);
    const dt = t1 - t0;

    for (let s = 1; s < numOfSlice; s++) {
      const tt = s / numOfSlice;
      const interpDate = new Date(t0 + dt * tt);
      const rows = names.map((name) => {
        const d0 = findData(curr.date, name)?.value ?? 0;
        const d1 = findData(next.date, name)?.value ?? 0;
        return {
          name,
          value: d0 + (d1 - d0) * tt,
          category: findData(curr.date, name)?.category ?? findData(next.date, name)?.category,
        };
      });
      keyframes.push({
        date: interpDate,
        data: rows.sort((a, b) => descending(a.value, b.value)),
      });
    }
  }

  return keyframes;
}

/**
 * Hook: recibe ya los datos y devuelve los keyframes listos.
 */
export function useKeyframes(
  data: BarRaceData[],
  numOfSlice: number = 10
): Keyframe[] {
  const [keyframes, setKeyframes] = useState<Keyframe[]>([]);

  useEffect(() => {
    setKeyframes(makeKeyframes(data, numOfSlice));
  }, [data, numOfSlice]);

  return keyframes;
}
