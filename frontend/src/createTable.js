export function createTable() {
  fetch("http://localhost:3001/table", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  })
    .then((response) => {
      return response.text();
    })
    .then((data) => {
      console.log("Created table participants.");
    });
}
