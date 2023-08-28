const noColor = "#6C6B69";
const colors = [
  "#191970",
  "#006400",
  "#ff0000",
  "#ffd700",
  "#00ff00",
  "#00ffff",
  "#ff00ff",
  "#ffb6c1",
];

const arrowLeft = "←";
const arrowRight = "→";
var cue = "";
var side = false;

function shuffleColors() {
  for (let i = colors.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    const temp = colors[i];
    colors[i] = colors[j];
    colors[j] = temp;
  }
  return colors;
}

function getSize() {
  let flag = Math.random();
  return flag <= 0.5 ? 8 : 4;
}

function decide() {
  let flag = Math.random();
  return flag <= 0.5 ? true : false;
}

function getSquaresToColorize() {
  let squares = [...Array(25).keys()];

  let squaresShuffle = squares.sort(() => 0.5 - Math.random());

  let size = getSize();

  let res = squaresShuffle.splice(0, size);

  return res;
}

export function getMemoryArray(doIt = true) {
  var colors = shuffleColors();
  var colorIx = getSquaresToColorize();
  var res = [],
    testArray = [];
  var c = 0;
  var size = colorIx.length;
  var testColors = getTestArray(colors, size);
  var leftSide = [0, 1, 5, 6, 10, 11, 15, 16, 20, 21];
  var rightSide = [3, 4, 8, 9, 13, 14, 18, 19, 23, 24];

  var leftChanged = false;
  var rightChanged = false;

  if (doIt) {
    // console.log('test colors:', testColors, 'size: ', size, 'colors: ', colors);

    for (let index = 0; index < 25; index++) {
      if (colorIx.includes(index)) {
        res.push(colors[c]);
        testArray.push(testColors[c]);
        c++;
        if (colors[c] !== testColors[c] && leftSide.includes(index)) {
          leftChanged = true;
        }
        if (colors[c] !== testColors[c] && rightSide.includes(index)) {
          rightChanged = true;
        }
      } else {
        res.push(noColor);
        testArray.push(noColor);
      }
    }

    return [res, testArray, leftChanged, rightChanged, cue, side, size];
  } else {
    for (let index = 0; index < 25; index++) {
      res.push(noColor);
      testArray.push(noColor);
    }
    return [res, testArray, false, false, cue, side, size];
  }
}

function getTestArray(colors, size) {
  var willChange = decide();
  side = decide();
  var aux2 = [];

  if (side) {
    cue = arrowRight;
  } else {
    cue = arrowLeft;
  }

  var testArray = [];

  if (willChange) {
    if (size === 8) {
      let aux = colors.slice(0, 4);
      aux2 = [colors[7], colors[6], colors[5], colors[4]];
      testArray = aux2.concat(aux);
      return testArray;
    } else {
      let aux = colors.slice(0, 2);
      aux2 = [colors[3], colors[2]];
      testArray = aux2.concat(aux);
      return testArray;
    }
  } else {
    return colors;
  }
}

export function allBlank(color) {
  var res = [
    color,
    color,
    color,
    color,
    color,
    color,
    color,
    color,
    color,
    color,
    color,
    color,
    color,
    color,
    color,
    color,
    color,
    color,
    color,
    color,
    color,
    color,
    color,
    color,
    color,
  ];
  return res;
}

export function returnSame(color) {
  return color;
}
