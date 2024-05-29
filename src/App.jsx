import React, { useState, useRef, useEffect } from 'react';

import './App.css';
import SVGComponent from './SVGComponent';
import ScheduleVisualization from './ScheduleVisualization';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';

function App() {
  const [graph, setGraph] = useState({ nodes: [], edges: [] });
  const [deleteMode, setDeleteMode] = useState(false);
  const [jsonData, setJsonData] = useState(null);
  const [scheduleData, setScheduleData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const [highlightNode, setHighlightedNode] = useState(null);
  const fileInputRef = useRef(null);

  const message_size = 20;


  const addNode = () => {
    const nodeName = graph.nodes.length;

    const wcet_fullspeed = parseInt(prompt('Enter WCET (in milliseconds) for the new node:'));
    const mcet = parseInt(prompt('Enter MCET (in milliseconds) for the new node:'));
    const deadline = parseInt(prompt('Enter deadline (in milliseconds) for the new node:'));

    if (wcet_fullspeed !== null && mcet !== null && deadline !== null) {

      setGraph(prevGraph => ({
        ...prevGraph,
        nodes: [...prevGraph.nodes, { id: nodeName.toString(), wcet: wcet_fullspeed, mcet: mcet, deadline: deadline }]
      }));

    }
  };

  const addEdge = () => {
    const sender = prompt('Enter sender node:');
    const receiver = prompt('Enter receiver node:');
    const sourceNodeExists = graph.nodes.some(node => node.id === sender)
    const targetNodeExists = graph.nodes.some(node => node.id === receiver);

    if (sourceNodeExists && targetNodeExists) {
      const size = message_size;
      const edge = { sender: sender, receiver: receiver, size: size }

      if (size !== null) {
        setGraph(prevGraph => ({
          ...prevGraph,
          edges: [...prevGraph.edges, edge]
        }));

        // updateJsonDataWithEdge(source, target, size); // Update jsonData
      }
    } else {
      alert('One or both nodes do not exist');
    }
  };




  const handleFileUpload = () => {
    setHighlightedNode(null);
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
        // to do  Validate the JSON data to schema before setting the state
        setJsonData(parsedData);
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    };

    reader.readAsText(file);


  };

  const createGraph = () => {
    if (jsonData && jsonData.application && jsonData.application.jobs) {
      console.log(jsonData.application.jobs);
      const newNodes = [];
      const newEdges = [];
      jsonData.application.jobs.forEach((job) => {
        const nodeid = job.id;
        const wcet = job.wcet_fullspeed;
        const mcet = job.mcet;
        const deadline = job.deadline;
        console.log(nodeid);
        newNodes.push({ id: nodeid.toString(), wcet: wcet, mcet: mcet, deadline: deadline });
      });


      if (jsonData.application.messages) {
        jsonData.application.messages.forEach((message) => {
          const sender = message.sender.toString();
          const receiver = message.receiver.toString();
          const size = message.size;
          const senderNodeExists = newNodes.some((node) => node.id === sender);
          const receiverNodeExists = newNodes.some((node) => node.id === receiver);
          if (senderNodeExists && receiverNodeExists) {
            newEdges.push({ sender: sender, receiver: receiver, size: size })
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
    createGraph();
  }, [jsonData])

  const downloadJsonFile = () => {
    // Combine the existing jsonData with the new nodes and edges
    const combinedJsonData = {
      application: { jobs: graph.nodes, messages: graph.edges }, // Existing JSON data
      platfrom: jsonData["platform"]
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


  const scheduleGraph = async () => {
    if (graph.nodes.length === 0) {
      alert('No jobs to schedule');
      return;
    }
    const request = { application: { jobs: graph.nodes, messages: graph.edges }, platform: jsonData.platform };

    try {
      const response = await fetch('http://localhost:8000/schedule_jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify(request)

      });

      if (!response.ok) {
        setErrorMessage(`HTTP error! status: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setScheduleData(() => {
        setErrorMessage('')
        return data
      });
      console.log("Response from backend:", data);
    } catch (error) {
      setErrorMessage(`${error}`);
      console.error("Error sending data to backend:", error);
    }
  };

  return (
    <>
      <div className="app-container">
        <div className="sidebar">
          <button className="button" onClick={addNode}>Add Node</button>
          <button className="button" onClick={addEdge}>Add Edge</button>
          <button className="button" onClick={downloadJsonFile}>Download JSON</button>


          <input type="file" accept=".json" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />

          <button className="button" onClick={handleFileUpload}>Upload JSON</button>

          <button className="button" onClick={() => scheduleGraph()}>Schedule Graph</button>

          <label className="checkbox-label">
            <input type="checkbox" id="deleteMode" checked={deleteMode} onChange={() => {
              setDeleteMode(prev => !prev);
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
              highlightNode={highlightNode}
              setHighlightedNode={setHighlightedNode}
            />
            <footer style={{ padding: '20px 0', marginTop: 'auto' }}>
              <Container maxWidth="sm">
                <Typography variant="body1" align="center">
                  <Link href="https://github.com/linem-davton/graphdraw-frontend" underline="hover" sx={{ padding: '20px' }} target="_blank" rel="noopener noreferrer">GitHub Frontend</Link>
                  <Link href="https://github.com/linem-davton/es-lab-task2" underline="hover" sx={{ padding: '20px' }} target="_blank" rel="noopener noreferrer">GitHub Backend</Link>
                  <Link href="https://eslab2docs.pages.dev/" underline="hover" sx={{ padding: '20px' }} target="_blank" rel="noopener noreferrer">Task Documentation </Link>
                </Typography>
              </Container>
            </footer>
          </div>


          <div className="schedule-data">
            <ScheduleVisualization schedules={scheduleData} />

          </div>
        </div>


      </div >
      {errorMessage &&
        <div className="error-message">
          {errorMessage}
        </div>}
    </>

  );
}
export default App;
