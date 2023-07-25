import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import React, { useState } from "react";
import "./App.css";
import { IntroPage } from "./pages/IntroPage";
import { VisualWorkingMemoryTestPage } from "./pages/VisualWorkingMemoryTest";
import { VisualWorkingMemoryTrainPage } from "./pages/VisualWorkingMemoryTrain";
import { VisualWorkingMemoryInstructionsPage } from "./pages/VisualWorkingMemoryInstructions";
import { SettingsPage } from "./pages/SettingsPage";

import "bootstrap/dist/css/bootstrap.css";
import $ from "jquery";

import * as Survey from "survey-core";

import "jquery-ui/themes/base/all.css";
import "nouislider/distribute/nouislider.css";
import "select2/dist/css/select2.css";
import "bootstrap-slider/dist/css/bootstrap-slider.css";
import "jquery-bar-rating/dist/themes/css-stars.css";
import "jquery-bar-rating/dist/themes/fontawesome-stars.css";
import "pretty-checkbox/dist/pretty-checkbox.css";

import "select2/dist/js/select2.js";
import "jquery-bar-rating";

import { v4 as uuid } from "uuid";

import * as widgets from "surveyjs-widgets";
import { Button } from "@mui/material";
import { createParticipant } from "./createParticipant";
import { createTable } from "./createTable";

window["$"] = window["jQuery"] = $;
require("jquery-ui/ui/widgets/datepicker.js");

widgets.prettycheckbox(Survey);
widgets.select2(Survey, $);
widgets.inputmask(Survey);
widgets.jquerybarrating(Survey, $);
widgets.jqueryuidatepicker(Survey, $);
widgets.nouislider(Survey);
widgets.select2tagbox(Survey, $);
widgets.sortablejs(Survey);
widgets.ckeditor(Survey);
widgets.autocomplete(Survey, $);
widgets.bootstrapslider(Survey);

const user_id = uuid();
localStorage.setItem("uid", user_id);
console.log("Your UID: ", user_id);

/* populate with default values*/
localStorage.setItem("nTestTrials", 400);
localStorage.setItem("nTrainTrials", 20);
localStorage.setItem("sameKey", "j");
localStorage.setItem("diffKey", "f");

export default function PhantomEffectApp() {
  createTable().then(() => {
    createParticipant(user_id);
  });

  return (
    <Router>
      <div>
        <nav className="navbar navbar-default">
          <div className="container-fluid">
            <div className="navbar-header"></div>
            <ul className="nav navbar-nav">
              <li>
                <Link to="/introduction">Home</Link>
              </li>
              <li>
                <Link to="/vwm-instructions/">Test Instructions</Link>
              </li>
              <li>
                <Link to="/vwm-train/">Train Trials</Link>
              </li>
              <li>
                <Link to="/vwm-test/">Start Test</Link>
              </li>
              <li>
                <Link to="/settings/">Settings</Link>
              </li>
            </ul>
          </div>
        </nav>

        <div className="app-content">
          <Switch>
            <Route exact path="/">
              <IntroPage />
            </Route>
            <Route path="/introduction">
              <IntroPage />
            </Route>
            <Route path="/vwm-instructions">
              <VisualWorkingMemoryInstructionsPage />
            </Route>
            <Route path="/vwm-train">
              <VisualWorkingMemoryTrainPage />
            </Route>
            <Route path="/vwm-test">
              <VisualWorkingMemoryTestPage />
            </Route>
            <Route path="/settings">
              <SettingsPage />
            </Route>
          </Switch>
        </div>
      </div>
    </Router>
  );
}
