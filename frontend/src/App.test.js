import React from "react";
import ReactDOM from "react-dom";
import "jest-canvas-mock";

// Prevent network calls from `createTable` and `createParticipant`
jest.mock("./createTable", () => ({
  createTable: () => Promise.resolve("ok"),
}));
jest.mock("./createParticipant", () => ({
  createParticipant: () => {},
}));

jest.mock("plotly.js-dist-min", () => ({
  Map: () => ({}),
}));

import App from "./App";

it("renders without crashing", async () => {
  const div = document.createElement("div");
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});
