import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import dagre from 'dagre';


const SVGComponent = ({ graph, setGraph, deleteMode, setSelectedNode, setSelectedEdge, highlight, setHighligtedNodes, highlightNodes }) => {
  const svgRef = useRef();
  const nodeRadius = 5;


  let dragStartPosition = { x: null, y: null };

  const onDragStart = (event, d) => {
    d3.select(event.sourceEvent.target).raise(); // Bring to front
    dragStartPosition = {
      x: e        "sender": "0",
      "receiver": "2",
      "size": 220
    },
    {
      "sender": "1",
      "receiver": "2",
      "size": 250vent.x, y: event.y
    };
  };

  const onDrag = (event, d) => {
    // d.x = event.x;
    // d.y = event.y;
    d3.select(event.sourceEvent.target)
      .attr('cx', d.x)
      .attr('cy', d.y);
  };

  const onDragEnd = (event, d) => {
    const dx = event.x - dragStartPosition.x;
    const dy = event.y - dragStartPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 5) {  // Threshold for treating the action as a click and not a drag
      if (deleteMode) {
        setGraph(prevGraph => {
          const newNodes = prevGraph.nodes.filter(node => node.id !== d.id);
          const newEdges = prevGraph.edges.filter(edge => (edge.source !== d.id && edge.target !== d.id));
          return { nodes: newNodes, edges: newEdges };
        });
      }
      if (highlight) {
        setHighligtedNodes(nodes => {
          if (nodes.includes(d.id)) {
            return nodes.filter(node => node !== d.id);
          }
          return [...nodes, d.id];
        });
      }
    }

    setGraph(prevGraph => {
      const updatedNodes = prevGraph.nodes.map(node => {
        if (node.id === d.id) {
          return { ...node, x: event.x, y: event.y };
        }
        return node;
      });
      return { ...prevGraph, nodes: updatedNodes };
    });
  };
  const handleNodeClick = (nodeId) => {
    if (deleteMode) {
      const newNodes = graph.nodes.filter(node => node.id !== nodeId);
      const newEdges = graph.edges.filter(edge => edge.sender !== nodeId && edge.receiver !== nodeId);
      setGraph({ nodes: newNodes, edges: newEdges });
    } else if (highlight) {
      setHighligtedNodes(nodes => {
        if (nodes.includes(nodeId)) {
          return nodes.filter(node => node !== nodeId);
        }
        return [...nodes, nodeId];
      });

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


    if (!graph || graph.nodes.length === 0) {
      return; // Exit if data is empty or improperly structured
    }


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
    graph.nodes.forEach(node => {
      g.setNode(node.id, { label: node.id, width: 10, height: 10 });
    });

    // Add edges to the graph
    graph.edges.forEach(edge => {
      g.setEdge(edge.sender, edge.receiver, {
        width: 10, height: 10, label: edge.label, curve: d3.curveBasis
      });
    });

    // Layout the graph
    dagre.layout(g);
    svg.attr('viewBox', `0 0 ${g.graph().width} ${g.graph().height}`); // Adjust width and height based on Dagre output

    // Render nodes
    const nodes = svg.selectAll('.node')
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
        return highlightNodes.includes(d.label);
      });

    nodes.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em') // Vertically center
      .style("font-size", "5px")
      .style("fill", "white")
      .text(d => d.label); // Assuming each node has a "name" property

    svg.selectAll('.edge')
      .data(g.edges())
      .enter()
      .append('line')
      .attr('class', 'edge')
      .attr('x1', d => calculateBoundaryPoint(g.node(d.v), g.node(d.w)).x,)
      .attr('y1', d => calculateBoundaryPoint(g.node(d.v), g.node(d.w)).y)
      .attr('x2', d => calculateBoundaryPoint(g.node(d.w), g.node(d.v)).x)
      .attr('y2', d => calculateBoundaryPoint(g.node(d.w), g.node(d.v)).y)
      .attr('stroke', 'black')
      .attr('marker-end', 'url(#arrowhead)')
      .on("click", function(event, edge) {
        if (deleteMode) {
          setGraph(prevGraph => {
            const newEdges = prevGraph.edges.filter(e => !(e.sender === edge.v && e.receiver === edge.w));
            return { nodes: prevGraph.nodes, edges: newEdges };
          });
        } else {
          setSelectedEdge(edge);
          setSelectedNode(null);
        }
      });


    svg.append('defs').append('marker')
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

  }, [graph, deleteMode, highlight, highlightNodes]);

  return (
    <svg ref={svgRef} width="1800" height="1600" style={{ border: '1px solid black' }}>
      {/* ... SVG content */}
    </svg>
  );
};

export default SVGComponent;
