import Slider from '@mui/material/Slider';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';


function SlidersPM({ highlightedEdge, graph, setGraph }) {
  const edge = graph?.links?.find(edge => edge.start_node == highlightedEdge.start_node && edge.end_node == highlightedEdge.end_node)
  if (!edge) {
    return <div></div>;
  }

  const handleSliderChange = (slider, newValue) => {
    // Update the graph state immutably
    setGraph(prevGraph => {
      // Map over nodes to find the node to update
      const updatedEdges = prevGraph.links.map(edge_ => {
        // Check if the current edge is the one to update
        if (edge_.id === edge.id) {
          // Update the specific property based on the slider
          return { ...edge_, [slider]: newValue };
        }
        return edge_; // Return other edges unmodified
      });

      // Return a new graph object with the updated nodes array
      return { ...prevGraph, links: updatedEdges };
    });
  }
  return (
    <div className='sliders'>
      <Box sx={{ width: '100%' }}>
        <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
          <span>Delay</span>
          <Slider value={edge.link_delay} min={1} max={100} step={1} color="primary"
            onChange={(_event, newValue) => handleSliderChange('link_delay', newValue)} />
          <span sx={{ color: 'text.primary' }}>{edge.link_delay}</span>
        </Stack>
        <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
          <span>Bandwidth</span>
          <Slider value={edge.bandwidth} min={1} max={100} step={1} color="primary"
            onChange={(_event, newValue) => handleSliderChange('bandwidth', newValue)} />
          <span>{edge.bandwidth}</span>
        </Stack>
      </Box>
    </div >
  );
}
export default SlidersPM;
