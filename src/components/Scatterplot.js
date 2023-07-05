import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import * as d3 from "d3";

import { hampers } from "../data/hampers";
import { robots } from "../data/robots";
import { restaurant } from "../data/restaurant";
import { solarPanel } from "../data/solarPanel";
import { stock } from "../data/stock";

import SubmitOptionButton from "../components/SubmitOptionButton";
import { Button } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";

import { updateParticipantScatterplot } from "../updateParticipant";

class Scatterplot extends Component {
  /** Draws chart once the component is mounted (in the beginning). */
  componentDidMount() {
    this.begin = new Date().getTime();
    this.drawChart();
  }

  /** Info about current highlighted data. */
  selectedDots = "";
  selectedType = "";
  hoveredDots = "";
  phantom = "";

  /** Flag indicating if current point is the Phantom.
   * true -> option is available.
   * false -> option is unavailable (is the Phantom).
   */
  notPhantom = false;
  phantomClicked = false;

  /** Text for dialogue. */
  errorButton;
  errorMessage;

  /** {Map} Number of clicks and hovers for each option */
  clicks = { delta: 0, zeta: 0, eta: 0, iota: 0, rho: 0, tau: 0, chi: 0 };
  hovers = { delta: 0, zeta: 0, eta: 0, iota: 0, rho: 0, tau: 0, chi: 0 };

  /** {Array} History of interactions */
  interactions = [];

  /** Timestamps to compute duration of hover events. */
  start = 0;
  end = 0;
  time = 0;

  /** Timestamps for interaction duration */
  begin = 0;
  finish = 0;
  duration = 0;

  /** Style variables. */
  colorHighlight = "#ED7D31";
  colorOriginal = "#31a1ed";
  colorPhantom = "#858585";
  colorPhantomHighlighted = "#6e6e6e";
  fillOpacity = "55%";

  /** {String} Presentation Delay condition (known, unknown, onset, control). */
  presentationDelay = this.getPresentationDelay();

  /** {String} Scenario used for this chart. */
  scenario = localStorage.getItem("scenarios").split(",")[4];

  /** {Array} Plot to be redirected to next */
  plots = localStorage.getItem("plots").split(",");

  /** States saving flag for open dialog and problem prompt text. */
  state = { open: false, problem: "", locale: localStorage.getItem("locale") };

  /**
   * Gets the Presentation Delay Condition from localstorage.
   * The condition is set when the app is first loaded.
   */
  getPresentationDelay() {
    return localStorage.getItem("presentationDelay");
  }

  /** Gets and parses dataset according to the scenario.
   * Returns [data, X and Y labels].
   */
  getData() {
    var dataset = "";
    switch (this.scenario) {
      case "hampers":
        dataset = hampers;
        break;
      case "robots":
        dataset = robots;
        break;
      case "restaurant":
        dataset = restaurant;
        break;
      case "solarPanel":
        dataset = solarPanel;
        break;
      case "stock":
        dataset = stock;
        break;
      default:
        break;
    }

    if (this.state.locale === "pt") {
      this.setState({ problem: dataset.problemPT });
      var labels = dataset.labelsPT;
      this.errorMessage =
        "A opção que escolheu está indisponível. Se escolheu uma opção que não estava a cinzento e mesmo assim está a ver esta mensagem, então é bug. Tente carregar noutras e voltar a clicar nesta. Estamos a tentar corrigir o problema.";
      this.errorButton = "Escolher outra opção";
    } else {
      this.setState({ problem: dataset.problemEN });
      var labels = dataset.labelsEN;

      this.errorMessage = "The option you chose is unavailable";
      this.errorButton = "Choose other option";
    }

    return [dataset.data, labels];
  }

  /**
   * Draws SVG scatterplot using D3 v7.
   * Based off: https://stackoverflow.com/a/64823682
   */
  drawChart() {
    var rawData = this.getData();
    var data = rawData[0];
    var labels = rawData[1];

    console.log("data", data);

    // set the dimensions of the graph

    var width = 500,
      height = 500;

    // append the svg object to the body of the page
    const chart = d3
      .select("#scatterplot")
      .attr("width", width)
      .attr("height", height)
      .append("g");

    var maxX = d3.max(data.map((d) => d.x));
    var maxY = d3.max(data.map((d) => d.y));
    var minX = d3.min(data.map((d) => d.x));
    var minY = d3.min(data.map((d) => d.y));

    // Add X axis
    const x = d3
      .scaleLinear()
      .domain([0, maxX + maxX * 0.1])
      .range([0, width]);
    chart
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x))
      .append("text")
      .style("text-anchor", "middle")
      .attr("y", 40)
      .attr("x", 520)
      .attr("class", "text-graph")
      .attr("font-size", 13)
      .text(labels[0])
      .style("fill", "black");

    // Add Y axis
    const y = d3
      .scaleLinear()
      .domain([0, maxY + maxY * 0.1])
      .range([height, 0]);

    chart
      .append("g")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("transform", `rotate(270, 0, 0)`)
      .style("text-anchor", "middle")
      .attr("y", -45)
      .attr("x", -110)
      .attr("class", "text-graph")
      .attr("font-size", 13)
      .text(labels[1])
      .style("fill", "black");

    // Add dots
    const dot = chart
      .append("g")
      .selectAll("dot")
      .data(data)
      .join("circle")
      .attr("cx", function (d) {
        return x(d.x);
      })
      .attr("cy", function (d) {
        return y(d.y);
      })
      .attr("r", 5)
      .style("fill", this.colorOriginal);

    // Add text label in circle
    for (let i = 0; i < 7; i++) {
      chart
        .data(data)
        .append("text")
        .attr("class", "text-graph")
        .attr("fontFamily", "open sans")
        .attr("font-size", "12px")
        .attr("fill", "black")
        .attr("x", x(data[i].x) + 10)
        .attr("y", y(data[i].y) - 6)
        .text(data[i].label);
    }

    // Change tick text style
    var ticks = d3.selectAll(".tick text");
    ticks.attr("class", "text-graph").attr("font-size", "14px");

    // Get all dots
    var dots = chart.selectAll("circle");

    // Call event handlers
    dots.on("click", this.handleOnClick(chart));
    dots.on("mouseover", this.handleOnMouseOver(chart));
    dots.on("mouseleave", this.handleOnMouseLeave(chart));

    // Handle Presentation Delay which will handle the Phantom presentation
    this.handlePresentationDelay(chart);
  }

  /** Handle opening of Dialogue when submitting unavailable option. */
  handleClickOpen = () => {
    this.setState({ open: true });
  };

  /** Handle closing of Dialogue when submitting unavailable option. */
  handleClose = () => {
    this.setState({ open: false });
  };

  /** Turns unavailable option into a Phantom at the desired moment. */
  handlePresentationDelay(chart) {
    var delayTime = 0;
    // let [count, setCount] = useState(0);
    console.log("presentation delay", this.presentationDelay);
    if (this.presentationDelay === "known") {
      // Known: after 3 seconds
      setInterval(() => {
        delayTime++;
        if (delayTime > 2) {
          this.phantom = this.getPhantom(chart);
        }
      }, 1000);
    } else if (this.presentationDelay === "unknown") {
      // Unknown: will be handled on the OnClick event
    } else if (this.presentationDelay === "control") {
      // Control: no Phantom Effect
      this.phantom = "";
    } else {
      // Onset: shows immediately
      this.phantom = this.getPhantom(chart);
    }
  }

  /** Finds and styles accordingly the Phantom option.
   * Returns a selection of dots.
   */
  getPhantom(chart) {
    var component = this;
    component.phantom = chart.selectAll("circle").filter(function (d) {
      if (d.type !== undefined) {
        if (d.type === "phantom") return d;
      }
    });

    component.phantom.style("fill", component.colorPhantom);
    return component.phantom;
  }

  /** Handles clicking on a group of dots. */
  handleOnClick(chart) {
    const component = this;
    return function (event, dot) {
      console.log(dot);
      // Selects a group of dots, if not already selected
      if (!d3.select(this).classed("selected")) {
        selectedGroup = chart.selectAll("circle").filter(function (d) {
          if (d.label === dot.label && d.type !== "phantom") {
            component.selectedDots = d.label;
            component.selectedType = d.type;
            return d;
          }
          if (
            d.label === dot.label &&
            d.type === "phantom" &&
            component.presentationDelay === "control"
          ) {
            component.selectedDots = d.label;
            component.selectedType = d.type;
            return d;
          }
        });
        notSelectedGroups = chart.selectAll("circle").filter(function (d) {
          if (d.label !== dot.label && d.type !== "phantom") {
            return d;
          }
          if (
            d.label !== dot.label &&
            d.type === "phantom" &&
            component.presentationDelay === "control"
          ) {
            return d;
          }
        });

        // Does not allow the Phantom to be selected
        if (
          dot.type === "phantom" &&
          component.presentationDelay !== "control"
        ) {
          component.phantom = component.getPhantom(chart);
          component.phantomClicked = true;
          console.log("cannot select phantom");
          component.selectedDots = "";
          component.selectedType = "";
        }

        // Updates number of clicks for the clicked option
        component.clicks[dot.label]++;
        component.addInteraction(dot.label, "_click");

        // Highlights the selected group
        selectedGroup.style("fill", component.colorHighlight);
        selectedGroup.classed("selected", true);

        // Resets other dots' styles, including the Phantom
        notSelectedGroups.style("fill", component.colorOriginal);
        notSelectedGroups.classed("selected", false);

        // Unselects the group, if already selected
      } else {
        var selectedGroup = chart.selectAll("circle").filter(function (d) {
          if (d.label === dot.label && d.type !== "phantom") {
            return d;
          }
          if (
            d.label === dot.label &&
            d.type === "phantom" &&
            component.presentationDelay === "control"
          ) {
            return d;
          }
        });
        var notSelectedGroups = chart.selectAll("circle").filter(function (d) {
          if (d.label !== dot.label && d.type !== "phantom") {
            return d;
          }
          if (
            d.label !== dot.label &&
            d.type === "phantom" &&
            component.presentationDelay === "control"
          ) {
            return d;
          }
        });

        // Updates number of clicks for the selected option
        component.clicks[dot.label]++;
        component.addInteraction(dot.label, "_click");

        // Highlights the selected group
        selectedGroup.style("fill", component.colorOriginal);
        selectedGroup.classed("selected", false);

        // Resets other dots' styles, including the Phantom
        notSelectedGroups.style("fill", component.colorOriginal);
        notSelectedGroups.classed("selected", false);

        // Clears selected info
        component.selectedDots = "";
        component.selectedType = "";
      }
    };
  }

  /**  Handles mouse over event. */
  handleOnMouseOver(chart) {
    const component = this;
    return function (event, dot) {
      component.start = new Date().getTime();
      var hoveredGroup = chart.selectAll("circle").filter(function (d) {
        if (d.label === dot.label) {
          component.hoveredDots = d.label;
          if (
            d.type === "phantom" &&
            component.presentationDelay !== "control"
          ) {
            component.notPhantom = false;
          } else {
            component.notPhantom = true;
          }
          return d;
        }
      });

      // Style varies if the hovered line is the Phantom or not
      if (component.notPhantom) {
        hoveredGroup.style("fill", component.colorHighlight);
      } else if (!component.notPhantom && component.phantomClicked) {
        component.phantom = component.getPhantom(chart);
      } else if (
        !component.notPhantom &&
        !component.phantomClicked &&
        component.presentationDelay === "unknown"
      ) {
        hoveredGroup.style("fill", component.colorHighlight);
      }
    };
  }

  /**  Handles mouse leave event. */
  handleOnMouseLeave(chart) {
    const component = this;
    return function (event, dot) {
      component.end = new Date().getTime();
      component.time = component.end - component.start;
      var hoveredGroup = chart.selectAll("circle").filter(function (d) {
        if (d.label === dot.label && d.label !== component.selectedDots) {
          return d;
        }
      });

      // Reset style accordingly to type of option
      if (component.notPhantom)
        hoveredGroup.style("fill", component.colorOriginal);
      else if (!component.notPhantom && !component.phantomClicked)
        hoveredGroup.style("fill", component.colorOriginal);
      else if (!component.notPhantom && component.phantomClicked)
        hoveredGroup.style("fill", component.colorPhantom);

      // Updates number of hovers per option if hover is long enough
      if (component.time > 400) {
        component.hovers[component.hoveredDots]++;
        component.addInteraction(component.hoveredDots, "_hover");
      }
      component.time = 0;
      component.hoveredDots = "";
    };
  }

  /** Add interaction to history */
  addInteraction(option, interaction) {
    const component = this;
    var newInteraction = option.concat(interaction);
    component.interactions.push(newInteraction);

    // console.log("interactions", component.interactions.toString());
  }

  /** Updates DB entry of the participant with the results from this chart */
  async update() {
    const component = this;
    component.finish = new Date().getTime();
    component.duration = (component.finish - component.begin) / 1000;
    let uid = localStorage.getItem("uid");
    // Doesn't allow the participant to submit an unavailable option
    if (
      component.selectedDots === "" &&
      component.presentationDelay !== "control"
    ) {
      console.log("Cannot submit phantom", component.selectedDots);
      component.handleClickOpen();
    } else {
      console.log(
        "Adding following to the DB:",
        component.scenario,
        "selected",
        component.selectedDots,
        "type",
        component.selectedType,
        "clicks",
        component.clicks,
        "hovers",
        component.hovers,
        "duration",
        component.duration,
        "interactions",
        component.interactions.toString()
      );

      updateParticipantScatterplot(
        component.scenario,
        component.selectedDots,
        component.selectedType,
        component.clicks,
        component.hovers,
        component.duration,
        component.interactions.toString(),
        uid
      );

      // Submission and route to the next step
      let currentIx = component.plots.indexOf("/scatterplot/");
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
      <div margin="auto">
        <p className="problemText" width="400px">
          {this.state.problem}
        </p>
        <svg className="graph" id={"scatterplot"}></svg>
        <div style={{ marginTop: "70px" }}>
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
            <DialogTitle id="alert-dialog-title">
              {this.errorMessage}
            </DialogTitle>
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
      </div>
    );
  }
}
export default withRouter(Scatterplot);
