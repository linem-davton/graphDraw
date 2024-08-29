import * as d3 from "d3";
import { useState, useEffect, useRef } from "react";

const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
const graphWidth = 1200;
const graphHeight = 400;
const minGraphHeight = 300;

const scheduleGraphs = ({ schedules, setErrorMessage }) => {
  const svgRefs = useRef({});
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    Object.keys(schedules).forEach((scheduleKey) => {
      const svg = d3.select(svgRefs.current[scheduleKey]);
      const svgNode = svg.node();
      const boundingRect = svgNode.getBoundingClientRect();

      const margin = { top: 80, right: 10, bottom: 50, left: 50 }; // Increased top margin for algorithm name
      const width = boundingRect.width - margin.left - margin.right;
      const height = boundingRect.height - margin.top - margin.bottom;

      svg.selectAll("*").remove();

      const g = svg
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

      const algorithmName = schedules[scheduleKey].name;
      const nodes = Array.from(
        new Set(schedules[scheduleKey].schedule.map((job) => job.node_id)),
      );
      const endTime = d3.max(
        schedules[scheduleKey].schedule.map((job) => job.end_time),
      );
      const startTime = d3.min(
        schedules[scheduleKey].schedule.map((job) => job.start_time),
      ); // Calculate the minimum start_time
      // set the error messages for missed deadlines

      if (schedules[scheduleKey].missed_deadlines?.length > 0) {
        setErrorMessage((prev) => [
          ...prev,
          `${algorithmName}: ${schedules[scheduleKey].missed_deadlines.join(",")} Missed Deadline`,
        ]);
      }

      const xScale = d3
        .scaleLinear()
        .domain([startTime, endTime])
        .range([0, width]);

      const yScale = d3
        .scaleBand()
        .domain(nodes)
        .range([height, 0])
        .padding(0.1);

      // Add the x-axis and y-axis
      g.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale))
        .style("color", "#dfe6e9")
        .style("font-size", "0.8rem");

      g.append("g")
        .call(d3.axisLeft(yScale))
        .style("color", "#dfe6e9")
        .style("font-size", "0.8rem");

      // X-axis label
      g.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom / 1.5)
        .attr("text-anchor", "middle")
        .text("Time")
        .style("fill", "#dfe6e9");

      // Y-axis label
      g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 15)
        .attr("x", -height / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Nodes")
        .style("fill", "#dfe6e9");

      g.append("text")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .text(algorithmName)
        .style("fill", "#00b894")
        .style("font-size", "1.2rem")
        .style("font-weight", "bold");

      const schedule = schedules[scheduleKey].schedule;
      // Create a tooltip to show the task details
      const tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "black")
        .style("padding", "10px")
        .style("border-radius", "5px")
        .style("font-size", "1.2rem")
        .style("color", "white");

      g.selectAll(".bar")
        .data(schedule)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", (d) => xScale(d.start_time))
        .attr("y", (d) => yScale(d.node_id))
        .attr("width", (d) => xScale(d.end_time) - xScale(d.start_time))
        .attr("height", yScale.bandwidth())
        .style("fill", (d) => colorScale(d.task_id))
        .on("mouseover", (event, d) => {
          tooltip.transition().duration(10).style("opacity", 0.9);
          tooltip
            .html(
              `Task: ${d.task_id} <br/>Start: ${d.start_time}<br/>End: ${d.end_time}`,
            )
            .style("left", event.pageX + "px")
            .style("top", event.pageY - 28 + "px");
        })
        .on("mouseout", () => {
          tooltip.transition().duration(10).style("opacity", 0);
        });

      g.selectAll(".text")
        .data(schedule)
        .enter()
        .append("text")
        .attr("x", (d) => xScale(d.start_time) + 10)
        .attr("y", (d) => yScale(d.node_id) + yScale.bandwidth() / 2)
        .attr("dy", "0.35em")
        .text((d) => `${d.task_id}`)
        .style("fill", "#dfe6e9")
        .style("font-size", "1rem")
        .style("font-weight", "bold");
    });

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [schedules, windowSize.width]);

  if (!schedules) return;

  return (
    <>
      {Object.entries(schedules).map(([schedule]) => (
        <svg
          key={schedule}
          id={schedule}
          ref={(el) => (svgRefs.current[schedule] = el)}
          width="100%"
          style={{
            maxWidth: graphWidth,
            maxHeight: graphHeight,
            minHeight: minGraphHeight,
            aspectRatio: "16/9",
          }}
        ></svg>
      ))}
    </>
  );
};

export default scheduleGraphs;
