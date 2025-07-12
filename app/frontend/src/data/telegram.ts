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