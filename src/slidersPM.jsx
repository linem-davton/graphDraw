import Slider from '@mui/material/Slider';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';


function SlidersPM({ highlightedEdge, graph, setGraph }) {
  if (!graph || !graph.edges) {
    <div></div>
  }
  const edge = graph.edges.find(edge => edge.sender === highlightedEdge.sender && edge.receiver === highlightedEdge.receiver)
  const handleSliderChange = (slider, newValue) => {
    // Update the graph state immutably
    setGraph(prevGraph => {
      // Map over nodes to find the node to update
      const updatedEdges = prevGraph.edges.map(edge_ => {
        // Check if the current edge is the one to update
        if (edge_.id === edge.id) {
          // Update the specific property based on the slider
          return { ...edge_, [slider]: newValue };
        }
        return edge_; // Return other edges unmodified
      });

      // Return a new graph object with the updated nodes array
      return { ...prevGraph, edges: updatedEdges };
    });
  }
  return (
    <div className='sliders'>
      <Box sx={{ width: '100%' }}>
        <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
          <span>Delay:{edge.delay}</span>
          <Slider value={edge.delay} min={1} max={100} step={1} color="primary"
            onChange={(_event, newValue) => handleSliderChange('delay', newValue)} />
          <span sx={{ color: 'text.primary' }}>10</span>
        </Stack>
        <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
          <span>Bandwidth:{edge.bandwidth}</span>
          <Slider value={edge.bandwidth} min={1} max={100} step={1} color="primary"
            onChange={(_event, newValue) => handleSliderChange('bandwidth', newValue)} />
          <span>100</span>
        </Stack>
      </Box>
    </div >
  );
}
export default SlidersPM;
