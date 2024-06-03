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

const saveToLocalStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const loadFromLocalStorage = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

function App() {
  const [applicationModel, setApplicationModel] = useState(null);
  const [platformModel, setPlatformModel] = useState(null)
  const [deleteMode, setDeleteMode] = useState(false);
  const [jsonData, setJsonData] = useState(null);
  const [scheduleData, setScheduleData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const [highlightedTask, setHighlightedTask] = useState(null);
  const [highlightedMessage, setHighlightedMessage] = useState(null);
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
      application: applicationModel,
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

  const addTasks = () => {
    const taskId = applicationModel.tasks.length;

    const wcet = parseInt(prompt('Enter WCET (in milliseconds) for the new node:'));
    const mcet = parseInt(prompt('Enter MCET (in milliseconds) for the new node:'));
    const deadline = parseInt(prompt('Enter deadline (in milliseconds) for the new node:'));

    if (!isNaN(wcet) && !isNaN(mcet) && !isNaN(deadline)) {
      setApplicationModel(prevGraph => ({
        ...prevGraph,
        tasks: [...prevGraph.tasks, { id: taskId, wcet: wcet, mcet: mcet, deadline: deadline }]
      }));

    }
  };

  const addMessages = () => {
    const msgId = applicationModel.messages.length;
    const sender = parseInt(prompt('Enter sender node:'));
    const receiver = parseInt(prompt('Enter receiver node:'));
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
          setJsonData(parsedData);
        }
      } catch (error) {
        setErrorMessage('Upload Valid JSON')
        console.error('Error parsing JSON:', error);
      }
    };
    reader.readAsText(file);

  };

  const createGraph = () => {
    setApplicationModel(jsonData?.application);
    setPlatformModel(jsonData?.platform);
  };

  useEffect(() => {
    createGraph();
  }, [jsonData])

  useEffect(() => {
    scheduleGraph();
  }, [applicationModel, platformModel])

  const downloadJsonFile = () => {
    if (!jsonData) {
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

  const loadDefaultJSON = () => {
    setJsonData(examplejson);
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
              <button className="button" onClick={addTasks}>Add Task</button>
              <button className="button" onClick={addMessages}>Add Task Dependency</button>

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
            <SVGApplicationModel
              graph={applicationModel}
              setGraph={setApplicationModel}
              deleteMode={deleteMode}
              highlightNode={highlightedTask}
              setHighlightedNode={setHighlightedTask}
              highlightedEdge={highlightedMessage}
              setHighlightedEdge={setHighlightedMessage}
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
