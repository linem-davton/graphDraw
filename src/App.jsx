import React, { useState, useRef, useEffect } from 'react';

import './App.css';
import SVGComponent from './SVGComponent';
import SVGPlatformModel from './SVGPlatformModel'
import Sliders from './sliders';
import SlidersPM from './slidersPM';
import ScheduleVisualization from './ScheduleVisualization';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import examplejson from './example1.json';


const theme = createTheme({
  palette: {
    primary: {
      main: '#00b894',
    },
    secondary: {
      main: '#00b894',
    },
    background: {
      default: '#2d3436',
    },
    text: {
      primary: '#dfe6e9',
    }
  },

});

const saveToLocalStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const loadFromLocalStorage = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

function App() {
  const [graph, setGraph] = useState({ nodes: [], edges: [] });
  const [platformModel, setPlatformModel] = useState(null)
  const [deleteMode, setDeleteMode] = useState(false);
  const [jsonData, setJsonData] = useState(null);
  const [scheduleData, setScheduleData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const [highlightNode, setHighlightedNode] = useState(null);
  const [highlightedEdge, setHighlightedEdge] = useState(null);
  const [highlightNodePM, setHighlightedNodePM] = useState(null);
  const [highlightedEdgePM, setHighlightedEdgePM] = useState(null);
  const fileInputRef = useRef(null);
  const [savedData, setSavedData] = useState(null);
  const message_size = 20;
  const message_injection_time = 0;

  useEffect(() => {
    const data = loadFromLocalStorage('model');
    if (data) {
      setSavedData(data);
    }
  }, []);

  const handleSave = () => {
    const dataToSave = {
      application: { tasks: graph.nodes, messages: graph.edges },
      platform: platformModel
    };
    saveToLocalStorage('model', dataToSave);
    setSavedData(dataToSave);
  };

  const handleSavedLoad = () => {
    if (savedData) {
      setJsonData(savedData);
    }
  };

  const addNode = () => {
    const nodeId = graph.nodes.length;

    const wcet = parseInt(prompt('Enter WCET (in milliseconds) for the new node:'));
    const mcet = parseInt(prompt('Enter MCET (in milliseconds) for the new node:'));
    const deadline = parseInt(prompt('Enter deadline (in milliseconds) for the new node:'));

    if (!isNaN(wcet) && !isNaN(mcet) && !isNaN(deadline)) {
      setGraph(prevGraph => ({
        ...prevGraph,
        nodes: [...prevGraph.nodes, { id: nodeId.toString(), wcet: wcet, mcet: mcet, deadline: deadline }]
      }));

    }
  };

  const addEdge = () => {
    const msgId = graph.edges.length;
    const sender = prompt('Enter sender node:');
    const receiver = prompt('Enter receiver node:');
    const sourceNodeExists = graph.nodes.some(node => node.id === sender)
    const targetNodeExists = graph.nodes.some(node => node.id === receiver);

    if (sourceNodeExists && targetNodeExists) {
      const size = message_size;
      const edge = { id: msgId.toString(), sender: sender, receiver: receiver, size: size, message_injection_time: message_injection_time }

      if (!isNaN(size)) {
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
    if (jsonData?.application?.tasks) {
      const newNodes = [];
      const newEdges = [];
      jsonData.application.tasks.forEach((task) => {
        const nodeid = task.id;
        const wcet = task.wcet;
        const mcet = task.mcet;
        const deadline = task.deadline;
        newNodes.push({ id: nodeid.toString(), wcet: wcet, mcet: mcet, deadline: deadline });
      });

      if (jsonData?.application?.messages) {
        jsonData.application.messages.forEach((message) => {
          const sender = message.sender.toString();
          const receiver = message.receiver.toString();
          const size = message.size;
          const id = message.id;
          const injection_time = message.injection_time;
          const senderNodeExists = newNodes.some((node) => node.id === sender);
          const receiverNodeExists = newNodes.some((node) => node.id === receiver);
          if (senderNodeExists && receiverNodeExists) {
            newEdges.push({ id: id, sender: sender, receiver: receiver, size: size, injection_time: injection_time })
          } else {
            alert('One or both nodes do not exist');
          }
        });
      }
      setGraph({ nodes: newNodes, edges: newEdges });
    }
    setPlatformModel(jsonData?.platform);
  };

  useEffect(() => {
    createGraph();
  }, [jsonData])

  useEffect(() => {
    scheduleGraph();

  }, [graph, platformModel])

  const downloadJsonFile = () => {
    // Combine the existing jsonData with the new nodes and edges
    if (!jsonData) {
      setErrorMessage('No JSON data to download');
      return;
    }
    const combinedJsonData = {
      application: { tasks: graph.nodes, messages: graph.edges },
      platform: platformModel
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

  const loadDefaultJSON = () => {
    setJsonData(examplejson);
    createGraph();
  };


  const scheduleGraph = async () => {
    if (graph.nodes.length === 0) {
      setErrorMessage('No jobs to schedule');
      return;
    }
    const request = {
      application: { tasks: graph.nodes, messages: graph.edges }, platform: platformModel
    };

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
    <ThemeProvider theme={theme}>
      <div className="app-container">
        <div className="sidebar">
          <h1>Distributed Scheduling</h1>

          {jsonData &&
            <>
              <button className="button" onClick={addNode}>Add Task</button>
              <button className="button" onClick={addEdge}>Add Task Dependency</button>

              <Tooltip title="Enable this mode to delete nodes and edges by clicking on them.">
                <label className="checkbox-label">
                  <input type="checkbox" id="deleteMode" checked={deleteMode} onChange={() => {
                    setDeleteMode(prev => !prev);
                  }} />
                  <span>Delete Mode</span>
                </label>
              </Tooltip>
              <button className="button" onClick={downloadJsonFile}>Download JSON</button>
            </>
          }
          <input type="file" accept=".json" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
          <button className="button" onClick={handleFileUpload}>Upload JSON</button>
          <button className="button" onClick={loadDefaultJSON}>Load Default JSON</button>
          {jsonData && <button className="button" onClick={handleSave}>Save Locally</button>}
          {savedData && <button className="button" onClick={handleSavedLoad}>Load Last Saved</button>}
          <footer style={{ padding: '20px 0', marginTop: 'auto' }}>
            <Container maxWidth="sm">
              <Typography variant="body1" align="center">
                <Link href="https://eslab2docs.pages.dev/" underline="hover" target="_blank" rel="noopener noreferrer">
                  Documentation
                </Link>
              </Typography>
              <Typography variant="body1" align="center">
                <Link href="https://github.com/linem-davton/es-lab-task2" underline="hover" target="_blank" rel="noopener noreferrer">
                  GitHub Backend
                </Link>
              </Typography>
              <Typography variant="body1" align="center">
                <Link href="https://github.com/linem-davton/graphdraw-frontend" underline="hover" target="_blank" rel="noopener noreferrer">
                  GitHub Frontend
                </Link>
              </Typography>
            </Container>
          </footer>
        </div>

        <div className="main-content">
          <div className="svg-container">
            <h2>Application Model</h2>
            <SVGComponent
              graph={graph}
              setGraph={setGraph}
              deleteMode={deleteMode}
              highlightNode={highlightNode}
              setHighlightedNode={setHighlightedNode}
              highlightedEdge={highlightedEdge}
              setHighlightedEdge={setHighlightedEdge}
            />

            {highlightNode !== null && <Sliders highlightNode={highlightNode} graph={graph} setGraph={setGraph} />}
            <h2>Platform Model</h2>
            <SVGPlatformModel
              graph={platformModel}
              setGraph={setPlatformModel}
              deleteMode={deleteMode}
              highlightNode={highlightNodePM}
              setHighlightedNode={setHighlightedNodePM}
              highlightedEdge={highlightedEdgePM}
              setHighlightedEdge={setHighlightedEdgePM}
            />
            {highlightedEdgePM && <SlidersPM highlightedEdge={highlightedEdgePM} graph={platformModel} setGraph={setPlatformModel} />}
          </div>

          {scheduleData &&
            <div className="schedule-data">
              <ScheduleVisualization schedules={scheduleData} />
            </div>}
        </div>

      </div >
      {errorMessage &&
        <div className="error-message">
          {errorMessage}
        </div>}

    </ThemeProvider>

  );
}
export default App;
