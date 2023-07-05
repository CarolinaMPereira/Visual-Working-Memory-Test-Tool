import React, { Component } from "react";
import * as d3 from "d3";
import { withRouter } from "react-router-dom";

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

import { updateParticipantTSBC } from "../updateParticipant";

class TwoSidedBarChart extends Component {
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
  scenario = localStorage.getItem("scenarios").split(",")[2];

  /** States saving flag for open dialog and problem prompt text. */
  state = { open: false, problem: "", locale: localStorage.getItem("locale") };

  /** {Array} Plot to be redirected to next */
  plots = localStorage.getItem("plots").split(",");

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
   * Draws SVG two sided barchart (TSBC) using D3 v7.
   * Based off: https://stackoverflow.com/a/64823682
   */
  drawChart() {
    var rawData = this.getData();
    var data = rawData[0];
    var labels = rawData[1];

    var width = 600,
      height = 400,
      gapBetweenGroups = 10,
      spaceForLabels = 50,
      margin = {
        top: 20,
        left: 20,
        right: 40,
        bottom: 40,
      };

    // Create x scale, x values will be negative because of divergence.
    var xDomain = d3.max(data.map((d) => d.x));
    var yDomain = d3.max(data.map((d) => d.y));
    var domain = d3.max([xDomain, yDomain]);

    var x = d3.scaleLinear().domain([-domain, domain]).range([0, width]);

    // Create y scale
    var y = d3
      .scaleBand()
      .domain(data.map((d) => d.label))
      .range([0, height])
      .padding(0.2);

    // Append the svg object to the designated element in the page
    var svg = d3
      .select("#bidirecionalbarchart")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    var chart = svg.append("g");

    // Create one group per data entry, each holding two bars
    var positiveBars = chart.selectAll(".positive").data(data);

    positiveBars.exit().remove();

    positiveBars
      .enter()
      .append("rect")
      .attr("class", "positive")
      .attr("fill", this.colorY)
      .attr("fill-opacity", this.fillOpacity)
      .merge(positiveBars)
      .attr("x", x(0))
      .attr("y", (d) => y(d.label))
      .attr("width", (d) => x(d.y) - x(0))
      .attr("height", y.bandwidth());

    var negativeBars = chart.selectAll(".negative").data(data);
    negativeBars.exit().remove();
    negativeBars
      .enter()
      .append("rect")
      .attr("class", "negative")
      .attr("fill", this.colorX)
      .attr("fill-opacity", this.fillOpacity)
      .merge(negativeBars)
      .attr("x", (d) => x(-d.x))
      .attr("y", (d) => y(d.label))
      .attr("width", (d) => x(0) - x(-d.x))
      .attr("height", y.bandwidth());

    // Create x axis
    chart
      .append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).tickFormat((d) => Math.abs(d)));

    // Create y axis
    chart
      .append("g")
      .classed("y-axis", true)
      .attr("transform", `translate(${x(0)}, 0)`)
      .call(d3.axisLeft(y));

    // Change tick text style
    var ticks = d3.selectAll(".tick text");
    ticks.attr("class", "text-graph").attr("font-size", "14px");

    // Create color scale
    var color = d3.scaleOrdinal().range([this.colorX, this.colorY]);

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
        var horz = spaceForLabels + width + 40 - legendRectSize;
        var vert = i * height - offset;
        return "translate(" + horz + "," + vert + ")";
      });

    // Add squares with colors of the bars
    legend
      .append("rect")
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
    var negRects = chart.selectAll(".negative");
    var posRects = chart.selectAll(".positive");

    // Call event handlers
    negRects.on("click", this.handleOnClick(chart));
    negRects.on("mouseover", this.handleOnMouseOver(chart));
    negRects.on("mouseleave", this.handleOnMouseLeave(chart));
    posRects.on("click", this.handleOnClick(chart));
    posRects.on("mouseover", this.handleOnMouseOver(chart));
    posRects.on("mouseleave", this.handleOnMouseLeave(chart));

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
   * Returns a selection of bars.
   */
  getPhantom(chart) {
    var component = this;
    component.phantom = chart.selectAll("rect").filter(function (d) {
      if (d.type !== undefined) {
        if (d.type === "phantom") return d;
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
          if (d.label === bar.label && d.type !== "phantom") {
            component.selectedBars = d.label;
            component.selectedType = d.type;
            return d;
          }
          if (
            d.label === bar.label &&
            d.type === "phantom" &&
            component.presentationDelay === "control"
          ) {
            component.selectedBars = d.label;
            component.selectedType = d.type;
            return d;
          }
        });
        notSelectedGroups = chart.selectAll("rect").filter(function (d) {
          if (d.label !== bar.label && d.type !== "phantom") {
            return d;
          }
          if (
            d.label !== bar.label &&
            d.type === "phantom" &&
            component.presentationDelay === "control"
          ) {
            return d;
          }
        });

        // Does not allow the Phantom to be selected
        if (
          bar.type === "phantom" &&
          component.presentationDelay !== "control"
        ) {
          component.phantom = component.getPhantom(chart);
          component.phantomClicked = true;
          console.log("cannot select phantom");
          component.selectedBars = "";
          component.selectedType = "";
        }

        // Updates number of clicks for the clicked option
        component.clicks[bar.label]++;
        component.addInteraction(bar.label, "_click");

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
          if (d.label === bar.label && d.type !== "phantom") {
            return d;
          }
          if (
            d.label === bar.label &&
            d.type === "phantom" &&
            component.presentationDelay === "control"
          ) {
            return d;
          }
        });
        var notSelectedGroups = chart.selectAll("rect").filter(function (d) {
          if (d.label !== bar.label && d.type !== "phantom") {
            return d;
          }
          if (
            d.label !== bar.label &&
            d.type === "phantom" &&
            component.presentationDelay === "control"
          ) {
            return d;
          }
        });

        // Updates number of clicks for the selected option
        component.clicks[bar.label]++;
        component.addInteraction(bar.label, "_click");

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
        if (d.label === bar.label) {
          component.hoveredBars = d.label;
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

      // Style varies if the hovered bar is the Phantom or not
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
          d.label === bar.label &&
          d.available &&
          d.label !== component.selectedBars
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
  async update() {
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

      updateParticipantTSBC(
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
      let currentIx = component.plots.indexOf("/two-sided-barchart/");
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
        <svg className="graph" id={"bidirecionalbarchart"}></svg>
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
export default withRouter(TwoSidedBarChart);
