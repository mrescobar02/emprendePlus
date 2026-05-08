export async function generateDummyData(
  token: string,
  params?: {
    products?: number;
    sales?: number;
    finances?: number;
    budgets?: number;
  }
) {
  const query = params
    ? "?" + new URLSearchParams(
        Object.entries(params).reduce((acc, [key, val]) => {
          if (val !== undefined) acc[key] = val.toString();
          return acc;
        }, {} as Record<string, string>)
      )
    : "";

  const res = await fetch(`/api/generate-dummy-data/${query}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Error generando datos dummy");
  }

  return res.json();
}
