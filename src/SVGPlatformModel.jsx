import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import dagre from 'dagre';


const SVGPlatformModel = ({ graph, setGraph, deleteMode, highlightNode, setHighlightedNode, highlightedEdge, setHighlightedEdge, selectedSVG }) => {
  const svgRef = useRef();
  const nodeRadius = 5;
  const svgClass = selectedSVG === "PlatformModel" ? 'active' : 'inactive';

  const legendData = [
    { type: 'Compute', color: '#00b894' },  // Assuming default fill is white
    { type: 'Router', color: '#e67e22' },   // Assuming default fill is black
    { type: 'Sensor', color: '#4393E9' },
    { type: 'Actuator', color: '#F56C51' }
  ];

  const handleNodeClick = (nodeId) => {
    if (deleteMode && selectedSVG === "PlatformModel") {
      const newNodes = graph.nodes.filter(node => node.id !== nodeId);
      const newEdges = graph.links.filter(edge => edge.start_node !== nodeId && edge.end_node !== nodeId);
      setGraph({ nodes: newNodes, links: newEdges });
    } else {
      setHighlightedNode(node => {
        if (node === nodeId) {
          return null;
        }
        return nodeId;
      });

    }
  };
  function handleEdgeClick(edge) {
    if (deleteMode && selectedSVG === "PlatformModel") {
      setGraph(prevGraph => {
        const newEdges = prevGraph.links.filter(e => !(e.start_node == edge.v && e.end_node == edge.w));
        return { nodes: prevGraph.nodes, links: newEdges };
      });
    } else {
      setHighlightedEdge(prev => {
        if (prev?.start_node == edge.v && prev?.end_node == edge.w)
          return null;
        else
          return { start_node: edge.v, end_node: edge.w };
      });
    }
  }


  const calculateBoundaryPoint = (source, target) => {
    const deltaX = target.x - source.x;
    const deltaY = target.y - source.y;
    const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Adjust the boundary point calculation based on the node type
    if (source.type === 'router' || target.type === 'router') {
      // Handle square (router) geometry
      const angle = Math.atan2(deltaY, deltaX);
      const halfDiagonal = Math.sqrt(2 * (nodeRadius ** 2)); // Diagonal of a square for a router
      const edgeDist = nodeRadius / Math.cos(Math.PI / 4 - Math.abs(angle % (Math.PI / 2) - Math.PI / 4));

      return {
        x: source.x + (edgeDist * Math.cos(angle)),
        y: source.y + (edgeDist * Math.sin(angle))
      };
    } else if (source.type === 'router' || target.type === 'router') {
      // At least one node is a square
      let rectSideLength = nodeRadius * 2; // Assuming square side length is twice the radius used for circles
      let aspectRatio = Math.abs(deltaX / deltaY);
      let halfWidth = rectSideLength / 2;

      if (aspectRatio > 1) {
        // Intersection is at the left or right side of the square
        return {
          x: source.x + (Math.sign(deltaX) * halfWidth),
          y: source.y + (Math.sign(deltaX) * halfWidth / aspectRatio)
        };
      }
    }
    else {
      // Handle circle (compute) geometry
      return {
        x: source.x + (nodeRadius * deltaX / dist),
        y: source.y + (nodeRadius * deltaY / dist)
      };
    }
  };


  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    if (!graph || !graph.nodes.length) {
      return; // Exit if data is empty or improperly structured
    }
    // Top level group for zooming and panning
    const svgGroup = svg.append('g');

    // Create a new directed graph
    var g = new dagre.graphlib.Graph();
    g.setGraph({
      rankdir: 'LR', // or 'LR' for horizontal layout
      nodesep: 1, // Reduce distance between nodes
      edgesep: 5, // Reduce distance between edges
      ranksep: 10, // Reduce distance between different ranks
      marginx: 2, // Increase margin if needed
      marginy: 10
    });
    g.setDefaultEdgeLabel(() => ({}));

    // Add nodes to the graph
    graph.nodes.forEach(node => {
      const width = node.type === 'router' ? 20 : 10; // Adjust width for routers to be larger
      const height = node.type === 'router' ? 20 : 10; // Adjust height for routers
      g.setNode(node.id, {
        label: node.id,
        width: width,
        height: height,
        shape: node.type  // Store the node type for later use
      });
    });

    // Add edges to the graph
    graph.links.forEach(edge => {
      g.setEdge(edge.start_node, edge.end_node, {
        width: 10, height: 10, label: edge.link_delay, curve: d3.curveBasis
      });
    });

    // Layout the graph
    dagre.layout(g);
    svg.attr('viewBox', `0 0 ${g.graph().width} ${g.graph().height}`); // Adjust width and height based on Dagre output

    // Add zoom functionality
    const zoom = d3.zoom()
      .scaleExtent([1, 5 * graph.nodes.length])
      .on('zoom', (event) => {
        svgGroup.attr('transform', event.transform);
      });

    if (selectedSVG === "PlatformModel") {
      svg.call(zoom); // Apply the zoom behavior only if selectedSVG is 'PlatformModel'
    } else {
      svg.on(".zoom", null); // Remove zoom behavior if not 'PlatformModel'
    }


    // Render nodes
    const nodes = svgGroup.selectAll('.node')
      .data(g.nodes().map(nodeId => g.node(nodeId)), d => d.label)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .on('click', function(event, d) {
        handleNodeClick(d.label);
      });

    nodes.each(function(d) {
      const node = d3.select(this);
      switch (d.shape) {
        case 'compute':
          node.append('circle')
            .attr('r', nodeRadius)
            .classed('compute', true)
          break;
        case 'router':
          node.append('circle')
            .attr('r', nodeRadius)
            .classed('router', true)
          break;
        case 'sensor':
          node.append('circle') // Using ellipse to r  epresent sensors
            .attr('r', nodeRadius)
            .classed('sensor', true)
          break;
        case 'actuator':
          node.append('circle') // Using polygon to represent actuators
            .attr('r', nodeRadius)
            .classed('actuator', true)
          break;
      }
    });

    nodes.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em') // Vertically center
      .style("font-size", "5px")
      .style("fill", "white")
      .text(d => d.label); // Assuming each node has a "name" property

    const edges = svgGroup.selectAll('.edge')
      .data(g.edges())
      .enter()
      .append('g')
      .attr('class', 'edge')
      .on("click", function(event, d) {
        handleEdgeClick(d); // centralizing click logic
      });

    // Adding lines
    edges.append('line')
      .classed("highlighted-edge", d => { return highlightedEdge?.start_node == d.v && highlightedEdge?.end_node == d.w; })

      .attr('x1', d => calculateBoundaryPoint(g.node(d.v), g.node(d.w)).x)
      .attr('y1', d => calculateBoundaryPoint(g.node(d.v), g.node(d.w)).y)
      .attr('x2', d => calculateBoundaryPoint(g.node(d.w), g.node(d.v)).x)
      .attr('y2', d => calculateBoundaryPoint(g.node(d.w), g.node(d.v)).y);

    // Adding labels to the edges
    edges.append('text')
      .attr('x', d => {
        const source = calculateBoundaryPoint(g.node(d.v), g.node(d.w));
        const target = calculateBoundaryPoint(g.node(d.w), g.node(d.v));
        return (source.x + target.x) / 2;
      })
      .attr('y', d => {
        const source = calculateBoundaryPoint(g.node(d.v), g.node(d.w));
        const target = calculateBoundaryPoint(g.node(d.w), g.node(d.v));
        return (source.y + target.y) / 2;
      })
      .text(d => g.edge(d).label)
      .attr('font-size', '10px') // Adjust font size as necessary
      .attr('text-anchor', 'middle')
      .attr('dy', -4); // Adjust vertical offset to not overlap with the edge line


    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${0}, ${g.graph().height - g.graph().height / 20})`);  // Adjust for your SVG size

    legend.selectAll('.legend-item')
      .data(legendData)
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(${i * g.graph().width / 4},0)`)  // Stacks items vertically, adjust spacing as needed
      .each(function(d) {
        const item = d3.select(this);
        item.append('rect')  // Color block
          .attr('width', g.graph().width / 40)
          .attr('height', g.graph().height / 40)
          .style('fill', d.color)

        item.append('text')  // Text label
          .attr('x', g.graph().width / 25)  // Offset text to the right of the rectangle
          .attr('y', g.graph().height / 40)  // Vertical alignment
          .text(d.type)
          .style("text-anchor", "start")
          .style("font-size", `${g.graph().width / 25}px`);  // Adjust font size as needed
      });


  }, [graph, deleteMode, highlightNode, highlightedEdge, selectedSVG]);

  return (
    <svg ref={svgRef} width="900" height="800" className={svgClass} >
      {/* ... SVG content */}
    </svg>
  );
};

export default SVGPlatformModel;
