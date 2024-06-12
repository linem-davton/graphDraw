import React, { useState, useRef, useEffect } from 'react';

export const ApplicationModal = ({ isOpen, onClose, onSubmit }) => {
  const [N, setN] = useState(5);
  const [maxWCET, setMaxWCET] = useState(100);
  const [minWCET, setMinWCET] = useState(1);
  const [minMCET, setMinMCET] = useState(1);
  const [minDeadlineOffset, setMinDeadlineOffset] = useState(10);
  const [maxDeadline, setMaxDeadline] = useState(1000);
  const [linkProb, setLinkProb] = useState(0.5);
  const [maxMessageSize, setMaxMessageSize] = useState(50);

  const TaskInputRef = useRef(null);  // Create a ref for the input field

  useEffect(() => {
    if (isOpen && TaskInputRef.current) {
      TaskInputRef.current.focus();  // Set focus when modal opens
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit({ N, maxWCET, minWCET, minMCET, minDeadlineOffset, maxDeadline, linkProb, maxMessageSize });
    onClose();
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Enter Application Parameters</h2>
        <form onSubmit={handleSubmit}>
          <div className='modal-inputs'>
            <span className='modal-field'>Tasks</span>
            <input type="number" value={N} onChange={e => setN(Math.abs(parseInt(e.target.value, 10)) || 0)} placeholder="Enter Number of Tasks" ref={TaskInputRef} />

            <span className='modal-field'>Max WCET</span>
            <input type="number" value={maxWCET} onChange={e => setMaxWCET(Math.abs(parseInt(e.target.value, 10)) || 0)} />

            <span className='modal-field'>Min WCET</span>
            <input type="number" value={minWCET} onChange={e => setMinWCET(Math.abs(parseInt(e.target.value, 10)) || 0)} />

            <span className='modal-field'>Min MCET</span>
            <input type="number" value={minMCET} onChange={e => setMinMCET(Math.abs(parseInt(e.target.value, 10)) || 0)} />

            <span className='modal-field'>Deadline-WCET Offset</span>
            <input type="number" value={minDeadlineOffset} onChange={e => setMinDeadlineOffset(Math.abs(parseInt(e.target.value, 10)) || 0)} />

            <span className='modal-field'>Max Deadline</span>
            <input type="number" value={maxDeadline} onChange={e => setMaxDeadline(Math.abs(parseInt(e.target.value, 10)) || 0)} />

            <span className='modal-field'>Link Probability</span>
            <input type="number" value={linkProb} step="0.01" onChange={e => setLinkProb(Math.abs(parseFloat(e.target.value)) || 0)} />

            <span className='modal-field'>Max Message Size</span>
            <input type="number" value={maxMessageSize} onChange={e => setMaxMessageSize(Math.abs(parseInt(e.target.value, 10)) || 0)} />
          </div>

          <button className="button" type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export const PlatformModal = ({ isOpen, onClose, onSubmit }) => {
  const [compute, setCompute] = useState(6);
  const [routers, setRouters] = useState(3);
  const [sensors, setSensors] = useState(2);
  const [actuators, setActuators] = useState(2);
  const [maxLinkDelay, setMaxLinkDelay] = useState(100);
  const [minLinkDelay, setMinLinkDelay] = useState(1);
  const [maxBandwidth, setMaxBandwidth] = useState(100);
  const [minBandwidth, setMinBandwidth] = useState(1);
  const computeInputRef = useRef(null);  // Create a ref for the input field

  useEffect(() => {
    if (isOpen && computeInputRef.current) {
      computeInputRef.current.focus();  // Set focus when modal opens
    }
  }, [isOpen]);

  if (!isOpen) return null;


  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit({
      compute,
      routers,
      sensors,
      actuators,
      maxLinkDelay,
      minLinkDelay,
      maxBandwidth,
      minBandwidth
    });
    onClose();
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Enter Platform Parameters</h2>
        <form onSubmit={handleSubmit}>
          <div className='modal-inputs'>
            <span className='modal-field'>Compute Nodes</span>
            <input type="number" value={compute} onChange={e => setCompute(Math.abs(parseInt(e.target.value, 10)) || 0)} placeholder="Enter number of Compute Nodes" ref={computeInputRef} />

            <span className='modal-field'>Routers</span>
            <input type="number" value={routers} onChange={e => setRouters(Math.abs(parseInt(e.target.value, 10)) || 0)} placeholder="Enter number of Routers" />

            <span className='modal-field'>Sensors</span>
            <input type="number" value={sensors} onChange={e => setSensors(Math.abs(parseInt(e.target.value, 10)) || 0)} placeholder="Enter number of Sensors" />

            <span className='modal-field'>Actuators</span>
            <input type="number" value={actuators} onChange={e => setActuators(Math.abs(parseInt(e.target.value, 10)) || 0)} placeholder="Enter number of Actuators" />

            <span className='modal-field'>Max Link Delay</span>
            <input type="number" value={maxLinkDelay} onChange={e => setMaxLinkDelay(Math.abs(parseInt(e.target.value, 10)) || 0)} />

            <span className='modal-field'>Min Link Delay</span>
            <input type="number" value={minLinkDelay} onChange={e => setMinLinkDelay(Math.abs(parseInt(e.target.value, 10)) || 0)} />

            <span className='modal-field'>Max Bandwidth</span>
            <input type="number" value={maxBandwidth} onChange={e => setMaxBandwidth(Math.abs(parseInt(e.target.value, 10)) || 0)} />

            <span className='modal-field'>Min Bandwidth</span>
            <input type="number" value={minBandwidth} onChange={e => setMinBandwidth(Math.abs(parseInt(e.target.value, 10)) || 0)} />
          </div>

          <button className="button" type="submit">Submit</button>
        </form>
      </div>
    </div >
  );
};

