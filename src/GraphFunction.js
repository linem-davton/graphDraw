//For utility functions related to graph processing.
export const handleValidateGraph = async (setValidationMessage, setdetectedCycles, setIsLoading, graph) => {
    setIsLoading(true);
    const graphJson = generateGraphJson(graph);
    const response = await sendGraphToBackend(graphJson);
    setIsLoading(false);
    
    if (response) {
      setValidationMessage(response.validation);
      setdetectedCycles(response.cycles);
    } else {
      setValidationMessage("Error communicating with the server.");
    }
    
  };
  
const generateGraphJson = (graph) => {
    // Convert nodes to a format suitable for NetworkX (if needed)
    const nodesJson = graph.nodes.map(node => {
      return { task_id: node.id}; // Replace 'otherAttributes' with any other node data you have
    });
  
    // Convert edges to a format suitable for NetworkX
    const linksJson = graph.edges.map(edge => ({ source: edge.target, target: edge.source }));
  
    // Combine nodes and edges into a single object
    const graphJson = { nodes: nodesJson, links: linksJson };
  
    console.log("Graph JSON for NetworkX:", graphJson);
    return graphJson;
    // Here you can also send this JSON to your backend if needed
  };
  
const sendGraphToBackend = async (graphJson) => {
    try {
      const response = await fetch('http://localhost:5001/validate_graph', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(graphJson),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log("Response from backend:", data);
      return data;
    } catch (error) {
      console.error("Error sending graph to backend:", error);
      return null;
    }
  };
  
  