
import Slider from '@mui/material/Slider';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';


function SlidersAM({ highlightNode, graph, setGraph }) {
  const highlightedNode = graph.tasks.find(node => node.id === highlightNode)
  if (!graph || highlightNode == null) {
    return (<div></div>);
  }


  const handleSliderChange = (slider, newValue) => {
    // Update the graph state immutably
    setGraph(prevGraph => {
      // Map over nodes to find the node to update
      const updatedNodes = prevGraph.tasks.map(node => {
        // Check if the current node is the one to update
        if (node.id === highlightNode) {
          // Update the specific property (wcet or deadline) based on the slider
          return { ...node, [slider]: newValue };
        }
        return node; // Return other nodes unmodified
      });

      // Return a new graph object with the updated nodes array
      return { ...prevGraph, tasks: updatedNodes };
    });
  }
  return (
    <div className='sliders'>
      <Box sx={{ width: '100%' }}>
        <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
          <span>WCET</span>
          <Slider value={highlightedNode.wcet} min={1} max={100} step={1} color="primary"
            onChange={(_event, newValue) => handleSliderChange('wcet', newValue)} />
          <span sx={{ color: 'text.primary' }}>{highlightedNode.wcet}</span>
        </Stack>
        <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
          <span>Deadline</span>
          <Slider value={highlightedNode.deadline} min={1} max={1000} step={1} color="primary"
            onChange={(_event, newValue) => handleSliderChange('deadline', newValue)} />
          <span>{highlightedNode.deadline}</span>
        </Stack>
      </Box>
    </div >
  );
}
export default SlidersAM;
