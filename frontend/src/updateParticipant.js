export function updateParticipantVWM(
  vwm_score,
  size4_score,
  size8_score,
  duration,
  user_id
) {
  fetch("http://localhost:3001/VWM/vwm_score", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      vwm_score,
      size4_score,
      size8_score,
      duration,
      user_id,
    }),
  })
    .then((response) => {
      return response.text();
    })
    .then((data) => {
      // alert(data);
    });
}
