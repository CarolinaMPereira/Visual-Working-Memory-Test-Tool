export async function createTable() {
  const response = await fetch("http://localhost:3001/table", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });
  const res = await response.text();
  console.log("Created table vwm.");
  return res;
}
