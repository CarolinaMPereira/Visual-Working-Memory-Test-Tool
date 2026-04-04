import React from "react";
import { render, screen } from "@testing-library/react";
import { SettingsPage } from "../pages/SettingsPage";

beforeEach(() => {
  localStorage.setItem("sameKey", "j");
  localStorage.setItem("diffKey", "f");
});

test("SettingsPage shows inputs and saved keys", () => {
  render(<SettingsPage />);
  expect(screen.getByPlaceholderText(/Press Desired Key/i)).toBeInTheDocument();
  expect(screen.getByDisplayValue("J")).toBeInTheDocument();
});
