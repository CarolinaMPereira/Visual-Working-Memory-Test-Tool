import React, { Component } from "react";
import * as d3 from "d3";
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
import SubmitOptionButton from "../components/SubmitOptionButton";

import { updateParticipantPCP } from "../updateParticipant";

class ParallelCoordinatesPlot extends Component {
  /** Draws chart once the component is mounted (in the beginning). */
  componentDidMount() {
    this.begin = new Date().getTime();
    this.drawChart();
  }

  /** Info about current highlighted data. */
  selectedLine = "";
  hoveredLine = "";
  selectedType = "";
  phantom = "";

  /** {label, x, y, available, type} Unavailable option (Phantom) datapoint. */
  phantomData = "";

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
  fillOpacity = "40%";
  strokeWidth = 2.5;
  highlightStroke = 4;

  /** {String} Presentation Delay condition (known, unknown, onset, control). */
  presentationDelay = this.getPresentationDelay();

  /** {String} Scenario used for this chart. */
  scenario = localStorage.getItem("scenarios").split(",")[3];

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

  /** Gets correct dataset according to the scenario.
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
   * Draws SVG parallel coordinates plot (PCP) using D3 v7.
   * Based off: https://d3-graph-gallery.com/graph/parallel_basic.html
   */
  drawChart() {
    const rawData = this.getData();
    const data = rawData[0];
    const labels = rawData[1];

    var gapBetweenGroups = 10,
      spaceForLabels = 1;

    const margin = { top: 30, right: 10, bottom: 10, left: 0 },
      width = 700 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    // Append the svg object to the designated element in the page
    const svg = d3
      .select("#pcp")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Compute domain for y axes
    var minDomainX = d3.min(data.map((d) => d.x));
    var maxDomainX = d3.max(data.map((d) => d.x));
    var minDomainY = d3.min(data.map((d) => d.y));
    var maxDomainY = d3.max(data.map((d) => d.y));

    // Build a linear scale for y axis (X values)
    const y1 = d3
      .scaleLinear()
      .domain([minDomainX, maxDomainX])
      .range([height, 0]);

    // Build a linear scale for y axis (Y values)
    const y2 = d3
      .scaleLinear()
      .domain([minDomainY, maxDomainY])
      .range([height, 0]);

    // Build the X scale -> it find the best position for each Y axis
    const x = d3.scalePoint().range([0, width]).padding(1).domain(labels);

    /** Gets coordinates to build each line.
     * Takes a datapoint and returns the label (name of x or y) and it's value.
     */
    function path(d) {
      return d3.line()(
        labels.map(function (label) {
          var i = labels.indexOf(label, 0);
          if (i === 0) {
            // the label is the name of the x value
            return [x(label), y1(d.x)];
          } else {
            // the label is the name of the Y value
            return [x(label), y2(d.y)];
          }
        })
      );
    }

    // Draw the lines
    svg
      .selectAll("linePath")
      .data(data)
      .join("path")
      .attr("id", function (d, i) {
        return "linePath_" + i;
      })
      .attr("d", path)
      .style("fill", "none")
      .style("stroke", this.colorOriginal)
      .style("stroke-width", this.strokeWidth)
      .style("opacity", this.fillOpacity)
      .attr("class", "linePath");

    // Add labels on lines
    for (let i = 0; i < 7; i++) {
      svg
        .data(data)
        .append("text")
        .attr("dy", "-0.2em")
        .attr("class", "text-graph")
        .append("textPath")
        .attr("xlink:href", function (d) {
          return "#linePath_" + i;
        })
        .style("text-anchor", "middle")
        .attr("startOffset", "90%")
        .text(function (d) {
          return data[i].label;
        });
    }

    // Draw first axis
    svg
      .append("g")
      .attr("transform", "translate(" + x(labels[0]) + ")")
      .call(d3.axisLeft(y1).tickSize(10))
      .append("text")
      .style("text-anchor", "middle")
      .attr("y", -15)
      .attr("class", "text-graph")
      .attr("font-size", 14)
      .text(labels[0])
      .style("fill", "black");

    // Draw the second axis
    svg
      .append("g")
      .attr("transform", "translate(" + x(labels[1]) + ")")
      .call(d3.axisRight(y2).tickSize(15))
      .append("text")
      .style("text-anchor", "middle")
      .attr("y", -15)
      .attr("class", "text-graph")
      .attr("font-size", 14)
      .text(labels[1])
      .style("fill", "black");

    // Change tick text style
    var ticks = d3.selectAll(".tick text");
    ticks.attr("class", "text-graph").attr("font-size", 14);

    // Get all lines
    var lines = svg.selectAll(".linePath");

    // Call event handlers
    lines.on("click", this.handleOnClick(svg));
    lines.on("mouseover", this.handleOnMouseOver(svg));
    lines.on("mouseleave", this.handleOnMouseLeave(svg));

    // Handle Presentation Delay which will handle the Phantom presentation
    this.handlePresentationDelay(svg);
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
    var component = this;
    var delayTime = 0;
    console.log("PCP Presentation Delay", component.presentationDelay);
    if (component.presentationDelay === "known") {
      // Known: after 3 seconds
      setInterval(() => {
        delayTime++;
        if (delayTime > 2) {
          component.phantom = component.getPhantom(chart);
        }
      }, 1000);
    } else if (component.presentationDelay === "unknown") {
      // Unknown: will be handled on the OnClick event
    } else if (component.presentationDelay === "control") {
      // Control: no Phantom Effect
      component.phantom = "";
    } else {
      // Onset: shows immediately
      component.phantom = component.getPhantom(chart);
    }
  }

  /** Finds and styles accordingly the Phantom option.
   * Returns a selection of lines.
   */
  getPhantom(chart) {
    var component = this;
    component.phantom = chart.selectAll(".linePath").filter(function (d) {
      if (d.type === "phantom") {
        component.phantomData = d;
        return d;
      }
    });
    component.phantom
      .style("stroke", component.colorPhantom)
      .style("opacity", component.fillOpacity);
    return component.phantom;
  }

  /** Handles clicking on a line. */
  handleOnClick(chart) {
    const component = this;
    return function (event, line) {
      console.log(line);
      // Selects a line, if not already selected
      if (!d3.select(this).classed("selected")) {
        selectedLine = chart.selectAll(".linePath").filter(function (d) {
          if (d.label === line.label && d.type !== "phantom") {
            component.selectedLine = d.label;
            component.selectedType = d.type;
            return d;
          }
          if (
            d.label === line.label &&
            d.type === "phantom" &&
            component.presentationDelay === "control"
          ) {
            component.selectedLine = d.label;
            component.selectedType = d.type;
            return d;
          }
        });
        notSelectedLines = chart.selectAll(".linePath").filter(function (d) {
          if (d.label !== line.label && d.type !== "phantom") {
            return d;
          }
          if (
            d.label !== line.label &&
            d.type === "phantom" &&
            component.presentationDelay === "control"
          ) {
            return d;
          }
        });

        // Does not allow the Phantom to be selected
        if (
          line.type === "phantom" &&
          component.presentationDelay !== "control"
        ) {
          component.phantom = component.getPhantom(chart);
          component.phantomClicked = true;
          console.log("cannot select phantom");
          component.selectedLine = "";
          component.selectedType = "";
        }

        // Updates number of clicks for the clicked option
        component.clicks[line.label]++;
        component.addInteraction(line.label, "_click");

        // Highlights the selected line
        selectedLine.style("opacity", "100%");
        selectedLine.style("stroke-width", component.highlightStroke);
        selectedLine.style("stroke", component.colorHighlight);
        selectedLine.classed("selected", true);

        // Resets other lines' styles, including the Phantom
        notSelectedLines.style("opacity", component.fillOpacity);
        notSelectedLines.style("stroke-width", component.strokeWidth);
        notSelectedLines.style("stroke", component.colorOriginal);
        notSelectedLines.classed("selected", false);

        // Unselects the line, if already selected
      } else {
        var selectedLine = chart.selectAll(".linePath").filter(function (d) {
          if (d.label === line.label && d.type !== "phantom") {
            return d;
          }
          if (
            d.label === line.label &&
            d.type === "phantom" &&
            component.presentationDelay === "control"
          ) {
            return d;
          }
        });
        var notSelectedLines = chart
          .selectAll(".linePath")
          .filter(function (d) {
            if (d.label !== line.label && d.type !== "phantom") {
              return d;
            }
            if (
              d.label !== line.label &&
              d.type === "phantom" &&
              component.presentationDelay === "control"
            ) {
              return d;
            }
          });

        // Updates number of clicks for the selected option
        component.clicks[line.label]++;
        component.addInteraction(line.label, "_click");

        // Highlights the selected line
        selectedLine.style("opacity", component.fillOpacity);
        selectedLine.style("stroke-width", component.strokeWidth);
        selectedLine.style("stroke", component.colorOriginal);
        selectedLine.classed("selected", false);

        // Resets other lines' styles, including the Phantom
        notSelectedLines.style("opacity", component.fillOpacity);
        notSelectedLines.style("stroke-width", component.strokeWidth);
        notSelectedLines.style("stroke", component.colorOriginal);
        notSelectedLines.classed("selected", false);

        // Clears selected info
        component.selectedLine = "";
        component.selectedType = "";
      }
    };
  }

  /**  Handles mouse over event. */
  handleOnMouseOver(chart) {
    const component = this;
    return function (event, line) {
      component.start = new Date().getTime();
      var hoveredGroup = chart.selectAll(".linePath").filter(function (d) {
        if (d.label === line.label) {
          component.hoveredLine = d.label;
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
        hoveredGroup.style("opacity", "100%");
        hoveredGroup.style("stroke-width", component.highlightStroke);
        hoveredGroup.style("stroke", component.colorHighlight);
      } else if (!component.notPhantom && component.phantomClicked) {
        component.phantom = component.getPhantom(chart);
      } else if (
        !component.notPhantom &&
        !component.phantomClicked &&
        component.presentationDelay === "unknown"
      ) {
        hoveredGroup.style("opacity", "100%");
        hoveredGroup.style("stroke-width", component.highlightStroke);
        hoveredGroup.style("stroke", component.colorHighlight);
      }
    };
  }

  /**  Handles mouse leave event. */
  handleOnMouseLeave(chart) {
    const component = this;
    return function (event, line) {
      component.end = new Date().getTime();
      component.time = component.end - component.start;
      var hoveredGroup = chart.selectAll(".linePath").filter(function (d) {
        if (d.label === line.label && d.label !== component.selectedLine) {
          return d;
        }
      });

      // Reset style accordingly to type of option
      if (component.notPhantom) {
        hoveredGroup.style("opacity", component.fillOpacity);
        hoveredGroup.style("stroke-width", component.strokeWidth);
        hoveredGroup.style("stroke", component.colorOriginal);
      } else if (!component.notPhantom && !component.phantomClicked) {
        hoveredGroup.style("opacity", component.fillOpacity);
        hoveredGroup.style("stroke-width", component.strokeWidth);
        hoveredGroup.style("stroke", component.colorOriginal);
      } else if (!component.notPhantom && component.phantomClicked) {
        hoveredGroup.style("opacity", component.fillOpacity);
        hoveredGroup.style("stroke-width", component.strokeWidth);
      }

      // Updates number of hovers per option if hover is long enough
      if (component.time > 400) {
        component.hovers[component.hoveredLine]++;
        component.addInteraction(component.hoveredLine, "_hover");
      }
      component.time = 0;
      component.hoveredLine = "";
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
      component.selectedLine === "" &&
      component.presentationDelay !== "control"
    ) {
      console.log("Cannot submit phantom", component.selectedLine);
      component.handleClickOpen();
    } else {
      console.log(
        "Adding following to the DB:",
        component.scenario,
        "selected",
        component.selectedLine,
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

      updateParticipantPCP(
        component.scenario,
        component.selectedLine,
        component.selectedType,
        component.clicks,
        component.hovers,
        component.duration,
        component.interactions.toString(),
        uid
      );

      // Submission and route to the next step
      let currentIx = component.plots.indexOf("/parallel-coordinates-plot/");
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
      <div margin="auto" alignitems="center">
        <p className="problemText" width="400px">
          {this.state.problem}
        </p>
        <div margin="auto" className="graph" id={"pcp"} height="500px"></div>
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
export default withRouter(ParallelCoordinatesPlot);
