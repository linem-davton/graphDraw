import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

import {handleValidateGraph} from './GraphFunction';

function App() {
  const [graph, setGraph] = useState({ nodes: [], edges: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [validationMessage, setValidationMessage] = useState('');
  const [detectedCycles, setdetectedCycles] = useState('');

  const [deleteMode, setDeleteMode] = useState(false);

  const svgRef = useRef();

  const getRandomPosition = (max) => Math.floor(Math.random() * max);
 
  const calculateIntersectionPoint = (source, target, nodeRadius) => {
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const ratio = (distance - nodeRadius) / distance;
  
    const x = source.x + ratio * dx;
    const y = source.y + ratio * dy;
    return { x, y };
  };

  const addNode = () => {
    const nodeName = prompt('Enter node name:');
    if (nodeName) {
      const initialX = getRandomPosition(800); // Assuming SVG width is 800
      const initialY = getRandomPosition(600); 
      setGraph(prevGraph => ({
        ...prevGraph,
        nodes: [...prevGraph.nodes, { id: nodeName, x: initialX, y: initialY }]
      }));
    }
    console.log("Added node with nodeName id");
  };

  const addEdge = () => {
    const target = prompt('Enter source node:');
    const source = prompt('Enter target node:');
    
    const sourceNodeExists = graph.nodes.some(node => node.id === source);
    const targetNodeExists = graph.nodes.some(node => node.id === target);
    
    if (sourceNodeExists && targetNodeExists) {
      setGraph(prevGraph => ({
        ...prevGraph,
        edges: [...prevGraph.edges, { source, target }]
      }));
    } else {
      alert('One or both nodes do not exist');
    }
    
  };
  
  
  let dragStartPosition = { x: null, y: null };

  // Drag handlers
  const onDragStart = (event, d) => {
      d3.select(event.sourceEvent.target).raise(); // Bring to front
      dragStartPosition = { x: event.x, y: event.y };
    };
  
  const onDrag = (event, d) => {

      d.x = event.x;
      d.y = event.y;
      d3.select(event.sourceEvent.target)
        .attr('cx', d.x)
        .attr('cy', d.y);
    };

  const onDragEnd = (event, d) => {
        const dx = event.x - dragStartPosition.x;
        const dy = event.y - dragStartPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
      
        if (distance < 5) {  // Threshold for treating the action as a click
          if (deleteMode) {
            setGraph(prevGraph => {
              const newNodes = prevGraph.nodes.filter(node => node.id !== d.id);
              const newEdges = prevGraph.edges.filter(edge => edge.source !== d.id && edge.target !== d.id);
              return { nodes: newNodes, edges: newEdges };
            });
          }
        }

      // Update node position in state if necessary
      setGraph(prevGraph => {
        const updatedNodes = prevGraph.nodes.map(node => {
          if (node.id === d.id) {
            return { ...node, x: event.x, y: event.y};
          }
          return node;
        });
        return { ...prevGraph, nodes: updatedNodes };
      });
    };

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    
    const nodeRadius = 20;
    // Render nodes
  svg.selectAll("circle")
    .data(graph.nodes, d => d.id)
    .join(
      enter => enter.append("circle")
        .attr("r", nodeRadius)
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        // ... rest of the node styling and event handlers
        .call(d3.drag()
        .on("start", onDragStart)
        .on("drag", onDrag)
        .on("end", onDragEnd)),

      update => update
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        // ... update existing nodes if necessary
      ,
      exit => exit.remove() // Remove DOM elements for deleted nodes
    )
   

  // Render node labels
  svg.selectAll("text")
    .data(graph.nodes)
    .enter()
    .append("text")
    .attr("x", d => d.x)
    .attr("y", d => d.y)
    .attr("dy", ".35em") // Vertically center text
    .attr("text-anchor", "middle") // Horizontally center text
    .text(d => d.id)
    .style("fill", "white")
    .style("font-size", "20px");

  
  // Render edges
  svg.selectAll("line")
    .data(graph.edges)
    .enter()
    .append("line")
    .attr("x1", edge => {
      const sourceNode = graph.nodes.find(node => node.id === edge.source);
      const targetNode = graph.nodes.find(node => node.id === edge.target);
      return sourceNode && targetNode ? calculateIntersectionPoint(sourceNode, targetNode, nodeRadius).x : 0;
    })
    .attr("y1", edge => {
      const sourceNode = graph.nodes.find(node => node.id === edge.source);
      const targetNode = graph.nodes.find(node => node.id === edge.target);
      return sourceNode && targetNode ? calculateIntersectionPoint(sourceNode, targetNode, nodeRadius).y : 0;
    })
    .attr("x2", edge => {
      const sourceNode = graph.nodes.find(node => node.id === edge.source);
      const targetNode = graph.nodes.find(node => node.id === edge.target);
      return calculateIntersectionPoint(targetNode, sourceNode, nodeRadius).x;
    })
    .attr("y2", edge => {
      const sourceNode = graph.nodes.find(node => node.id === edge.source);
      const targetNode = graph.nodes.find(node => node.id === edge.target);
      return calculateIntersectionPoint(targetNode, sourceNode, nodeRadius).y;
    })
    .attr('marker-end', 'url(#arrowhead)')
    .style("stroke", "black")
    .style("stroke-width", 2)
    .on("click", d => {
      console.log("Edge clicked", d);
      setSelectedEdge(d);
      setSelectedNode(null); // Deselect any selected node
    });

  // ... Any additional rendering logic
  // Define the arrowhead marker
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




}, [graph]);


return (
  <div>
    <button onClick={addNode}>Add Node</button>
    <button onClick={addEdge}>Add Edge</button>
    <label>
      <input
        type="checkbox"
        checked={deleteMode}
        onChange={() => {
          console.log("Before toggling, deleteMode is:", deleteMode);
          setDeleteMode(!deleteMode);
        }}
      />
      Delete Mode
    </label>
    <button onClick={() => handleValidateGraph(setValidationMessage, setdetectedCycles, graph)}>Validate Graph</button>
    <svg ref={svgRef} width="800" height="600" style={{ border: '1px solid black' }}></svg>
    <div>
      {validationMessage}
      {detectedCycles}
    </div>

  </div>

  
);
}

export default App;
