import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

const Test1 = ({ schedules, setErrorMessage }) => {
  const graphWidth = 600;
  const graphHeight = 300;

  useEffect(() => {
    if (schedules) {
      Object.keys(schedules).forEach((scheduleKey, index) => {
        const svg = d3.select(`#${scheduleKey}`);
        const margin = { top: 80, right: 10, bottom: 50, left: 50 }; // Increased top margin for algorithm name
        const width = graphWidth - margin.left - margin.right;
        const height = graphHeight - margin.top - margin.bottom;

        svg.selectAll('*').remove();

        const g = svg.append('g')
          .attr('transform', `translate(${margin.left}, ${margin.top})`);

        const algorithmName = schedules[scheduleKey].name;
        const nodes = Array.from(new Set(schedules[scheduleKey].schedule.map(job => job.node_id)));
        const endTime = d3.max(schedules[scheduleKey].schedule.map(job => job.end_time));
        const start_time = d3.min(schedules[scheduleKey].schedule.map(job => job.start_time)); // Calculate the minimum start_time
        // set the error messages for missed deadlines

        if (schedules[scheduleKey].missed_deadlines?.length > 0) {
          setErrorMessage(prev => [...prev,
          `${algorithmName}: ${schedules[scheduleKey].missed_deadlines.join(',')} Missed Deadline`
          ]);
        }

        const xScale = d3.scaleLinear()
          .domain([start_time, endTime]) // Adjust the domain to include start_time
          .range([0, width]);

        const yScale = d3.scaleBand()
          .domain(nodes)
          .range([height, 0])
          .padding(0.1);

        g.append('g')
          .attr('transform', `translate(0, ${height})`)
          .call(d3.axisBottom(xScale))
          .style('color', '#dfe6e9');

        g.append('g')
          .call(d3.axisLeft(yScale))
          .style('color', '#dfe6e9');

        // X-axis label
        g.append('text')
          .attr('x', width / 2)
          .attr('y', height + margin.bottom / 1.5)
          .attr('text-anchor', 'middle')
          .text('Time')
          .style('fill', '#dfe6e9');

        // Y-axis label
        g.append('text')
          .attr('transform', 'rotate(-90)')
          .attr('y', -margin.left + 15)
          .attr('x', -height / 2)
          .attr('dy', '1em')
          .style('text-anchor', 'middle')
          .text('Nodes')
          .style('fill', '#dfe6e9');

        // Algorithm name
        const algorithmNames = ['LDF', 'EDF', 'LL', 'LDF Multi-Node', 'EDF Multi-Node'];
        // const algorithmName = algorithmNames[index];

        g.append('text')
          .attr('x', width / 2)
          .attr('y', -margin.top / 2)
          .attr('text-anchor', 'middle')
          .text(algorithmName)
          .style('fill', '#00b894')
          .style('font-size', '20px')
          .style('font-weight', 'bold');

        const schedule = schedules[scheduleKey].schedule

        g.selectAll('.bar')
          .data(schedule)
          .enter().append('rect')
          .attr('class', 'bar')
          .attr('x', d => xScale(d.start_time))
          .attr('y', d => yScale(d.node_id))
          .attr('width', d => xScale(d.end_time) - xScale(d.start_time))
          .attr('height', yScale.bandwidth())
          .style('fill', (d, i) => colorScale(i));

        g.selectAll('.text')
          .data(schedule)
          .enter().append('text')
          .attr('x', d => xScale(d.start_time) + 10)
          .attr('y', d => yScale(d.node_id) + yScale.bandwidth() / 2)
          .attr('dy', '0.35em')
          .text(d => `Task ${d.task_id}`)
          .style('fill', '#dfe6e9')
          .style('font-size', '12px');
      });
    }
  }, [schedules]);

  return (
    <>
      <svg id="schedule1" width={graphWidth} height={graphHeight}></svg>
      <svg id="schedule2" width={graphWidth} height={graphHeight}></svg>
      <svg id="schedule3" width={graphWidth} height={graphHeight}></svg>
      <svg id="schedule4" width={graphWidth} height={graphHeight}></svg>
      <svg id="schedule5" width={graphWidth} height={graphHeight}></svg>

    </>
  );
};

export default Test1;







