export const getRandomPosition = (max) => Math.floor(Math.random() * max);
 
export const calculateIntersectionPoint = (source, target, nodeRadius) => {
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const ratio = (distance - nodeRadius) / distance;

  const x = source.x + ratio * dx;
  const y = source.y + ratio * dy;
  return { x, y };
};