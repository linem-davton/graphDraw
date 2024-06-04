import React, { useState, useRef, useEffect } from 'react';

import Ajv from 'ajv';

import './App.css';
import SVGApplicationModel from './SVGApplicationModel';
import SVGPlatformModel from './SVGPlatformModel'
import SlidersAM from './slidersAM';
import SlidersPM from './slidersPM';
import ScheduleVisualization from './ScheduleVisualization';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import examplejson from './example1.json';
import schema from './input_schema.json';


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

const nodeTypes = ['compute', 'router', 'sensor', 'actuator'];
const link_delay = 10;
const message_size = 20;
const message_injection_time = 0;
const wcet = 10;
const mcet = 5;
const deadline = 500;

const saveToLocalStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const loadFromLocalStorage = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

function App() {
  const [applicationModel, setApplicationModel] = useState({ tasks: [], messages: [] })
  const [platformModel, setPlatformModel] = useState({ nodes: [], links: [] })
  const [deleteMode, setDeleteMode] = useState(false);
  const [scheduleData, setScheduleData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedSVG, setSelectedSVG] = useState(null);

  const [highlightedTask, setHighlightedTask] = useState(null);
  const [highlightedMessage, setHighlightedMessage] = useState(null);
  const [highlightNodePM, setHighlightedNodePM] = useState(null);
  const [highlightedEdgePM, setHighlightedEdgePM] = useState(null);
  const fileInputRef = useRef(null);
  const [savedData, setSavedData] = useState(null);

  useEffect(() => {
    const data = loadFromLocalStorage('model');
    if (data) {
      setSavedData(data);
    }
  }, []);

  const handleSave = () => {
    const dataToSave = {
      application: applicationModel,
      platform: platformModel
    };
    saveToLocalStorage('model', dataToSave);
    setSavedData(dataToSave);
  };

  const handleSavedLoad = () => {
    if (savedData) {
      setApplicationModel(savedData.application);
      setPlatformModel(savedData.platform);
    }
  };

  const loadDefaultJSON = () => {
    setApplicationModel(examplejson.application);
    setPlatformModel(examplejson.platform);
  };


  const addTasks = () => {
    const taskId = applicationModel.tasks.length
    if (!isNaN(wcet) && !isNaN(mcet) && !isNaN(deadline)) {
      setApplicationModel(prevGraph => ({
        ...prevGraph,
        tasks: [...prevGraph.tasks, { id: taskId, wcet: wcet, mcet: mcet, deadline: deadline }]
      }));

    }
  };

  const addMessages = () => {
    const msgId = applicationModel.messages.length;
    const sender = parseInt(prompt('Enter sender task:'));
    const receiver = parseInt(prompt('Enter receiver task:'));
    const sourceNodeExists = applicationModel.tasks.some(node => node.id === sender)
    const targetNodeExists = applicationModel.tasks.some(node => node.id === receiver);

    if (sourceNodeExists && targetNodeExists) {
      const size = message_size;
      const message = { id: msgId, sender: sender, receiver: receiver, size: size, message_injection_time: message_injection_time }

      if (!isNaN(size)) {
        setApplicationModel(prevGraph => ({
          ...prevGraph,
          messages: [...prevGraph.messages, message]
        }));
      }
    } else {
      alert('One or both tasks do not exist');
    }
  };

  const addNodes = () => {
    const nodeId = platformModel.nodes.length;
    const type = parseInt(prompt('Enter node type: 0-compute, 1-router, 2-sensor, 3-actuator'));
    if (isNaN(type) || type < 0 || type > 3) {
      alert('Invalid node type');
      return;
    }
    setPlatformModel(prevGraph => ({
      ...prevGraph,
      nodes: [...prevGraph.nodes, { id: nodeId, type: nodeTypes[type] }]
    }));
  };
  const addLinks = () => {
    const linkId = platformModel.links.length;
    const sender = parseInt(prompt('Enter start node:'));
    const receiver = parseInt(prompt('Enter receiver node:'));
    const sourceNodeExists = platformModel.nodes.some(node => node.id === sender)
    const targetNodeExists = platformModel.nodes.some(node => node.id === receiver);

    if (sourceNodeExists && targetNodeExists) {
      const link = { id: linkId, start_node: sender, end_node: receiver, link_delay: link_delay }

      if (!isNaN(link_delay)) {
        setPlatformModel(prevGraph => ({
          ...prevGraph,
          links: [...prevGraph.links, link]
        }));
      }
    } else {
      alert('One or both nodes do not exist');
    }

  };

  const handleFileUpload = () => {
    setHighlightedTask(null);
    setHighlightedEdgePM(null);
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
        const ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
        const validate = ajv.compile(schema);
        const valid = validate(parsedData);

        if (!valid) {
          console.log('JSON Validation errors:', validate.errors);
          setErrorMessage('JSON data does not match schema');
        } else {
          setApplicationModel(parsedData.application);
          setPlatformModel(parsedData.platform);
        }
      } catch (error) {
        setErrorMessage('Upload Valid JSON')
        console.error('Error parsing JSON:', error);
      }
    };
    reader.readAsText(file);

  };

  useEffect(() => {
    if (applicationModel.tasks.length && platformModel.nodes.length)
      scheduleGraph();
  }, [applicationModel, platformModel])

  const downloadJsonFile = () => {
    if (!applicationModel.tasks.length && !platformModel.nodes.length) {
      setErrorMessage('No JSON data to download');
      return;
    }
    const combinedJsonData = {
      application: applicationModel,
      platform: platformModel
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
    if (!applicationModel || !platformModel) {
      setErrorMessage('No jobs to schedule');
      return;
    }
    const request = {
      application: applicationModel, platform: platformModel
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
      setErrorMessage(`Error Connecting to Server`);
      console.error("Error sending data to backend:", error);
    }
  };

  const handleSVGClick = (svg) => {
    if (deleteMode) return;
    if (svg === "ApplicationModel")
      setSelectedSVG(prev => prev === "ApplicationModel" ? null : "ApplicationModel");
    else
      setSelectedSVG(prev => prev === "PlatformModel" ? null : "PlatformModel");
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="app-container">
        <div className="sidebar">
          <h1>Distributed Scheduling</h1>

          {selectedSVG === "ApplicationModel" &&
            <>
              <button className="button" onClick={addTasks}>Add Task</button>
              <button className="button" onClick={addMessages}>Add Task Dependency</button>
            </>
          }
          {selectedSVG === "PlatformModel" &&
            <>
              <button className="button" onClick={addNodes}>Add Node</button>
              <button className="button" onClick={addLinks}>Add Link</button>
            </>
          }
          {((applicationModel.tasks.length && selectedSVG === "ApplicationModel") || (platformModel.nodes.length && selectedSVG === "PlatformModel")) &&
            <>
              <Tooltip title="Enable this mode to delete nodes and edges by clicking on them.">
                <label className="checkbox-label">
                  <input type="checkbox" id="deleteMode" checked={deleteMode} onChange={() => {
                    setDeleteMode(prev => !prev);
                  }} />
                  <span>Delete Mode</span>
                </label>
              </Tooltip>
            </>
          }
          {selectedSVG === null &&
            <>
              <input type="file" accept=".json" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
              <button className="button" onClick={handleFileUpload}>Upload JSON</button>
              <button className="button" onClick={loadDefaultJSON}>Load Default JSON</button>
              {savedData && <button className="button" onClick={handleSavedLoad}>Load Last Saved</button>}
            </>
          }
          {(applicationModel.tasks.length || platformModel.nodes.length) &&
            <>
              <button className="button" onClick={downloadJsonFile}>Download JSON</button>

              <button className="button" onClick={handleSave}>Save Locally</button>
            </>}

          <footer className="navbar">
            <Typography variant="body1" align="center" className="footer-link">
              <Link href="https://eslab2docs.pages.dev/" underline="hover" target="_blank" rel="noopener noreferrer">
                Documentation
              </Link>
            </Typography>
            <Typography variant="body1" align="center" className="footer-link">
              <Link href="https://github.com/linem-davton/es-lab-task2" underline="hover" target="_blank" rel="noopener noreferrer">
                GitHub Backend
              </Link>
            </Typography>
          </footer>
        </div>

        <div className="main-content">
          <div className="svg-container">
            <h2>Application Model</h2>
            <SVGApplicationModel
              graph={applicationModel}
              setGraph={setApplicationModel}
              deleteMode={deleteMode}
              highlightNode={highlightedTask}
              setHighlightedNode={setHighlightedTask}
              highlightedEdge={highlightedMessage}
              setHighlightedEdge={setHighlightedMessage}
              onClickHandler={handleSVGClick}
              selectedSVG={selectedSVG}
            />

            {highlightedTask !== null && <SlidersAM highlightNode={highlightedTask} graph={applicationModel} setGraph={setApplicationModel} />}
            <h2>Platform Model</h2>
            <SVGPlatformModel
              graph={platformModel}
              setGraph={setPlatformModel}
              deleteMode={deleteMode}
              highlightNode={highlightNodePM}
              setHighlightedNode={setHighlightedNodePM}
              highlightedEdge={highlightedEdgePM}
              setHighlightedEdge={setHighlightedEdgePM}
              onClickHandler={handleSVGClick}
              selectedSVG={selectedSVG}
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
