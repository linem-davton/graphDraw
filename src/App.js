import React, { useState, useRef, useEffect} from 'react';

import './App.css';
//import SVGComponent from './SVGComponent';
import SVGComponent from './Svgcomp2';
import {handleValidateGraph} from './GraphFunction';
import {getRandomPosition} from './utility';
import * as d3 from 'd3';
import ScheduleVisualization from './ScheduleVisualization';
//import Test1 from './Test1';



function App() {
  const [graph, setGraph] = useState({ nodes: [], edges: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [validationMessage, setValidationMessage] = useState('');
  const [detectedCycles, setdetectedCycles] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false); 
  const [highlight, setHighlight] = useState(true);
  const [jsonData, setJsonData] = useState(null);
  const [directedGraph, setDirectedGraph] = useState({ nodes: [], edges: [] });
  const [scheduleData, setScheduleData] = useState(null);
  
  const [highlightNodes, setHighlightedNodes] = useState([]);
  const fileInputRef = useRef(null);
  



  /*const addNode = () => {
    //const nodeName = prompt('Enter node name:');
    const nodeName = (graph.nodes.length );
    console.log("Node name is", nodeName)
    if (nodeName) {
      const initialX = getRandomPosition(400); // Assuming SVG width is 800
      const initialY = getRandomPosition(400); 
      setGraph(prevGraph => ({
        ...prevGraph,
        nodes: [...prevGraph.nodes, { id: nodeName.toString(), x: initialX, y: initialY }]
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
    
  };*/
  const addNode = () => {
    const nodeName = graph.nodes.length;
    const initialX = getRandomPosition(400);
    const initialY = getRandomPosition(400);
    
    const wcet_fullspeed = parseInt(prompt('Enter WCET (in milliseconds) for the new node:'));
    const mcet = parseInt(prompt('Enter MCET (in milliseconds) for the new node:'));
    const deadline = parseInt(prompt('Enter deadline (in milliseconds) for the new node:'));
    const start_time = parseInt(prompt('Enter start time (in milliseconds) for the new node:'));
  
    setGraph(prevGraph => ({
      ...prevGraph,
      nodes: [...prevGraph.nodes, { id: nodeName.toString(), x: initialX, y: initialY }]
    }));
  
    updateJsonDataWithNode(nodeName, wcet_fullspeed, mcet, deadline, start_time); // Update jsonData
  };
  
  const updateJsonDataWithNode = (nodeName, wcet_fullspeed, mcet, deadline, start_time) => {
    setJsonData(prevJsonData => ({
      ...prevJsonData,
      application: {
        ...prevJsonData.application,
        jobs: [
          ...prevJsonData.application.jobs,
          {
            id: nodeName,
            wcet_fullspeed: wcet_fullspeed,
            mcet: mcet,
            deadline: deadline,
            start_time: start_time
            // Add other necessary properties for the node
          }
        ]
      }
    }));
  };
  
  const addEdge = () => {
    const source = prompt('Enter source node:');
    const target = prompt('Enter target node:');
    
    const sourceNodeExists = graph.nodes.some(node => node.id === source);
    const targetNodeExists = graph.nodes.some(node => node.id === target);
    
    if (sourceNodeExists && targetNodeExists) {
      const size = parseInt(prompt('Enter size for the new edge (in bytes):'));
      const timetriggered = prompt('Is the edge time triggered? (true/false):').toLowerCase() === 'true';
  
      // Add the edge as provided by the user
      const edge = { source, target };
  
      setGraph(prevGraph => ({
        ...prevGraph,
        edges: [...prevGraph.edges, edge]
      }));
  
      updateJsonDataWithEdge(source, target, size, timetriggered); // Update jsonData
    } else {
      alert('One or both nodes do not exist');
    }
  };
  
  
  const updateJsonDataWithEdge = (source, target, size, timetriggered) => {
    setJsonData(prevJsonData => ({
      ...prevJsonData,
      application: {
        ...prevJsonData.application,
        messages: [
          ...prevJsonData.application.messages,
          {
            id: prevJsonData.application.messages.length,
            sender: parseInt(source),
            receiver: parseInt(target),
            size: size,
            timetriggered: timetriggered
            // Add other necessary properties for the edge
          }
        ]
      }
    }));
  };
  
 
  

const togglehighlightNodes = () => {
    // Should mark the nodes with a red outline and set the state to highlight
      setHighlight(!highlight);
      console.log("highlighting nodes", highlight);
      //const highlight_node = prompt('Enter task id:');
      //setHighlightedNodes(prevNodes => ([...prevNodes, highlight_node]));
    };


      


    const handleFileUpload = () => {
      setGraph({nodes:[],edges:[]})
      fileInputRef.current.click();
      
     
    };
  
    const handleFileChange = (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
  
      readFileContents(file);
    
    };
  
    const readFileContents = (file) => {
      const reader = new FileReader();
  
      reader.onload = (e) => {
        const contents = e.target.result;
        try {
          const parsedData = JSON.parse(contents);
          setJsonData(parsedData);
          //loadAndVisualizeGraph(parsedData);
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      };
  
      reader.readAsText(file);
      
      
    };

const displayGraph = () => {
  if (jsonData && jsonData.application && jsonData.application.jobs) {
    console.log(jsonData.application.jobs);
    const newNodes = [];
    const newEdges = [];
    jsonData.application.jobs.forEach((job) => {
      const initialX = getRandomPosition(300); 
      const initialY = getRandomPosition(200);
      const nodeid = job.id;
      console.log(nodeid);
      newNodes.push({ id: nodeid.toString(), x: initialX, y: initialY });
    });

    
    if (jsonData.application.messages) {
      jsonData.application.messages.forEach((message) => {
        const source = message.sender.toString();
        const target = message.receiver.toString();
        console.log(source, target);
        const sourceNodeExists = newNodes.some((node) => node.id === source);
        const targetNodeExists = newNodes.some((node) => node.id === target);
        console.log(sourceNodeExists, targetNodeExists);
        if (sourceNodeExists && targetNodeExists) {
          newEdges.push({ source, target });
        } else {
          alert('One or both nodes do not exist');
        }
      });
    }
    setGraph({ nodes: newNodes, edges: newEdges });
    console.log(graph)
    //console.log(jsonData)
  }
};



useEffect(() => {
  displayGraph();
}, [jsonData]);

const downloadJsonFile = () => {
  // Combine the existing jsonData with the new nodes and edges
  const combinedJsonData = {
    ...jsonData, // Existing JSON data
    // Add any new properties if necessary
  };

  // Convert the combined JSON data to a string
  const jsonString = JSON.stringify(combinedJsonData, null, 2);

  // Create a Blob containing the JSON data
  const blob = new Blob([jsonString], { type: 'application/json' });

  // Create a URL for the Blob
  const url = URL.createObjectURL(blob);

  // Create a link element
  const link = document.createElement('a');
  link.href = url;
  link.download = 'updated_data.json'; // Set the download attribute

  // Append the link to the document body
  document.body.appendChild(link);

  // Programmatically click the link to trigger the download
  link.click();

  // Remove the link from the document body
  document.body.removeChild(link);
};


const scheduleGraph = async (jsonData) => {
  console.log(jsonData)
  try {
    const response = await fetch('http://localhost:8000/schedule_jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      
      body: JSON.stringify(jsonData),
     
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
  
    setScheduleData(data);
    console.log("Response from backend:", data);
  } catch (error) {
    console.error("Error sending data to backend:", error);
  }
  
};
   
    

return (
  <div className="app-container">
      <div className="sidebar">
        <button className="button" onClick={addNode}>Add Node</button>
        <button className="button"  onClick={addEdge}>Add Edge</button>  
        <button className="button" onClick={downloadJsonFile}>Download JSON</button>

        
        <input type="file" accept=".json" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />

        <button className="button" onClick={handleFileUpload}>Upload File</button>
        <button className="button" onClick={displayGraph} >Visualize Graph</button>
  
        <button className="button" onClick={()=>scheduleGraph(jsonData)}>Schedule Graph</button>
        
        
        
        <label className="checkbox-label">
        <input type="checkbox" id="highlightMode" checked = {highlight} onClick={togglehighlightNodes}/> 
        <span>Highlight Mode</span>
        </label>
        
        <button className="button" onClick={() => handleValidateGraph(setValidationMessage, setdetectedCycles, setIsLoading, graph , highlightNodes)}>Validate Graph</button>
        
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
            highlight={highlight}
            setHighligtedNodes={setHighlightedNodes}
            highlightNodes={highlightNodes}
        />
        </div> </div>
    
         
        <div className="schedule-data">
       {/*<pre>{JSON.stringify(scheduleData, null, 2)}</pre>*/}
          {/* Visualization of schedule data */}
         <ScheduleVisualization schedules={scheduleData} />

        </div>
      
     
   
  </div>
  
);
}
export default App;
