import { React } from "react";

export function IntroPage() {
  return (
    <div>
      <div
        style={{
          width: "800px",
          margin: "auto",
          fontFamily: "Calibri",
          textAlign: "justify",
        }}
      >
        <h3 className="header"> Visual Working Memory Test Tool</h3>
        <p className="text">
          {" "}
          Visual Working Memory (VWM) is the short-term memory associated with
          cognitive tasks, namely the retention of visual information between
          eye fixations.
        </p>
        <p className="text">
          The Visual Working Memory Test Tool is a ReactJS App that measures VWM
          through an Image Change Detection task adapted from Fukuda and Vogel's
          study.
        </p>
        <p className="text">
          Click on Settings to adjust the number of trials and the input keys.
        </p>
        <p className="text">
          Click on Test Instructions to watch a tutorial of the change detection
          test.
        </p>
      </div>
    </div>
  );
}
