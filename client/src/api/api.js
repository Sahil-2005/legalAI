const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const analyzeLegal = async (idea) => {
  const res = await fetch(`${BASE_URL}/api/v1/analyze-legal`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ business_idea: idea }),
  });

  return res.json();
};