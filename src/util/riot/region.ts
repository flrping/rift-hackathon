export function getRegion(platform: string): string {
  switch (platform) {
    case "NA1":
    case "BR1":
    case "LA1":
    case "LA2":
      return "americas";
    case "EUW1":
    case "EUN1":
    case "TR1":
    case "RU":
      return "europe";
    case "KR":
    case "JP1":
      return "asia";
    case "PH2":
    case "SG2":
    case "TH2":
    case "TW2":
    case "VN2":
    case "OC1":
      return "sea";
    default:
      return "none";
  }
}
