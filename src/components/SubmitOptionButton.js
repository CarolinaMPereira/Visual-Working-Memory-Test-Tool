import React from "react";
import { Button } from "@mui/material";

const SubmitOptionButton = ({ onClick }) => {
  var buttonText = "";
  const locale = localStorage.getItem("locale");
  if (locale == "pt") {
    buttonText = "Submeter Escolha";
  } else {
    buttonText = "Submit Choice";
  }
  return (
    <Button
      variant="outlined"
      size="large"
      style={{
        boxShadow: "0px 1px 2px rgb(0 0 0 / 15%)",
        backgroundColor: "#F8F8F8",
        borderBlockColor: "rgba(0, 0, 0, 0)",
        borderLeftColor: "rgba(0, 0, 0, 0)",
        borderRightColor: "rgba(0, 0, 0, 0)",
        color: "#31a1ed",
        fontSize: "20px",
        textTransform: "none",
        fontFamily: "Open Sans",
        margin: "auto",
        marginTop: "2em",
        display: "flex",
      }}
      onClick={onClick}
    >
      {buttonText}
    </Button>
  );
};
export default SubmitOptionButton;
