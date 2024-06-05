
export const generateRandomAM = (N) => {
  const tasks = [];
  const messages = [];
  const maxWCET = 100;
  const minWCET = 1;
  const minMCET = 1;
  const minDeadlineOffset = 10; // Minimum difference between WCET and deadline
  const maxDeadline = 1000;
  const linkProb = 0.5;
  const maxMessageSize = 50;

  // input validation
  if (minMCET > minWCET || maxWCET < minWCET || maxDeadline < minDeadlineOffset + minWCET) {
    return { tasks, messages }
  }

  // Create N nodes
  for (let i = 0; i < N; i++) {
    const wcet = Math.floor(Math.random() * maxWCET) + minWCET;
    const mcet = Math.floor(Math.random() * (wcet / 2)) + minMCET;
    const deadline = Math.floor(Math.random() * maxDeadline) + wcet;
    tasks.push({ id: i, wcet: wcet, mcet: mcet, deadline: deadline });
  }

  // Create random edges ensuring no cycles
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      if (Math.random() > linkProb) {
        const size = Math.floor(Math.random() * maxMessageSize) + 1;
        messages.push({ id: j - i, sender: i, receiver: j, size: size });
      }
    }
  }

  return { tasks, messages };
};

export const generateRandomPM = (compute, routers, sensors, actuators) => {

  const nodes = [];
  const links = [];
  const linkProb = 0.5;
  const maxLinkDelay = 100;
  const minLinkDelay = 1;
  const maxBandwidth = 100;
  const minBandwidth = 1;

  const totalNodes = compute + routers + sensors + actuators;
  for (let i = 0; i < totalNodes; i++) {
    if (i < compute) {
      nodes.push({ id: i, type: 'compute' });
    }
    else if (i < compute + routers) {
      nodes.push({ id: i, type: 'router' });
    }
    else if (i < compute + routers + sensors) {
      nodes.push({ id: i, type: 'sensor' });
    }
    else {
      nodes.push({ id: i, type: 'actuator' });
    }
  }

  for (let i = 0; i < totalNodes; i++) {
    if (nodes[i].type === 'router') {
      for (let j = 0; j < totalNodes; j++) {
        if (i !== j && Math.random() > linkProb) {
          const link_delay = Math.floor(Math.random() * maxLinkDelay) + minLinkDelay;
          const bandwidth = Math.floor(Math.random() * maxBandwidth) + minBandwidth;
          links.push({ id: j - i, start_node: i, end_node: j, link_delay: link_delay, bandwidth: bandwidth, type: 'ethernet' });
        }
      }
    }
  }
  console.log({ nodes, links });

  return { nodes, links };
};
