
import Slider from '@mui/material/Slider';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import { useState } from 'react';

function Sliders() {

  const [wcet, setWcet] = useState(10);
  const [deadline, setDeadline] = useState(10);

  const resetSlider = () => {
    setWcet(10);
    setDeadline(10);
    return;
  }

  const handleSliderChange = (slider, newValue) => {
    console.log(slider, newValue);
    if (slider === 'wcet') {
      setWcet(newValue);
    } else {
      setDeadline(newValue);
    }
  }
  return (
    <div className='sliders'>
      <Box sx={{ width: '100%' }}>

        <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
          <span>WCET:{wcet}</span>
          <Slider value={wcet} min={1} max={100} step={1} color="primary"
            onChange={(_event, newValue) => handleSliderChange('wcet', newValue)} />
          <span sx={{ color: 'text.primary' }}>100</span>
        </Stack>
        <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
          <span>Deadline:{deadline}</span>
          <Slider value={deadline} min={1} max={100} step={1} color="primary"
            onChange={(_event, newValue) => handleSliderChange('deadline', newValue)} />
          <span>100</span>
        </Stack>
      </Box>
      <Button variant="contained" sx={{ margin: '30px' }} onClick={resetSlider}>Reset</Button>
    </div >
  );
}
export default Sliders;
