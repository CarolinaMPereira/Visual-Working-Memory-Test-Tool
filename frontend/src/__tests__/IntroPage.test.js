import React from "react";
import { render, screen } from "@testing-library/react";
import { IntroPage } from "../pages/IntroPage";

test("IntroPage shows header and instructions", () => {
  render(<IntroPage />);
  expect(
    screen.getByText(/Visual Working Memory Test Tool/i),
  ).toBeInTheDocument();
  expect(
    screen.getByText(/Click on Settings to adjust the number of trials/i),
  ).toBeInTheDocument();
});
