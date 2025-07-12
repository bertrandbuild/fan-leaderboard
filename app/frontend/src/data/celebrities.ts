// Liste fictive de célébrités pour la gestion intégrée
export interface Celebrity {
  name: string
  socialNetworkId: string
  team: string
  weight: number
}

export const celebrities: Celebrity[] = [
  {
    name: "Leo Messi",
    socialNetworkId: "leomessi",
    team: "Paris Saint-Germain",
    weight: 90,
  },
  {
    name: "Cristiano Ronaldo",
    socialNetworkId: "cristiano",
    team: "Juventus",
    weight: 85,
  },
  {
    name: "Neymar Jr.",
    socialNetworkId: "neymarjr",
    team: "Paris Saint-Germain",
    weight: 80,
  },
  {
    name: "Gerard Piqué",
    socialNetworkId: "3gerardpique",
    team: "FC Barcelona",
    weight: 75,
  },
  {
    name: "Paulo Dybala",
    socialNetworkId: "paulodybala",
    team: "Juventus",
    weight: 70,
  },
] 