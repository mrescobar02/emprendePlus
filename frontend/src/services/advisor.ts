const API_URL = import.meta.env.VITE_API_URL;

export async function askAdvisor(input: {
  message: string;
  history: { role: "user" | "assistant"; content: string }[];
}, token: string): Promise<string> {
  const res = await fetch(`${API_URL}/api/advisor`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  return data.reply;
}