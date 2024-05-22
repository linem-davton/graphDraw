/*export const getRandomPosition = (max) => Math.floor(Math.random() * max)+50;



 
// utility.js
export const calculateIntersectionPoint = (sourceNode, targetNode, nodeRadius) => {
  const dx = targetNode.x - sourceNode.x;
  const dy = targetNode.y - sourceNode.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const ratio = nodeRadius / distance;

  return {
      x: sourceNode.x + dx * ratio,
      y: sourceNode.y + dy * ratio
  };
};
*/
// utility.js
export const getRandomPosition = (max) => Math.floor(Math.random() * max) + 50;

export const calculateIntersectionPoint = (sourceNode, targetNode, nodeRadius) => {
  const dx = targetNode.x - sourceNode.x;
  const dy = targetNode.y - sourceNode.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const ratio = nodeRadius / distance;

  return {
    x: sourceNode.x + dx * ratio,
    y: sourceNode.y + dy * ratio
  };
};
