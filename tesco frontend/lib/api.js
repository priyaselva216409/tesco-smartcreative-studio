export const API_URL = "http://localhost:5000";

export async function askAI(prompt) {
  const res = await fetch(`${API_URL}/api/ai/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  return res.json();
}

export async function suggestColors() {
  const res = await fetch(`${API_URL}/api/ai/suggest-colors`, {
    method: "POST",
  });

  return res.json();
}
