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

import { updateParticipantOSBC } from "../updateParticipant";

const LABEL = 1;
const AVAILABLE = 2;
const TYPE = 3;

class OneSidedBarChart extends Component {
  /** Draws chart once the component is mounted (in the beginning). */
  componentDidMount() {
    this.begin = new Date().getTime();
    this.drawChart();
  }

  /** Info about current highlighted data. */
  selectedBars = "";
  selectedType = "";
  hoveredBars = "";
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
  colorX = "#ED7D31";
  colorY = "#31a1ed";
  colorPhantom = "#858585";
  colorPhantomHighlighted = "#6e6e6e";
  fillOpacity = "40%";

  /** {String} Presentation Delay condition (known, unknown, onset, control). */
  presentationDelay = this.getPresentationDelay();

  /** {String} Scenario used for this chart. */
  scenario = localStorage.getItem("scenarios").split(",")[1];

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

  /** Gets and parses correct dataset according to the scenario.
   * Returns [data, X and Y labels].
   */
  getData() {
    var dataset;

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

    var zippedData = [];
    var domain = [];
    var keys = [];
    // Parse data to keep x and y values in different arrays
    // [[x, label, available, type], [y, label, available, type]]
    for (let i = 0; i < dataset.data.length; i++) {
      const element = dataset.data[i];
      zippedData.push(
        [element.x, element.label, element.available, element.type],
        [element.y, element.label, element.available, element.type]
      );
      domain.push(element.x);
      domain.push(element.y);
      keys.push(element.label);
    }

    // console.log("dataset", data);
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

    return [d3.max(domain), zippedData, keys, labels];
  }

  /**
   * Draws SVG one sided barchart (OSBC) using D3 v7.
   * Based off: https://gist.github.com/erikvullings/51cc5332439939f1f292
   */
  drawChart() {
    var chartWidth = 500,
      barHeight = 30,
      groupHeight = barHeight * 2,
      gapBetweenGroups = 10,
      spaceForLabels = 50,
      spaceForLegend = 250;

    var rawData = this.getData();
    var max = rawData[0],
      zippedData = rawData[1],
      dataKeys = rawData[2],
      labels = rawData[3];

    var chartHeight = barHeight * 14 + gapBetweenGroups * 7;

    // Create color scale
    var color = d3.scaleOrdinal().range([this.colorX, this.colorY]);

    // Create x scale
    var x = d3.scaleLinear().domain([0, max]).range([0, chartWidth]);

    // Create y scale
    var y = d3.scaleLinear().range([chartHeight + gapBetweenGroups, 0]);

    // Create axes
    var yAxis = d3.axisLeft().scale(y).tickFormat("").tickSize(0);

    var xAxis = d3
      .axisBottom(x)
      .tickFormat(function (d) {
        return d;
      })
      .tickSize(10);

    // Append the svg object to the designated element in the page
    var chart = d3
      .select("#barchart")
      .attr("width", spaceForLabels + chartWidth + spaceForLegend)
      .attr("height", chartHeight + 30);

    // Create bars
    var bar = chart
      .selectAll("g")
      .data(zippedData)
      .enter()
      .append("g")
      .attr("transform", function (d, i) {
        return (
          "translate(" +
          spaceForLabels +
          "," +
          (i * barHeight + gapBetweenGroups * (0.5 + Math.floor(i / 2))) +
          ")"
        );
      });

    // Create bars with correct width
    bar
      .append("rect")
      .attr("fill", function (d, i) {
        return color(i % 2);
      })
      .attr("fill-opacity", this.fillOpacity)
      .attr("class", "bar")
      .attr("width", function (d) {
        return x(d[0]);
      })
      .attr("height", barHeight - 1)
      .attr("id", function (d, i) {
        return i;
      });

    // Draw labels
    bar
      .append("text")
      .attr("class", "text-graph")
      .attr("fontFamily", "open sans")
      .attr("x", function (d) {
        return -15;
      })
      .attr("y", groupHeight / 2)
      .attr("dy", ".35em")
      .attr("dx", "-1.8em")
      .text(function (d, i) {
        if (i % 2 === 0) return dataKeys[Math.floor(i / 2)];
        else return "";
      });

    // Add the y axis
    chart
      .append("g")
      .attr("class", "y axis")
      .attr(
        "transform",
        "translate(" + spaceForLabels + ", " + -gapBetweenGroups / 2 + ")"
      )
      .call(yAxis);

    // Add the x axis
    chart
      .append("g")
      .attr("class", "x axis")
      .attr("font-size", "14px")
      .attr(
        "transform",
        "translate(" + spaceForLabels + "," + chartHeight + ")"
      )
      .call(xAxis);

    // Change tick text style
    var ticks = d3.selectAll(".tick text");
    ticks.attr("class", "text-graph").attr("font-size", "14px");

    // Draw legend
    var legendRectSize = 18,
      legendSpacing = 4;

    var legend = chart
      .selectAll(".legend")
      .data(labels)
      .enter()
      .append("g")
      .attr("transform", function (d, i) {
        var height = legendRectSize + legendSpacing;
        var offset = -gapBetweenGroups / 2;
        var horz = spaceForLabels + chartWidth + 40 - legendRectSize;
        var vert = i * height - offset;
        return "translate(" + horz + "," + vert + ")";
      });

    // Add squares with colors of the lines
    legend
      .append("rect")
      .classed("selected", false)
      .attr("width", legendRectSize)
      .attr("height", legendRectSize)
      .style("fill", function (d, i) {
        return color(i);
      })
      .style("fill-opacity", this.fillOpacity);

    // Add name of the domains
    legend
      .append("text")
      .attr("class", "text-graph")
      .attr("x", legendRectSize + legendSpacing)
      .attr("y", legendRectSize - legendSpacing)
      .text(function (d) {
        return d;
      });

    // Get all bars
    var rects = chart.selectAll(".bar");

    // Call event handlers
    rects.on("click", this.handleOnClick(chart));
    rects.on("mouseover", this.handleOnMouseOver(chart));
    rects.on("mouseleave", this.handleOnMouseLeave(chart));

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
    var component = this;
    var delayTime = 0;
    console.log("OSBC Presentation Delay", component.presentationDelay);
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
   * Returns a selection of bars.
   */
  getPhantom(chart) {
    var component = this;
    component.phantom = chart.selectAll("rect").filter(function (d) {
      if (d[TYPE] !== undefined) {
        if (d[TYPE] === "phantom") return d;
      }
    });
    component.phantom
      .attr("fill", component.colorPhantom)
      .attr("fill-opacity", component.fillOpacity);
    return component.phantom;
  }

  /** Handles clicking on a group of bars. */
  handleOnClick(chart) {
    const component = this;
    return function (event, bar) {
      console.log(bar);
      // Selects a group of bars, if not already selected
      if (!d3.select(this).classed("selected")) {
        selectedGroup = chart.selectAll("rect").filter(function (d) {
          if (d[LABEL] === bar[LABEL] && d[TYPE] !== "phantom") {
            component.selectedBars = d[LABEL];
            component.selectedType = d[TYPE];
            return d;
          }
          if (
            d[LABEL] === bar[LABEL] &&
            d[TYPE] === "phantom" &&
            component.presentationDelay === "control"
          ) {
            component.selectedBars = d[LABEL];
            component.selectedType = d[TYPE];
            return d;
          }
        });
        notSelectedGroups = chart.selectAll("rect").filter(function (d) {
          if (d[LABEL] !== bar[LABEL] && d[TYPE] !== "phantom") {
            return d;
          }
          if (
            d[LABEL] !== bar[LABEL] &&
            d[TYPE] === "phantom" &&
            component.presentationDelay === "control"
          ) {
            return d;
          }
        });

        // Does not allow the Phantom to be selected
        if (
          bar[TYPE] === "phantom" &&
          component.presentationDelay !== "control"
        ) {
          component.phantom = component.getPhantom(chart);
          component.phantomClicked = true;
          console.log("cannot select phantom");
          component.selectedBars = "";
          component.selectedType = "";
        }
        // Updates number of clicks for the clicked option
        component.clicks[bar[LABEL]]++;
        component.addInteraction(bar[LABEL], "_click");

        // Highlights the selected group
        selectedGroup.style("fill-opacity", "100%");
        selectedGroup.classed("selected", true);

        // Resets other bars' styles, including the Phantom
        notSelectedGroups.style("fill-opacity", component.fillOpacity);
        notSelectedGroups.style("stroke", "none");
        notSelectedGroups.classed("selected", false);

        // Unselects the group, if already selected
      } else {
        var selectedGroup = chart.selectAll("rect").filter(function (d) {
          if (d[LABEL] === bar[LABEL] && d[TYPE] !== "phantom") {
            return d;
          }
          if (
            d[LABEL] === bar[LABEL] &&
            d[TYPE] === "phantom" &&
            component.presentationDelay === "control"
          ) {
            return d;
          }
        });
        var notSelectedGroups = chart.selectAll("rect").filter(function (d) {
          if (d[LABEL] !== bar[LABEL] && d[TYPE] !== "phantom") {
            return d;
          }
          if (
            d[LABEL] !== bar[LABEL] &&
            d[TYPE] === "phantom" &&
            component.presentationDelay === "control"
          ) {
            return d;
          }
        });

        // Updates number of clicks for the selected option
        component.clicks[bar[LABEL]]++;
        component.addInteraction(bar[LABEL], "_click");

        // Highlights the selected group
        selectedGroup.style("fill-opacity", component.fillOpacity);
        selectedGroup.classed("selected", false);

        // Resets other bars' styles, including the Phantom
        notSelectedGroups.style("fill-opacity", component.fillOpacity);
        notSelectedGroups.classed("selected", false);

        // Clears selected info
        component.selectedBars = "";
        component.selectedType = "";
      }
    };
  }

  /**  Handles mouse over event. */
  handleOnMouseOver(chart) {
    const component = this;
    return function (event, bar) {
      component.start = new Date().getTime();
      var hoveredGroup = chart.selectAll("rect").filter(function (d) {
        if (d[LABEL] === bar[LABEL]) {
          component.hoveredBars = d[LABEL];
          if (
            d[TYPE] === "phantom" &&
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
        hoveredGroup.style("fill-opacity", "100%");
      } else if (!component.notPhantom && component.phantomClicked) {
        component.phantom = component.getPhantom(chart);
      } else if (
        !component.notPhantom &&
        !component.phantomClicked &&
        component.presentationDelay === "unknown"
      ) {
        hoveredGroup.style("fill-opacity", "100%");
      }
    };
  }

  /**  Handles mouse leave event. */
  handleOnMouseLeave(chart) {
    const component = this;
    return function (event, bar) {
      component.end = new Date().getTime();
      component.time = component.end - component.start;
      var hoveredGroup = chart.selectAll("rect").filter(function (d) {
        if (
          d[LABEL] === bar[LABEL] &&
          d[AVAILABLE] &&
          d[LABEL] !== component.selectedBars
        ) {
          return d;
        }
      });

      // Reset style accordingly to type of option
      if (component.notPhantom)
        hoveredGroup.style("fill-opacity", component.fillOpacity);
      else if (!component.notPhantom && !component.phantomClicked)
        hoveredGroup.style("fill-opacity", component.fillOpacity);
      else if (!component.notPhantom && component.phantomClicked)
        hoveredGroup.style("fill-opacity", component.fillOpacity);

      // Updates number of hovers per option if hover is long enough
      if (component.time > 400) {
        component.hovers[component.hoveredBars]++;
        component.addInteraction(component.hoveredBars, "_hover");
      }
      component.time = 0;
      component.hoveredBars = "";
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
  update() {
    const component = this;
    component.finish = new Date().getTime();
    component.duration = (component.finish - component.begin) / 1000;
    let uid = localStorage.getItem("uid");
    // Doesn't allow the participant to submit an unavailable option
    if (
      component.selectedBars === "" &&
      component.presentationDelay !== "control"
    ) {
      console.log("Cannot submit phantom", component.selectedBars);
      component.handleClickOpen();
    } else {
      console.log(
        "Adding following to the DB:",
        component.scenario,
        "selected",
        component.selectedBars,
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

      updateParticipantOSBC(
        component.scenario,
        component.selectedBars,
        component.selectedType,
        component.clicks,
        component.hovers,
        component.duration,
        component.interactions.toString(),
        uid
      );

      // Submission and route to the next step
      let currentIx = component.plots.indexOf("/one-sided-barchart/");
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
        <svg className="graph" id={"barchart"}></svg>
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
export default withRouter(OneSidedBarChart);
