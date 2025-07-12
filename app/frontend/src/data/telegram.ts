export interface TelegramGroup {
  name: string
  members: string
  link: string
  badge: string
  badgeColor: string
  status?: string
}

export interface LinkGeneratorOption {
  value: string
  label: string
}

export const telegramGroups = [
  {
    id: 1,
    name: "PSG Official",
    members: "23,450 members",
    link: "t.me/psgofficial",
    badge: "VIP",
    badgeColor: "bg-yellow-600",
    access: "granted",
    minTokens: 1000,
    tokenSymbol: "PSG"
  },
  {
    id: 2,
    name: "FC Barcelona Fans",
    members: "15,420 members",
    link: "t.me/barcelonafans",
    badge: "Premium",
    badgeColor: "bg-blue-600",
    access: "granted",
    minTokens: 500,
    tokenSymbol: "BAR"
  },
  {
    id: 3,
    name: "Juventus Community",
    members: "12,350 members",
    link: "t.me/juventuscommunity",
    badge: "Standard",
    badgeColor: "bg-slate-600",
    access: "granted",
    minTokens: 250,
    tokenSymbol: "JUV"
  },
  {
    id: 4,
    name: "Chelsea Supporters",
    members: "18,900 members",
    link: "t.me/chelseasupporters",
    badge: "Premium",
    badgeColor: "bg-blue-600",
    access: "granted",
    minTokens: 750,
    tokenSymbol: "CHE"
  },
  {
    id: 5,
    name: "AC Milan Supporters",
    members: "9,800 members",
    link: "t.me/acmilansupporters",
    badge: "VIP",
    badgeColor: "bg-red-600",
    access: "locked",
    minTokens: 1500,
    tokenSymbol: "ACM"
  }
]

export const teamOptions: LinkGeneratorOption[] = [
  { value: "barcelona", label: "FC Barcelona" },
  { value: "psg", label: "Paris Saint-Germain" },
  { value: "juventus", label: "Juventus" },
  { value: "milan", label: "AC Milan" },
]

export const validityOptions: LinkGeneratorOption[] = [
  { value: "1h", label: "1 heure" },
  { value: "24h", label: "24 heures" },
  { value: "7d", label: "7 jours" },
  { value: "30d", label: "30 jours" },
] 