import React, { useState} from 'react';
import './App.css';
import SVGComponent from './SVGComponent';
import {handleValidateGraph} from './GraphFunction';
import {getRandomPosition} from './utility';

function App() {
  const [graph, setGraph] = useState({ nodes: [], edges: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [validationMessage, setValidationMessage] = useState('');
  const [detectedCycles, setdetectedCycles] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);  
  
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

return (
  <div className="app-container">
      <div className="sidebar">
        <button className="button" onClick={addNode}>Add Node</button>
        <button className="button"  onClick={addEdge}>Add Edge</button>  
        <button className="button" onClick={() => handleValidateGraph(setValidationMessage, setdetectedCycles, setIsLoading, graph)}>Validate Graph</button>
        <label className="checkbox-label">
          <input type="checkbox" id="deleteMode" checked={deleteMode} onChange={() => {
            setDeleteMode(!deleteMode);
            }} />
            <span>Delete Mode</span>
        </label>
    
      </div>
    
    <div className="main-content">
    <div className="svg-container">
      <SVGComponent
            graph={graph}
            setGraph={setGraph}
            deleteMode={deleteMode}
            setSelectedNode={setSelectedNode}
            setSelectedEdge={setSelectedEdge}
        /></div> </div>
    <div className="validation-message">
      {validationMessage} <br />
      {detectedCycles}
    </div>

  </div>
  
);
}
export default App;
