export const login = async (): Promise<string> => {
  const body = {
    email: "email@domain.com",
    password: "12345678aA",
  };

  const response = await fetch("http://localhost:3000/api/auth/login", {
    body: JSON.stringify(body),
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  const json = await response.json();
  return json.token;
};
