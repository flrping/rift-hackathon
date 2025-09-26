export type PlaystyleKey = keyof typeof PlaystyleType;
export type GameplayElementKey = keyof typeof GameplayElement;

export const PlaystyleType = {
  AGGRESSIVE: {
    name: "Aggressive",
    description:
      "You are willing to take risks to achieve your goals, and you are not afraid to make mistakes. Though these decisions may lead to a higher risk of failure.",
  },
  DEFENSIVE: {
    name: "Defensive",
    description:
      "You are more careful and cautious in your actions, and you are more likely to avoid making mistakes. Though opportunities may be missed.",
  },
  BALANCED: {
    name: "Balanced",
    description:
      "You are both risky and cautious in your actions. This though may lead to better plays being missed.",
  },
  FARMER: {
    name: "Farmer",
    description:
      "You are more focused on farming than making choices that may accelerate the game.",
  },
  OBJECTIVE_FOCUSED: {
    name: "Objective-Focused",
    description:
      "You prioritize map objectives such as towers, dragons, and barons. This creates long-term advantages but can mean sacrificing immediate fights or opportunities.",
  },
  TEAM_ORIENTED: {
    name: "Team-Oriented",
    description:
      "You prefer to group and act with your team, focusing on coordination and shared success. This strengthens team play but can reduce individual impact.",
  },
  SPLIT_PUSHER: {
    name: "Split-Pusher",
    description:
      "You focus on creating pressure in side lanes, forcing opponents to respond. This opens space for your team but can leave them outnumbered if mistimed.",
  },
  OPPORTUNIST: {
    name: "Opportunist",
    description:
      "You wait for the right moment to act, capitalizing on mistakes and low-risk plays. This reduces personal risk but can lead to missed openings.",
  },
  CONTROL: {
    name: "Control",
    description:
      "You emphasize vision, zoning, and map control to slowly strangle out the enemy’s options. This secures safer wins but can lack explosive momentum.",
  },
  CHAOTIC: {
    name: "Chaotic",
    description:
      "You thrive in unpredictable situations, constantly pressuring and forcing fights. This can overwhelm opponents, but risks throwing games if poorly timed.",
  },
};

export const GameplayElement = {
  VISION: {
    name: "Vision",
    description: "Placing wards and vision to help your team win fights.",
    abundanceOf: "Vision is always good.",
    lackOf:
      "Vision helps your team position better and see the enemy's actions. If you don't have vision, you are always at a disadvantage.",
  },
  KILLER: {
    name: "Killer",
    description:
      "Getting kills and winning fights to help your team win the game.",
    abundanceOf:
      "A lot of kills are good, but it puts a lot of pressure on you. It makes you a priority target for the enemy.",
    lackOf: "You are likely to not have much impact on the game.",
    excludes: ["CATEGORY:TANK", "ROLE:SUPPORT"],
  },
  FARMER: {
    name: "Farmer",
    description:
      "Farming minions and objectives to keep your tempo and make sure you're always in the game.",
    abundanceOf:
      "Farming is good as it always keeps you in the game. Too much farming may mean you are not fighting with your team.",
    lackOf:
      "You must be able to farm to keep yourself in the game. If you are lacking in farming, you will slowly slide into a disadvantage.",
    excludes: ["ROLE:SUPPORT"],
  },
  OBJECTIVES: {
    name: "Objectives",
    description:
      "Securing dragons, barons, towers, and other objectives to give your team long-term advantages.",
    abundanceOf:
      "Securing many objectives ensures map control and win conditions. Over-prioritizing them may lead to losing fights or forcing plays at the wrong time.",
    lackOf:
      "If you don't take objectives, the enemy will slowly gain permanent advantages and your leads will fade.",
  },
  TEAMPLAY: {
    name: "Teamplay",
    description:
      "Grouping with allies, supporting them, and making coordinated plays.",
    abundanceOf:
      "Playing heavily around your team can help win coordinated fights, but may limit your own growth if you never take resources for yourself.",
    lackOf:
      "Without teamplay, your allies may struggle to win fights and objectives, leaving the game disjointed.",
  },
  MAP_PRESSURE: {
    name: "Map Pressure",
    description:
      "Applying pressure on lanes and forcing the enemy to respond to you.",
    abundanceOf:
      "Consistently applying pressure keeps the enemy under control, but overextending may cause unnecessary deaths.",
    lackOf:
      "Without pressure, the enemy has freedom to make plays and control the map without punishment.",
  },
  SURVIVABILITY: {
    name: "Survivability",
    description:
      "Staying alive, avoiding unnecessary deaths, and keeping your gold/XP safe.",
    abundanceOf:
      "Not dying keeps your team’s power stable, but playing too safe may mean missing opportunities to win fights.",
    lackOf:
      "Frequent deaths give the enemy gold and momentum, weakening your entire team.",
  },
};
