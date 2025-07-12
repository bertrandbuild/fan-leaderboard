export interface TweetUser {
  name: string
  username: string
  avatar: string
  tokens: string
}

export interface TweetEngagement {
  likes: number
  comments: number
  retweets: number
  shares: number
}

export interface Tweet {
  user: TweetUser
  content: string
  time: string
  engagement: TweetEngagement
  score: number
  boost: string
  celebrities: string[]
}

export interface TopYapper {
  rank: number
  name: string
  username: string
  totalYaps: number
  earnedYaps: number
  referralYaps: number
  smartFollowers: number
  followers: number
  smartPercentage: number
  score: string
  change: string
  avatar?: string
}

export interface Celebrity {
  name: string
  username: string
  team: string
  weight: string
}

export interface MindshareGainer {
  name: string
  symbol: string
  current: number
  change1d: number
  change7d: number
  percentage: number
  color: string
}

export interface UserProfile {
  name: string
  username: string
  category: string
  smartFollowers: number
  smartPercentage: number
  followers: number
  connections: number
  profileImage?: string
}

export const tweets: Tweet[] = [
  {
    user: {
      name: "BarçaFan92",
      username: "@barcafan92",
      avatar: "BF",
      tokens: "156.34 tokens",
    },
    content:
      "🔥 Incredible performance from Pedri last night! This player will make Barça history! #ForçaBarça #Pedri",
    time: "2h",
    engagement: {
      likes: 2847,
      comments: 156,
      retweets: 892,
      shares: 234,
    },
    score: 8003,
    boost: "+17",
    celebrities: ["Pedri (+8)", "Xavi Hernández (+9)"],
  },
  {
    user: {
      name: "PSGUltra",
      username: "@psgultra",
      avatar: "PU",
      tokens: "234.67 tokens",
    },
    content: "Mbappé dribbling through the entire defense like it's a video game 🎮⚡ #PSG #Mbappe #ChampionsLeague",
    time: "4h",
    engagement: {
      likes: 3421,
      comments: 289,
      retweets: 1247,
      shares: 456,
    },
    score: 10207,
    boost: "+18",
    celebrities: ["Kylian Mbappé (+9)", "Gianluigi Donnarumma (+7)"],
  },
  {
    user: {
      name: "FootballAnalyst",
      username: "@footanalyst",
      avatar: "FA",
      tokens: "189.23 tokens",
    },
    content: "Tactical analysis: Barça's new 4-3-3 formation revolutionizes their offensive play. Thread 🧵👇",
    time: "6h",
    engagement: {
      likes: 1894,
      comments: 234,
      retweets: 567,
      shares: 123,
    },
    score: 6847,
    boost: "+14",
    celebrities: ["Xavi Hernández (+8)", "Pep Guardiola (+6)"],
  }
]

export const topYappers: TopYapper[] = [
  { 
    rank: 1, 
    name: "Bertrand", 
    username: "@BertrandBuild", 
    totalYaps: 0, 
    earnedYaps: 0, 
    referralYaps: 0, 
    smartFollowers: 30, 
    followers: 646, 
    smartPercentage: 4.64, 
    score: "0", 
    change: "0%",
    avatar: "BB"
  },
  { 
    rank: 2, 
    name: "chaskin.eth", 
    username: "@chaskin22", 
    totalYaps: 336, 
    earnedYaps: 336, 
    referralYaps: 0, 
    smartFollowers: 566, 
    followers: 4159, 
    smartPercentage: 13.61, 
    score: "336", 
    change: "+15%",
    avatar: "CE"
  },
  { 
    rank: 3, 
    name: "Jacquelyn Melinek", 
    username: "@jacmelinek", 
    totalYaps: 318, 
    earnedYaps: 318, 
    referralYaps: 0, 
    smartFollowers: 1867, 
    followers: 42969, 
    smartPercentage: 4.34, 
    score: "318", 
    change: "+12%",
    avatar: "JM"
  },
  { 
    rank: 4, 
    name: "Ansem", 
    username: "@blknoiz06", 
    totalYaps: 292, 
    earnedYaps: 281, 
    referralYaps: 11, 
    smartFollowers: 7248, 
    followers: 744125, 
    smartPercentage: 0.97, 
    score: "292", 
    change: "+8%",
    avatar: "AN"
  },
  { 
    rank: 5, 
    name: "Neeraj K. Agrawal", 
    username: "@NeerajKA", 
    totalYaps: 260, 
    earnedYaps: 244, 
    referralYaps: 16, 
    smartFollowers: 4030, 
    followers: 158197, 
    smartPercentage: 2.55, 
    score: "260", 
    change: "+10%",
    avatar: "NK"
  },
  { 
    rank: 6, 
    name: "Sam Calder-Mason", 
    username: "@samcaldermason", 
    totalYaps: 175, 
    earnedYaps: 175, 
    referralYaps: 0, 
    smartFollowers: 189, 
    followers: 1444, 
    smartPercentage: 13.09, 
    score: "175", 
    change: "+7%",
    avatar: "SC"
  },
  { 
    rank: 7, 
    name: "BEN.ZZZ", 
    username: "@cyberpunk", 
    totalYaps: 164, 
    earnedYaps: 164, 
    referralYaps: 0, 
    smartFollowers: 579, 
    followers: 9158, 
    smartPercentage: 6.32, 
    score: "164", 
    change: "+5%",
    avatar: "BZ"
  },
  { 
    rank: 8, 
    name: "nic carter", 
    username: "@nic_carter", 
    totalYaps: 161, 
    earnedYaps: 161, 
    referralYaps: 0, 
    smartFollowers: 5534, 
    followers: 413869, 
    smartPercentage: 1.34, 
    score: "161", 
    change: "+6%",
    avatar: "NC"
  },
  { 
    rank: 9, 
    name: "Lefteris Karapetsas", 
    username: "@LefterisJP", 
    totalYaps: 157, 
    earnedYaps: 157, 
    referralYaps: 0, 
    smartFollowers: 2519, 
    followers: 67067, 
    smartPercentage: 3.76, 
    score: "157", 
    change: "+4%",
    avatar: "LK"
  },
  { 
    rank: 10, 
    name: "Advait", 
    username: "@advait_jayant", 
    totalYaps: 152, 
    earnedYaps: 152, 
    referralYaps: 0, 
    smartFollowers: 390, 
    followers: 13871, 
    smartPercentage: 2.81, 
    score: "152", 
    change: "+3%",
    avatar: "AD"
  }
]

export const mindshareGainers: MindshareGainer[] = [
  { name: "INFINEX", symbol: "INFINEX", current: 3.93, change1d: 128, change7d: 97, percentage: 3.93, color: "orange" },
  { name: "ALLORA", symbol: "ALLORA", current: 1.61, change1d: 118, change7d: 111, percentage: 1.61, color: "gray" },
  { name: "OG", symbol: "OG", current: 2.25, change1d: 98, change7d: 90, percentage: 2.25, color: "blue" },
  { name: "CALDERA", symbol: "CALDERA", current: 3.28, change1d: 97, change7d: 114, percentage: 3.28, color: "orange" },
  { name: "MIRA", symbol: "MIRA", current: 1.80, change1d: 71, change7d: 9, percentage: 1.80, color: "purple" },
  { name: "SIDEKICK", symbol: "SIDEKICK", current: 1.54, change1d: 69, change7d: 32, percentage: 1.54, color: "yellow" },
  { name: "PORTALTOBITCOIN", symbol: "PORTALTOBI...", current: 2.45, change1d: 65, change7d: 27, percentage: 2.45, color: "purple" },
  { name: "NOVAS", symbol: "NOVAS", current: 1.93, change1d: 56, change7d: 35, percentage: 1.93, color: "cyan" },
  { name: "MITOSIS", symbol: "MITOSIS", current: 3.35, change1d: 56, change7d: -26, percentage: 3.35, color: "blue" },
  { name: "PLASMA", symbol: "PLASMA", current: 0.58, change1d: 53, change7d: 43, percentage: 0.58, color: "green" }
]

export const userProfile: UserProfile = {
  name: "Bertrand",
  username: "@BertrandBuild",
  category: "Emerging CT",
  smartFollowers: 30,
  smartPercentage: 44,
  followers: 646,
  connections: 25
}

export const celebrities: Celebrity[] = [
  { name: "Lionel Messi", username: "@leomessi", team: "PSG", weight: "10" },
  { name: "Kylian Mbappé", username: "@KMbappe", team: "PSG", weight: "9" },
  { name: "Pedri", username: "@Pedri", team: "Barcelona", weight: "8" },
  { name: "Xavi Hernández", username: "@XaviHernandez", team: "Barcelona", weight: "7" },
] 