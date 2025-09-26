export const getMapSide = (teamId: number) => {
  if (teamId === 100) {
    return "Blue";
  } else if (teamId === 200) {
    return "Red";
  } else {
    return "unknown";
  }
};

export const getQueueName = (description: string) => {
  if (!description) return "";

  description = description
    .replace(/\b\d+v\d+\b/gi, "")
    .replace(/\bgame\b/gi, "")
    .replace(/\bgames\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  if (description === "Ranked Solo") return "Ranked Solo/Duo";

  return description;
};

export const getMatchTimestamp = (timestamp: number) => {
  const totalSeconds = Math.floor(timestamp / 1000);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${minutes}m`;
  }
};

export const getMatchAge = (timestamp: number) => {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 1000 / 60);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min${minutes !== 1 ? "s" : ""} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days !== 1 ? "s" : ""} ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? "s" : ""} ago`;

  const years = Math.floor(days / 365);
  return `${years} year${years !== 1 ? "s" : ""} ago`;
};
