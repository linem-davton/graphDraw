import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

const Test1 = ({ schedules }) => {
  useEffect(() => {
    if (schedules) {
      Object.keys(schedules).forEach((scheduleKey, index) => {
        const svg = d3.select(`#${scheduleKey}`);
        const margin = { top: 40, right: 20, bottom: 50, left: 50 }; // Increased top margin for algorithm name
        const width = 300 - margin.left - margin.right;
        const height = 200 - margin.top - margin.bottom;

        svg.selectAll('*').remove();

        const g = svg.append('g')
          .attr('transform', `translate(${margin.left}, ${margin.top})`);

        const nodes = Array.from(new Set(schedules[scheduleKey].map(job => job.node_id)));
        const maxEndTime = d3.max(schedules[scheduleKey].map(job => job.end_time));
        const start_time = d3.min(schedules[scheduleKey].map(job => job.start_time)); // Calculate the minimum start_time

        const xScale = d3.scaleLinear()
          .domain([start_time, maxEndTime]) // Adjust the domain to include start_time
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
          .style('color','#00b894');

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
          .attr('y', -margin.left+15)
          .attr('x', -height / 2)
          .attr('dy', '1em')
          .style('text-anchor', 'middle')
          .text('Nodes')
          .style('fill', '#00b894');

        // Algorithm name
        const algorithmNames = ['LDF', 'EDF', 'RMS', 'LL'];
        const algorithmName = algorithmNames[index]; 

        g.append('text')
          .attr('x', width / 2)
          .attr('y', -margin.top / 2) 
          .attr('text-anchor', 'middle')
          .text(algorithmName) 
          .style('fill', '#00b894');

        const schedule = schedules[scheduleKey];

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
          .text(d => `Task ${d.job_id}`)
          .style('fill', '#dfe6e9')
         // .style('font-weight','bold')
          .style('font-size', '12px');
      });
    }
  }, [schedules]);

  return (
    <>
      <svg id="schedule1" width={300} height={200}></svg>
      <svg id="schedule2" width={300} height={200}></svg>
      <svg id="schedule3" width={300} height={200}></svg>
      <svg id="schedule4" width={300} height={200}></svg>
    </>
  );
};

export default Test1;







