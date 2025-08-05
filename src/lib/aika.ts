export interface AskPayload {
  message: string;
  persona: string;
  systemPrompt: string;
  user_id: string;
  memoryContext?: string;
  stream: boolean;
}

export async function askAika(payload: AskPayload) {
  const res = await fetch("/api/aika/ask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`AIKA request failed: ${res.status}`);
  }

  return res;
}
