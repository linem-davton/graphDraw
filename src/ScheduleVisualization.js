import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';


const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

const ScheduleVisualization = ({ scheduleData }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (scheduleData) {
      const svg = d3.select(svgRef.current);
      console.log("retrieved schedule data:", scheduleData);
      const margin = { top: 20, right: 20, bottom: 50, left: 50 };
      const width = 600 - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;

      svg.selectAll('*').remove();

      const g = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

      const nodes = Array.from(new Set(scheduleData.schedule1.map(job => job.node_id)));
      const jobs = scheduleData.schedule1;
      console.log("nodes:",nodes);
      console.log("jobs:",jobs)
      const start_time=0;

      const xScale = d3.scaleLinear()
        .domain([0,d3.max(jobs, d => d.end_time)] )
        .range([0, width]);
        
        
       
      const yScale = d3.scaleBand()
        .domain(nodes)
        .range([height, 0])
        .padding(0.1);
        
    console.log("xScale domain:", xScale.domain());
    console.log("yScale domain:", yScale.domain());
      g.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale))
        .style('fill', '#dfe6e9');

      g.append('g')
        .call(d3.axisLeft(yScale))
        .style('fill','#00b894');

      g.selectAll('.bar')
        .data(jobs)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(start_time))
        .attr('y', d => yScale(d.node_id))
        .attr('width', d => xScale(d.end_time - start_time))
        .attr('height', yScale.bandwidth())
        .style('fill', (d, i) => colorScale(i));
        
     
      // Task id
      g.selectAll('.text')
        .data(jobs)
        .enter().append('text')
        .attr('x', start_time + 250) 
        .attr('y', d => yScale(d.node_id) + yScale.bandwidth() / 2) 
        .attr('dy', '0.35em')
        .text(d => `Task ${d.job_id}`)
        .style('fill', '#dfe6e9');

      // x-axis
      g.append('text')
        .attr('x', width /2)
        .attr('y', height + margin.bottom / 1.5)
        .attr('text-anchor', 'middle')
        .text('Time')
        .style('fill', '#dfe6e9');
      // y-axis
      g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left)
        .attr('x', -height / 2)
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text('Nodes')
        .style('fill','#00b894');
    }
  }, [scheduleData]);

  return (
    <svg ref={svgRef} width={600} height={400}></svg>
  );
};


export default ScheduleVisualization;



