import React, { Component } from "react";
import { withRouter } from "react-router-dom";

import { hampers } from "../data/hampers";
import { robots } from "../data/robots";
import { restaurant } from "../data/restaurant";
import { solarPanel } from "../data/solarPanel";
import { stock } from "../data/stock";

import { Button } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import BootstrapTable from "@musicstory/react-bootstrap-table-next";
import SubmitOptionButton from "../components/SubmitOptionButton";

import { updateParticipantTable } from "../updateParticipant";

class Table extends Component {
  componentDidMount() {
    this.begin = new Date().getTime();
  }

  /** {String} Presentation Delay condition (known, unknown, onset, control). */
  presentationDelay = this.getPresentationDelay();

  /** Randomize and create scenarios. */
  scenario = localStorage.getItem("scenarios").split(",")[0];
  scenarioName = this.scenario;

  labels;
  optionLabel;

  /** Text for dialogue. */
  errorMessage;
  errorButton;

  /** {Map} Number of clicks and hovers for each option */
  clicks = { delta: 0, zeta: 0, eta: 0, iota: 0, rho: 0, tau: 0, chi: 0 };
  hovers = { delta: 0, zeta: 0, eta: 0, iota: 0, rho: 0, tau: 0, chi: 0 };

  /** {Array} History of interactions */
  interactions = [];

  /** Info about current highlighted data. */
  phantom = "";
  phantomRow = -1;
  phantomClicked = false;

  /** Timestamps to compute duration of hover events. */
  start = 0;
  end = 0;
  time = 0;

  /** Timestamps for interaction duration */
  begin = 0;
  finish = 0;
  duration = 0;

  /** Style variables. */
  colorHighlight = "#31a1ed";
  colorPhantom = "#858585";
  colorPhantomHighlighted = "#6e6e6e";
  fillOpacity = "40";

  /** Problem prompt text */
  problem = "";

  /** {Array} Plot to be redirected to next */
  plots = localStorage.getItem("plots").split(",");

  /** States saving flag for open dialog and changes in Phantom. */
  // state = { optionSelected: "", open: false };

  /**
   * Gets the Presentation Delay Condition from localstorage.
   * The condition is set when the app is first loaded.
   */
  getPresentationDelay() {
    const component = this;
    component.state = {
      phantomFlag: false,
      open: false,
      locale: localStorage.getItem("locale"),
      optionSelected: "",
      optionSelectedType: "",
    };

    // component.setState({ locale: localStorage.getItem("locale") });
    return localStorage.getItem("presentationDelay");
  }

  /** Gets correct dataset according to the scenario.
   * Sets problem text and calls Presentation Delay Handler
   */
  getData() {
    switch (this.scenario) {
      case "hampers":
        this.scenario = hampers;
        break;
      case "robots":
        this.scenario = robots;
        break;
      case "restaurant":
        this.scenario = restaurant;
        break;
      case "solarPanel":
        this.scenario = solarPanel;
        break;
      case "stock":
        this.scenario = stock;
        break;
      default:
        break;
    }

    if (this.state.locale === "pt") {
      this.problem = this.scenario.problemPT;
      this.labels = this.scenario.labelsPT;
      this.optionLabel = "Opção";
      this.errorMessage =
        "A opção que escolheu está indisponível. Se escolheu uma opção que não estava a cinzento e mesmo assim está a ver esta mensagem, então é bug. Tente carregar noutras e voltar a clicar nesta. Estamos a tentar corrigir o problema.";
      this.errorButton = "Escolher outra opção";
    } else {
      this.problem = this.scenario.problemEN;
      this.labels = this.scenario.labelsEN;
      this.optionLabel = "Option";
      this.errorMessage = "The option you chose is unavailable";
      this.errorButton = "Choose other option";
    }

    this.handlePresentationDelay(this.scenario.data);
    return this.scenario;
  }

  /** Turns unavailable option into a Phantom at the desired moment. */
  handlePresentationDelay(data) {
    const component = this;
    var delayTime = 0;

    console.log("Table Presentation Delay:", component.presentationDelay);
    if (component.presentationDelay === "known") {
      // Known: after 3 seconds.
      const interval = setInterval(() => {
        delayTime++;
        if (delayTime > 2) {
          component.phantom = data.filter(function (d) {
            if (d.type === "phantom") {
              component.phantomRow = component.getRowPhantom(d.label);
              return d;
            }
          });
        }
        // Update state so the component rerenders.
        component.setState({ phantomFlag: true });
        return () => clearInterval(interval);
      }, 1000);
    } else if (component.presentationDelay === "unknown") {
      // Unknown: will be handled on the OnClick event.
    } else if (component.presentationDelay === "control") {
      // Control: no Phantom Effect
      component.phantom = "";
    } else {
      // Onset: shows immediately.
      component.phantom = data.filter(function (d) {
        if (d.type === "phantom") {
          component.phantomRow = component.getRowPhantom(d.label);
          return d;
        }
      });
      // console.log("phantom", component.phantom);
    }
  }

  /** Define data and labels. */
  data = this.getData().data;

  /** Define column data and style for each column. */
  columns = [
    {
      dataField: "label",
      text: this.optionLabel,
      headerStyle: {
        textAlign: "center",
      },
    },
    {
      dataField: "x",
      text: this.labels[0],
      headerStyle: {
        textAlign: "center",
      },
      style: {
        textAlign: "end",
      },
    },
    {
      dataField: "y",
      text: this.labels[1],
      headerStyle: {
        textAlign: "center",
      },
      style: {
        textAlign: "end",
      },
    },
  ];

  /** Define color encoding for rows. */
  rowStyle = (row, rowIndex) => {
    const component = this;
    const style = {};
    if (component.phantom !== "" && row.type === "phantom") {
      style.backgroundColor = component.colorPhantom + component.fillOpacity;
    } else {
      style.backgroundColor = "#FFFFFF";
    }
    return style;
  };

  /** Define color encoding for selected row. */
  rowSelectedStyle = (row, rowIndex) => {
    const component = this;
    const style = {};
    if (component.phantom !== "" && row.type === "phantom") {
      style.backgroundColor = component.colorPhantomHighlighted + "70";
    } else if (component.phantom === "" && row.type === "phantom") {
      style.backgroundColor = component.colorHighlight + component.fillOpacity;
    } else {
      style.backgroundColor = component.colorHighlight + component.fillOpacity;
    }
    return style;
  };

  /** Handle click and hover events. */
  rowEvents = {
    onClick: (e, row, rowIndex) => {
      const component = this;
      if (
        component.presentationDelay === "unknown" &&
        component.phantom === "" &&
        row.type === "phantom"
      ) {
        component.phantom = row;
        component.phantomRow = component.getRowPhantom(row.label);
        // Update state so the component rerenders.
        component.setState({ phantomFlag: true });
      }

      if (row.type === "phantom" && component.presentationDelay !== "control") {
        component.phantom = row;
        component.phantomClicked = true;
        console.log("cannot select phantom");
        component.state.optionSelected = "";
        component.state.optionSelectedType = "";
      }

      if (row.type !== "phantom") {
        component.state.optionSelected = row.label;
        component.state.optionSelectedType = row.type;
      } else if (
        row.type === "phantom" &&
        component.presentationDelay === "control"
      ) {
        component.state.optionSelected = row.label;
        component.state.optionSelectedType = row.type;
      }

      component.clicks[row.label]++;
      component.addInteraction(row.label, "_click");

      console.log(`clicked on row with index:`, component.state.optionSelected);
    },

    onMouseLeave: (e, row, rowIndex) => {
      const component = this;

      component.end = new Date().getTime();
      component.time = component.end - component.start;
      let option = row.label;

      // Updates number of hovers per option if hover is long enough
      if (component.time > 400) {
        component.hovers[option]++;
        component.addInteraction(option, "_hover");
      }
      component.time = 0;
      // console.log(`leave on row with index: ${rowIndex}`);
    },

    onMouseEnter: (e, row, rowIndex) => {
      const component = this;

      component.start = new Date().getTime();
      // console.log(`enter on row with index: ${rowIndex}`);
    },
  };

  /** Define single select and button for selecting. */
  selectRow = {
    mode: "radio",
    clickToSelect: true,
    style: this.rowSelectedStyle,
    nonSelectable: [this.phantomRow],
  };

  getRowPhantom(label) {
    // console.log("hey", label);
    if (label === "delta") return 1;
    if (label === "zeta") return 2;
    if (label === "eta") return 3;
    if (label === "iota") return 4;
    if (label === "rho") return 5;
    if (label === "tau") return 6;
    if (label === "chi") return 7;
  }

  /** Handle opening of Dialogue when submitting unavailable option. */
  handleClickOpen = () => {
    this.setState({ open: true });
  };

  /** Handle closing of Dialogue when submitting unavailable option. */
  handleClose = () => {
    this.setState({ open: false });
  };

  /** Add interaction to history */
  addInteraction(option, interaction) {
    const component = this;
    var newInteraction = option.concat(interaction);
    component.interactions.push(newInteraction);

    // console.log("interactions", component.interactions.toString());
  }

  /** Updates DB entry of the participant with the results from this table */
  async update() {
    const component = this;
    component.finish = new Date().getTime();
    component.duration = (component.finish - component.begin) / 1000;
    let uid = localStorage.getItem("uid");
    // Doesn't allow the participant to submit an unavailable option
    if (component.state.optionSelected === "") {
      console.log("Cannot submit phantom", component.state.optionSelected);
      component.handleClickOpen();
    } else {
      console.log(
        "Adding following to the DB:",
        component.scenarioName,
        "selected",
        component.state.optionSelected,
        "type",
        component.state.optionSelectedType,
        "clicks",
        component.clicks,
        "hovers",
        component.hovers,
        "duration",
        component.duration,
        "interactions",
        component.interactions.toString()
      );

      updateParticipantTable(
        component.scenarioName,
        component.state.optionSelected,
        component.state.optionSelectedType,
        component.clicks,
        component.hovers,
        component.duration,
        component.interactions.toString(),
        uid
      );

      // Submission and route to the next step
      let currentIx = component.plots.indexOf("/table/");
      if (currentIx != component.plots.length - 1) {
        let next = component.plots[currentIx + 1];
        component.props.history.replace(next);
      } else {
        component.props.history.replace("/familiarity/");
      }
    }
  }

  render() {
    return (
      <div>
        <div style={{ width: "50%", margin: "auto" }}>
          <p className="problemText" width="400px">
            {this.problem}
          </p>
          <BootstrapTable
            keyField="label"
            data={this.data}
            columns={this.columns}
            rowEvents={this.rowEvents}
            selectRow={this.selectRow}
            rowStyle={this.rowStyle}
            hover
          />
        </div>
        <SubmitOptionButton
          onClick={() => {
            this.update();
          }}
        ></SubmitOptionButton>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{this.errorMessage}</DialogTitle>
          <DialogActions>
            <Button
              onClick={this.handleClose}
              autoFocus
              style={{
                boxShadow: "0px 1px 2px rgb(0 0 0 / 15%)",
                backgroundColor: "#F8F8F8",
                borderBlockColor: "rgba(0, 0, 0, 0)",
                borderLeftColor: "rgba(0, 0, 0, 0)",
                borderRightColor: "rgba(0, 0, 0, 0)",
                color: "#31a1ed",
                textTransform: "none",
                fontFamily: "Open Sans",
              }}
            >
              {this.errorButton}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}
export default withRouter(Table);
