import React from "react";
import { useEffect, useState } from "react";
import useEventListener from "@use-it/event-listener";
import { useHistory } from "react-router-dom";

import { styled } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import { borders } from "@mui/system";
import { shadows } from "@mui/system";
import { flexbox } from "@mui/system";

import { updateParticipantVWM } from "../updateParticipant";
import { getMemoryArray, allBlank } from "../VMWColor";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#6C6B69" : "#6C6B69",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
  borderRadius: 0,
  borders: 0,
  shadows: ["none"],
  spacing: [110, 0, 0, 0],
}));

/** Correct answers */
var answers = [];

/** Answers given by the participant */
var result = [];

/** Final VWM score (number of correct answers) */
var score = 0;

/** Current trial */
var trial = 0;

/** Flags for sequence of images */
var cueFlag = false,
  memFlag = false,
  retFlag = false,
  testFlag = false,
  keyPressedFlag = false,
  alreadyHasColor = false,
  end = true;

/** Memory array of colors and current cue and side to focus on */
var [colors, test, left, right, symbol, side] = getMemoryArray();

/** Arrow pointing left or right */
var cue;

/** Timestamps for test duration */
var begin = 0;
var finish = 0;
var duration = 0;

/** Change this if you wish to use other keys */
var KEYS = [
  String(localStorage.getItem("sameKey")),
  String(localStorage.getItem("diffKey")),
];

export function VisualWorkingMemoryTestPage() {
  /** State */
  let [color, setColor] = useState(colors);
  let [colorTest, setColorTest] = useState(colors);
  let [count, setCount] = useState(1);

  useEffect(() => {
    begin = new Date().getTime();
  });

  var differentText =
    localStorage.getItem("diffKey").toUpperCase() + ": Different colors";
  var sameText =
    localStorage.getItem("sameKey").toUpperCase() + ": Same colors";

  function setFlags() {
    if (count > 0 && count <= 4) {
      testFlag = false;
      retFlag = false;
      memFlag = false;
      cueFlag = true;
      // console.log('cue');
    } else if (4 < count && count <= 7) {
      memFlag = true;
      cueFlag = false;
      testFlag = false;
      retFlag = false;
      // console.log('mem');
    } else if (count > 7 && count <= 25) {
      retFlag = true;
      memFlag = false;
      cueFlag = false;
      testFlag = false;
      // console.log('ret');
    } else if (count > 25 && !keyPressedFlag) {
      testFlag = true;
      retFlag = false;
      memFlag = false;
      cueFlag = false;
      // console.log('test');
    }
  }

  /** Key Up event */
  function handlerUp({ key }) {
    if (KEYS.includes(String(key))) {
      /* Change this if you wish to use other keys*/
      if (String(key) === KEYS[1]) {
        result.push(true);
      }
      if (String(key) === KEYS[0]) {
        result.push(false);
      }

      keyPressedFlag = false;
      trial++;
      alreadyHasColor = false;
      cueFlag = true;
      memFlag = false;
      retFlag = false;
      testFlag = false;
    }
  }

  /** Key Down event */
  function handlerDown({ key }) {
    if (KEYS.includes(String(key))) {
      keyPressedFlag = true;
    }
  }

  async function onComplete() {
    let uid = localStorage.getItem("uid");
    finish = new Date().getTime();
    duration = (finish - begin) / 1000;
    updateParticipantVWM(score, duration, uid);
    console.log("VWM Score:", score, duration);
  }

  useEventListener("keyup", handlerUp);
  useEventListener("keydown", handlerDown);

  // Number of repetitions of the exercise
  let nTrials = localStorage.getItem("nTestTrials");

  // Image sequence loop, n trials
  useEffect(() => {
    let cancel = false;
    const interval = setInterval(() => {
      if (cancel) return;
      if (trial < nTrials) {
        setFlags();
        if (cueFlag) {
          cue = symbol;
          const newColor = allBlank("#6C6B69");
          setColor(newColor);
        } else {
          cue = " ";
        }

        if (memFlag) {
          var newColor = color;
          if (!alreadyHasColor) {
            newColor = getMemoryArray();
            setColor(newColor[0]);
            symbol = newColor[4];
            side = newColor[5];
            localStorage.setItem("color", newColor[0]);
            alreadyHasColor = true;
            const newColorTest = newColor[1];
            setColorTest(newColorTest);
            if (side) {
              answers.push(newColor[3]);
            } else {
              answers.push(newColor[2]);
            }
          } else {
            var newColor = localStorage.getItem("color").split(",");
            setColor(newColor);
          }
        }

        if (retFlag) {
          const newColor = allBlank("#6C6B69");
          setColor(newColor);
        }

        if (testFlag) {
          const newColorTest = colorTest;
          setColor(newColorTest);
        }

        setCount(count + 1);
        if (keyPressedFlag) {
          setCount(0);
        }
      } else {
        // Test ended, create blank screen
        setColor(allBlank("#ffffff"));

        // Compute score
        for (let i = 0; i < answers.length; i++) {
          if (answers[i] === result[i] && end) {
            score++;
          }
        }
        if (end) onComplete();
        end = false;
      }
    }, 50);
    return () => {
      clearInterval(interval);
      cancel = true;
    };
  }, [count]);

  return (
    <div>
      <Box
        sx={{
          mx: "auto",
          paddingTop: 12,
          display: "flex",
          width: "100%",
          direction: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <p className="keysText">{differentText}</p>
        <Grid
          container
          rowSpacing={0}
          columnSpacing={0}
          columns={5}
          height={"400px"}
          width={"400px"}
          alignItems="center"
          justifyContent="center"
        >
          <Grid item xs={1}>
            <Item
              style={{
                backgroundColor: color[0],
                height: "80px",
                boxShadow: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            ></Item>
          </Grid>
          <Grid item xs={1}>
            <Item
              style={{
                backgroundColor: color[1],
                height: "80px",
                boxShadow: "none",
              }}
            ></Item>
          </Grid>
          <Grid item xs={1}>
            <Item
              style={{
                backgroundColor: color[2],
                height: "80px",
                boxShadow: "none",
              }}
            ></Item>
          </Grid>
          <Grid item xs={1}>
            <Item
              style={{
                backgroundColor: color[3],
                height: "80px",
                boxShadow: "none",
              }}
            ></Item>
          </Grid>
          <Grid item xs={1}>
            <Item
              style={{
                backgroundColor: color[4],
                height: "80px",
                boxShadow: "none",
              }}
            ></Item>
          </Grid>
          <Grid item xs={1}>
            <Item
              style={{
                backgroundColor: color[5],
                height: "80px",
                boxShadow: "none",
              }}
            ></Item>
          </Grid>
          <Grid item xs={1}>
            <Item
              style={{
                backgroundColor: color[6],
                height: "80px",
                boxShadow: "none",
              }}
            ></Item>
          </Grid>
          <Grid item xs={1}>
            <Item
              style={{
                color: "#ffffff",
                backgroundColor: color[7],
                height: "80px",
                boxShadow: "none",
                lineHeight: 3,
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
              }}
            >
              {cue}
            </Item>
          </Grid>
          <Grid item xs={1}>
            <Item
              style={{
                backgroundColor: color[8],
                height: "80px",
                boxShadow: "none",
              }}
            ></Item>
          </Grid>
          <Grid item xs={1}>
            <Item
              style={{
                backgroundColor: color[9],
                height: "80px",
                boxShadow: "none",
              }}
            ></Item>
          </Grid>
          <Grid item xs={1}>
            <Item
              style={{
                backgroundColor: color[10],
                height: "80px",
                boxShadow: "none",
              }}
            ></Item>
          </Grid>
          <Grid item xs={1}>
            <Item
              style={{
                backgroundColor: color[11],
                height: "80px",
                boxShadow: "none",
              }}
            ></Item>
          </Grid>
          <Grid item xs={1}>
            <Item
              style={{
                color: "#ffffff",
                backgroundColor: color[12],
                height: "80px",
                boxShadow: "none",
                lineHeight: 3,
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
              }}
            >
              +
            </Item>
          </Grid>
          <Grid item xs={1}>
            <Item
              style={{
                backgroundColor: color[13],
                height: "80px",
                boxShadow: "none",
              }}
            ></Item>
          </Grid>
          <Grid item xs={1}>
            <Item
              style={{
                backgroundColor: color[14],
                height: "80px",
                boxShadow: "none",
              }}
            ></Item>
          </Grid>
          <Grid item xs={1}>
            <Item
              style={{
                backgroundColor: color[15],
                height: "80px",
                boxShadow: "none",
              }}
            ></Item>
          </Grid>
          <Grid item xs={1}>
            <Item
              style={{
                backgroundColor: color[16],
                height: "80px",
                boxShadow: "none",
              }}
            ></Item>
          </Grid>
          <Grid item xs={1}>
            <Item
              style={{
                backgroundColor: color[17],
                height: "80px",
                boxShadow: "none",
              }}
            ></Item>
          </Grid>
          <Grid item xs={1}>
            <Item
              style={{
                backgroundColor: color[18],
                height: "80px",
                boxShadow: "none",
              }}
            ></Item>
          </Grid>
          <Grid item xs={1}>
            <Item
              style={{
                backgroundColor: color[19],
                height: "80px",
                boxShadow: "none",
              }}
            ></Item>
          </Grid>
          <Grid item xs={1}>
            <Item
              style={{
                backgroundColor: color[20],
                height: "80px",
                boxShadow: "none",
              }}
            ></Item>
          </Grid>
          <Grid item xs={1}>
            <Item
              style={{
                backgroundColor: color[21],
                height: "80px",
                boxShadow: "none",
              }}
            ></Item>
          </Grid>
          <Grid item xs={1}>
            <Item
              style={{
                backgroundColor: color[22],
                height: "80px",
                boxShadow: "none",
              }}
            ></Item>
          </Grid>
          <Grid item xs={1}>
            <Item
              style={{
                backgroundColor: color[23],
                height: "80px",
                boxShadow: "none",
              }}
            ></Item>
          </Grid>
          <Grid item xs={1}>
            <Item
              style={{
                backgroundColor: color[24],
                height: "80px",
                boxShadow: "none",
              }}
            ></Item>
          </Grid>
        </Grid>
        <p className="keysText">{sameText}</p>
      </Box>
    </div>
  );
}
