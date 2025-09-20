export const getMapSide = (teamId: number) => {
  if (teamId === 100) {
    return "Blue";
  } else if (teamId === 200) {
    return "Red";
  } else {
    return "unknown";
  }
};


