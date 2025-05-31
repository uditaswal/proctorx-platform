export const executeCode = async (
  token: string,
  source_code: string,
  language_id: number,
  stdin = ''
) => {
  const res = await fetch('/api/execute', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ source_code, language_id, stdin }),
  });

  if (!res.ok) {
    throw new Error((await res.json()).error || 'Execution failed');
  }

  return res.json();
};
