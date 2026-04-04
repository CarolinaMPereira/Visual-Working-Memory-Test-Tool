import { React } from "react";
import { Button } from "@mui/material";
import { useHistory } from "react-router-dom";

export function VisualWorkingMemoryInstructionsPage() {
  const history = useHistory();

  var instructionsTitle = "Please pay attention to the instructions below:";
  var middleText = "The middle column of squares does not count. ";
  var trainText =
    "Due to the high speed of the image sequence, we recommend to perform a training set before the actual test.";
  var trainClick =
    'Click "Train" to start a set of training trials before starting. The training will begin immediately.';
  var startText =
    'If you have already trained, click "Start" to be evaluated. The test will begin immediately.';
  var repText = "There will be 400 repetitions of this exercise.";
  var trainBtn = "Train";
  var startBtn = "Start";

  return (
    <div>
      <p
        style={{
          display: "flex",
          marginLeft: "auto",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: "0.8em",
        }}
        className="header"
      >
        {instructionsTitle}
      </p>
      <div
        style={{
          display: "flex",
          marginLeft: "auto",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: "0.5em",
        }}
      >
        <img
          src={require("../img/1-Cue.png")}
          alt="instructions"
          height={300}
          style={{ display: "flex", margin: "1%" }}
        />
        <img
          src={require("../img/2-Memory_Array.png")}
          alt="instructions"
          height={300}
          style={{ display: "flex", margin: "1%" }}
        />
        <img
          src={require("../img/3-Retention.png")}
          alt="instructions"
          height={300}
          style={{ display: "flex", margin: "1%" }}
        />
        <img
          src={require("../img/4-Test_Array.png")}
          alt="instructions"
          height={300}
          style={{ display: "flex", margin: "1%" }}
        />
      </div>

      <div className="instructionsText">
        <p className="text">{middleText}</p>
        <p className="text">{trainText}</p>
        <p className="text">{trainClick}</p>
        <p className="text">{startText}</p>
        <p className="text">{repText}</p>
        <div style={{ display: "inline" }}>
          <Button
            variant="outlined"
            size="large"
            onClick={() => {
              history.replace("/vwm-train/");
            }}
            className="buttonText"
          >
            {trainBtn}
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => {
              history.replace("/vwm-test/");
            }}
            className="buttonText"
            style={{ marginLeft: "1em" }}
          >
            {startBtn}
          </Button>
        </div>
      </div>
    </div>
  );
}
