import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { getRandomPosition, calculateIntersectionPoint } from './utility';

const SVGComponent = ({ graph, setGraph, deleteMode, setSelectedNode, setSelectedEdge, highlight, setHighligtedNodes, highlightNodes }) => {
    const svgRef = useRef();

    let dragStartPosition = { x: null, y: null };

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
        const minDistance = 40; // Minimum distance to maintain between nodes
        const updatedNodes = graph.nodes.map(node => {
            if (node.id !== d.id) {
                const distance = Math.sqrt((node.x - event.x) ** 2 + (node.y - event.y) ** 2);
                if (distance < minDistance) {
                    // Calculate new positions to prevent overlap
                    const angle = Math.atan2(node.y - event.y, node.x - event.x);
                    const newX = event.x + minDistance * Math.cos(angle);
                    const newY = event.y + minDistance * Math.sin(angle);
                    return { ...node, x: newX, y: newY };
                }
            }
            return node;
        });
        
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
    const detectCollision = (node1, node2) => {
        const nodeRadius = 20;
        const dx = node1.x - node2.x;
        const dy = node1.y - node2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < 2 * nodeRadius; // Assuming nodeRadius is the radius of your nodes
    };
    
    // Function to adjust node positions to prevent collisions
    const avoidCollisions = nodes => {
        const nodeRadius = 20;
        const padding = 10; // Padding to ensure nodes don't overlap after adjustment
    
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                if (detectCollision(nodes[i], nodes[j])) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    const angle = Math.atan2(dy, dx);
                    const overlap = 2 * nodeRadius - Math.sqrt(dx * dx + dy * dy) + padding;
                    nodes[i].x += overlap / 2 * Math.cos(angle);
                    nodes[i].y += overlap / 2 * Math.sin(angle);
                    nodes[j].x -= overlap / 2 * Math.cos(angle);
                    nodes[j].y -= overlap / 2 * Math.sin(angle);
                }
            }
        }
        return nodes;
    };

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove(); // Clear previous render

        const nodeRadius = 20;
        const updatedNodes = avoidCollisions(graph.nodes);
        svg.selectAll("circle")
            .data(graph.nodes, d => d.id)
            .join(
                enter => enter.append("circle")
                    .attr("r", nodeRadius)
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y)
                    .classed("highlighted-circle", d => highlightNodes.includes(d.id))
                    .call(d3.drag()
                        .on("start", onDragStart)
                        .on("drag", onDrag)
                        .on("end", onDragEnd)),
                update => update
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y),
                exit => exit.remove()
            );

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
                return sourceNode && targetNode ? calculateIntersectionPoint(targetNode, sourceNode, nodeRadius).x : 0;
            })
            .attr("y2", edge => {
                const sourceNode = graph.nodes.find(node => node.id === edge.source);
                const targetNode = graph.nodes.find(node => node.id === edge.target);
                return sourceNode && targetNode ? calculateIntersectionPoint(targetNode, sourceNode, nodeRadius).y : 0;
            })
            .attr('marker-end', 'url(#arrowhead)')
            .style("stroke", "black")
            .style("stroke-width", 2)
            .on("click", function(event, edge) {
                if (deleteMode) {
                    setGraph(prevGraph => {
                        const newEdges = prevGraph.edges.filter(e => e !== edge);
                        return { ...prevGraph, edges: newEdges };
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
    }, [graph, deleteMode, highlightNodes]);

    return (
        <svg ref={svgRef} width="800" height="600" style={{ border: '1px solid black' }}>
            {/* ... SVG content */}
        </svg>
    );
};

export default SVGComponent;
