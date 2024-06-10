import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import dagre from 'dagre';


const SVGApplicationModel = ({ graph, setGraph, deleteMode, highlightNode, setHighlightedNode, highlightedEdge, setHighlightedEdge, selectedSVG }) => {
  const svgRef = useRef();
  const nodeRadius = 5;
  const svgClass = selectedSVG === "ApplicationModel" ? 'active' : 'inactive';

  const handleNodeClick = (nodeId) => {
    if (deleteMode && selectedSVG === "ApplicationModel") {
      const newTasks = graph.tasks.filter(node => node.id !== nodeId);
      const newMessages = graph.messages.filter(edge => edge.sender !== nodeId && edge.receiver !== nodeId);
      if (nodeId === highlightNode) {
        setHighlightedNode(null)
      }
      setGraph({ tasks: newTasks, messages: newMessages });
    } else {
      setHighlightedNode(node => (node === nodeId ? null : nodeId));
    }
  };
  const handleEdgeClick = (edge) => {
    if (deleteMode && selectedSVG === "ApplicationModel") {
      setGraph(prevGraph => {
        const newMessages = prevGraph.messages.filter(e => !(e.sender == edge.v && e.receiver == edge.w));
        return { tasks: prevGraph.tasks, messages: newMessages };
      });
    }
    else {
      setHighlightedEdge(prev => {
        if (prev?.sender === edge.v && prev?.receiver === edge.w)
          return null;
        else
          return { sender: edge.v, receiver: edge.w };
      })
    }

  };
  const calculateBoundaryPoint = (source, target) => {
    const deltaX = target.x - source.x;
    const deltaY = target.y - source.y;
    const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    return {
      x: source.x + (nodeRadius * deltaX / dist),
      y: source.y + (nodeRadius * deltaY / dist)
    };
  };

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    if (!graph || !graph.tasks.length) {
      return; // Exit if data is empty or improperly structured
    }

    // Top level group for zooming and panning
    const svgGroup = svg.append('g');
    // Create a new directed graph
    var g = new dagre.graphlib.Graph();
    g.setGraph({
      rankdir: 'LR', // or 'LR' for horizontal layout
      nodesep: 2, // Reduce distance between nodes
      edgesep: 5, // Reduce distance between edges
      ranksep: 10, // Reduce distance between different ranks
      marginx: 10, // Increase margin if needed
      marginy: 10
    });
    g.setDefaultEdgeLabel(() => ({}));

    // Add nodes to the graph
    graph.tasks.forEach(node => {
      g.setNode(node.id, { label: node.id, width: 10, height: 10 });
    });

    // Add edges to the graph
    graph.messages.forEach(edge => {
      g.setEdge(edge.sender, edge.receiver, {
        width: 10, height: 10, label: edge.id, curve: d3.curveBasis
      });
    });

    // Layout the graph
    dagre.layout(g);
    svg.attr('viewBox', `0 0 ${g.graph().width} ${g.graph().height}`); // Adjust width and height based on Dagre output


    // Add zoom functionality
    const zoom = d3.zoom()
      .scaleExtent([1, 5 * graph.tasks.length])
      .on('zoom', (event) => {
        svgGroup.attr('transform', event.transform);
      });

    if (selectedSVG === "ApplicationModel") {
      svg.call(zoom); // Apply the zoom behavior only if selectedSVG is 'ApplicationModel'
    } else {
      svg.on(".zoom", null); // Remove zoom behavior if not 'ApplicationModel'
    }
    // Render nodes
    const nodes = svgGroup.selectAll('.node')
      .data(g.nodes().map(nodeId => g.node(nodeId)), d => d.label)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .on('click', function(event, d) {
        handleNodeClick(d.label); // Function to handle node deletion
      });

    nodes.append('circle')
      .attr('r', nodeRadius)
      .classed("highlighted-circle", d => {
        return highlightNode === d.label;
      });

    nodes.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em') // Vertically center
      .style("font-size", "5px")
      .style("fill", "white")
      .text(d => d.label); // Assuming each node has a "name" property

    svgGroup.selectAll('.edge')
      .data(g.edges())
      .enter()
      .append('line')
      .attr('class', 'edge')
      .attr('x1', d => calculateBoundaryPoint(g.node(d.v), g.node(d.w)).x,)
      .attr('y1', d => calculateBoundaryPoint(g.node(d.v), g.node(d.w)).y)
      .attr('x2', d => calculateBoundaryPoint(g.node(d.w), g.node(d.v)).x)
      .attr('y2', d => calculateBoundaryPoint(g.node(d.w), g.node(d.v)).y)
      .attr('marker-end', 'url(#arrowhead)')
      .on("click", function(event, edge) { handleEdgeClick(edge); })

    svgGroup.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 5)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('xoverflow', 'visible')
      .append('svg:path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', '#999')
      .style('stroke', 'none');

  }, [graph, deleteMode, highlightNode, highlightedEdge, selectedSVG]);

  return (
    <svg ref={svgRef} width="900" height="800" className={svgClass}>
    </svg>
  );
};

export default SVGApplicationModel;
