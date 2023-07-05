export function updateParticipantVWM(vwm_score, user_id) {
  fetch("http://localhost:3001/participants/vwm", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ vwm_score, user_id }),
  })
    .then((response) => {
      return response.text();
    })
    .then((data) => {
      // alert(data);
    });
}
