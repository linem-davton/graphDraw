
export const generateRandomAM = (N, maxWCET, minWCET, minMCET, minDeadlineOffset, maxDeadline, linkProb, maxMessageSize) => {

  // generates random application model where the link probability drops as the distance between nodes increases
  const tasks = [];
  const messages = [];

  if (maxWCET < minWCET || minMCET > minWCET || maxDeadline < minDeadlineOffset + maxWCET || minDeadlineOffset < 0 || linkProb < 0 || linkProb > 1) {
    alert('Invalid Application parameters');
    console.error('Invalid Application parameters');
    return { tasks, messages };

  }
  // Create N nodes
  for (let i = 0; i < N; i++) {
    const wcet = Math.floor(Math.random() * maxWCET) + minWCET;
    const mcet = Math.floor(Math.random() * (wcet)) + minMCET;
    const deadline = Math.floor(Math.random() * maxDeadline) + minDeadlineOffset + wcet;
    tasks.push({ id: i, wcet: wcet, mcet: mcet, deadline: deadline });
  }

  // Create random edges ensuring no cycles
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      if (Math.random() < linkProb / (1 * (j - i))) {
        const size = Math.floor(Math.random() * maxMessageSize) + 1;
        messages.push({ id: j - i, sender: i, receiver: j, size: size });
      }
    }
  }

  return { tasks, messages };
};

export const generateRandomPM = (compute, routers, sensors, actuators, maxLinkDelay, minLinkDelay, maxBandwidth, minBandwidth) => {

  // Generates PM with each non router node connected to exactly one router and each router connected to the next router with the last router connected to the first router

  const nodes = [];
  const links = [];

  if (compute < 1 || routers < 1 || sensors < 1 || actuators < 1 || maxLinkDelay < minLinkDelay || maxBandwidth < minBandwidth) {
    alert('Invalid Platform parameters');
    console.error('Invalid Platform parameters');
    return { nodes, links };
  }


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

  var end_node;
  for (let i = 0; i < totalNodes; i++) {
    const link_delay = Math.floor(Math.random() * maxLinkDelay) + minLinkDelay;
    const bandwidth = Math.floor(Math.random() * maxBandwidth) + minBandwidth;
    if (nodes[i].type !== 'router') {
      end_node = Math.floor(Math.random() * (routers - 1)) + compute;
    }
    else {
      end_node = i < compute + routers - 1 ? i + 1 : compute;
    }

    links.push({ id: i, start_node: i, end_node: end_node, link_delay: link_delay, bandwidth: bandwidth, type: 'ethernet' });
  }

  return { nodes, links };
};
