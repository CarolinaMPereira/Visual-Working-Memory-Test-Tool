export function createParticipant(user_id) {
  fetch("http://localhost:3001/participants", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_id }),
  })
    .then((response) => {
      return response.text();
    })
    .then((data) => {
      console.log("Created participant with user id:", user_id);
      alert("Created new participant.");
    });
}
