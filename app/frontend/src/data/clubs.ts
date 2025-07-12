export interface Club {
  id: string
  name: string
  shortName: string
  sport: 'football' | 'gaming' | 'fighting' | 'motorsport' | 'rugby'
  category: string
  region: string
  colors: {
    primary: string
    secondary: string
  }
  logo: string
  stats: {
    members: number
    engagement: number
    points: number
    fanTokens: string
    totalActivity: number
  }
  socialMedia: {
    twitter: number
    telegram: number
    instagram: number
    discord?: number
    youtube?: number
  }
}

// Football Clubs Data
export const footballClubs: Club[] = [
  // Top European Clubs
  {
    id: 'fc-barcelona',
    name: 'FC Barcelona',
    shortName: 'Barça',
    sport: 'football',
    category: 'La Liga',
    region: 'Spain',
    colors: { primary: '#A50044', secondary: '#004D98' },
    logo: '/clubs/barcelona.png',
    stats: {
      members: 15420,
      engagement: 8.5,
      points: 2847,
      fanTokens: 'BAR',
      totalActivity: 45230
    },
    socialMedia: {
      twitter: 12500,
      telegram: 8900,
      instagram: 15600,
      youtube: 2300
    }
  },
  {
    id: 'psg',
    name: 'Paris Saint-Germain',
    shortName: 'PSG',
    sport: 'football',
    category: 'Ligue 1',
    region: 'France',
    colors: { primary: '#004170', secondary: '#DA020E' },
    logo: '/clubs/psg.png',
    stats: {
      members: 12350,
      engagement: 7.8,
      points: 2756,
      fanTokens: 'PSG',
      totalActivity: 38900
    },
    socialMedia: {
      twitter: 9800,
      telegram: 7200,
      instagram: 12100,
      youtube: 1800
    }
  },
  {
    id: 'juventus',
    name: 'Juventus',
    shortName: 'Juve',
    sport: 'football',
    category: 'Serie A',
    region: 'Italy',
    colors: { primary: '#000000', secondary: '#FFFFFF' },
    logo: '/clubs/juventus.png',
    stats: {
      members: 18900,
      engagement: 7.2,
      points: 2689,
      fanTokens: 'JUV',
      totalActivity: 42100
    },
    socialMedia: {
      twitter: 11200,
      telegram: 9500,
      instagram: 14300,
      youtube: 2100
    }
  },
  {
    id: 'ac-milan',
    name: 'AC Milan',
    shortName: 'Milan',
    sport: 'football',
    category: 'Serie A',
    region: 'Italy',
    colors: { primary: '#FB090B', secondary: '#000000' },
    logo: '/clubs/milan.png',
    stats: {
      members: 9800,
      engagement: 6.9,
      points: 2634,
      fanTokens: 'ACM',
      totalActivity: 29400
    },
    socialMedia: {
      twitter: 8900,
      telegram: 5600,
      instagram: 9800,
      youtube: 1500
    }
  },
  {
    id: 'as-roma',
    name: 'AS Roma',
    shortName: 'Roma',
    sport: 'football',
    category: 'Serie A',
    region: 'Italy',
    colors: { primary: '#CC0000', secondary: '#F7DC6F' },
    logo: '/clubs/roma.png',
    stats: {
      members: 7650,
      engagement: 6.4,
      points: 2156,
      fanTokens: 'ASR',
      totalActivity: 23800
    },
    socialMedia: {
      twitter: 6700,
      telegram: 4200,
      instagram: 7800,
      youtube: 1200
    }
  },
  {
    id: 'atletico-madrid',
    name: 'Atlético Madrid',
    shortName: 'Atleti',
    sport: 'football',
    category: 'La Liga',
    region: 'Spain',
    colors: { primary: '#CE2029', secondary: '#FFFFFF' },
    logo: '/clubs/atletico.png',
    stats: {
      members: 8900,
      engagement: 6.8,
      points: 2298,
      fanTokens: 'ATM',
      totalActivity: 26700
    },
    socialMedia: {
      twitter: 7800,
      telegram: 5100,
      instagram: 8900,
      youtube: 1400
    }
  },
  {
    id: 'manchester-city',
    name: 'Manchester City',
    shortName: 'City',
    sport: 'football',
    category: 'Premier League',
    region: 'England',
    colors: { primary: '#6CABDD', secondary: '#FFFFFF' },
    logo: '/clubs/mancity.png',
    stats: {
      members: 11200,
      engagement: 7.5,
      points: 2567,
      fanTokens: 'CITY',
      totalActivity: 34500
    },
    socialMedia: {
      twitter: 9200,
      telegram: 6800,
      instagram: 11500,
      youtube: 1700
    }
  },
  {
    id: 'arsenal',
    name: 'Arsenal',
    shortName: 'Arsenal',
    sport: 'football',
    category: 'Premier League',
    region: 'England',
    colors: { primary: '#EF0107', secondary: '#FFFFFF' },
    logo: '/clubs/arsenal.png',
    stats: {
      members: 10500,
      engagement: 7.1,
      points: 2445,
      fanTokens: 'AFC',
      totalActivity: 31200
    },
    socialMedia: {
      twitter: 8700,
      telegram: 6200,
      instagram: 10800,
      youtube: 1600
    }
  },
  {
    id: 'tottenham',
    name: 'Tottenham Hotspur',
    shortName: 'Spurs',
    sport: 'football',
    category: 'Premier League',
    region: 'England',
    colors: { primary: '#132257', secondary: '#FFFFFF' },
    logo: '/clubs/tottenham.png',
    stats: {
      members: 8700,
      engagement: 6.6,
      points: 2178,
      fanTokens: 'SPURS',
      totalActivity: 25400
    },
    socialMedia: {
      twitter: 7200,
      telegram: 4800,
      instagram: 8500,
      youtube: 1300
    }
  },
  {
    id: 'inter-milan',
    name: 'Inter Milan',
    shortName: 'Inter',
    sport: 'football',
    category: 'Serie A',
    region: 'Italy',
    colors: { primary: '#0068A8', secondary: '#000000' },
    logo: '/clubs/inter.png',
    stats: {
      members: 9200,
      engagement: 6.7,
      points: 2234,
      fanTokens: 'INTER',
      totalActivity: 27800
    },
    socialMedia: {
      twitter: 7600,
      telegram: 5300,
      instagram: 9100,
      youtube: 1400
    }
  },
  // Additional clubs from the image
  {
    id: 'independiente',
    name: 'Club Atlético Independiente',
    shortName: 'Independiente',
    sport: 'football',
    category: 'Primera División',
    region: 'Argentina',
    colors: { primary: '#D50000', secondary: '#FFFFFF' },
    logo: '/clubs/independiente.png',
    stats: {
      members: 4200,
      engagement: 6.1,
      points: 1456,
      fanTokens: 'IND',
      totalActivity: 15600
    },
    socialMedia: {
      twitter: 3200,
      telegram: 1800,
      instagram: 3900,
      youtube: 650
    }
  },
  {
    id: 'galatasaray',
    name: 'Galatasaray',
    shortName: 'Galatasaray',
    sport: 'football',
    category: 'Süper Lig',
    region: 'Turkey',
    colors: { primary: '#FFA500', secondary: '#8B0000' },
    logo: '/clubs/galatasaray.png',
    stats: {
      members: 6800,
      engagement: 7.3,
      points: 1987,
      fanTokens: 'GAL',
      totalActivity: 22400
    },
    socialMedia: {
      twitter: 5200,
      telegram: 3100,
      instagram: 6700,
      youtube: 1100
    }
  },
  {
    id: 'istanbul-basaksehir',
    name: 'İstanbul Başakşehir',
    shortName: 'Başakşehir',
    sport: 'football',
    category: 'Süper Lig',
    region: 'Turkey',
    colors: { primary: '#FF6600', secondary: '#003366' },
    logo: '/clubs/basaksehir.png',
    stats: {
      members: 2100,
      engagement: 5.4,
      points: 876,
      fanTokens: 'BAS',
      totalActivity: 8900
    },
    socialMedia: {
      twitter: 1800,
      telegram: 900,
      instagram: 2200,
      youtube: 380
    }
  },
  {
    id: 'trabzonspor',
    name: 'Trabzonspor',
    shortName: 'Trabzonspor',
    sport: 'football',
    category: 'Süper Lig',
    region: 'Turkey',
    colors: { primary: '#800020', secondary: '#87CEEB' },
    logo: '/clubs/trabzonspor.png',
    stats: {
      members: 3400,
      engagement: 6.2,
      points: 1234,
      fanTokens: 'TRA',
      totalActivity: 12800
    },
    socialMedia: {
      twitter: 2800,
      telegram: 1500,
      instagram: 3200,
      youtube: 580
    }
  },
  {
    id: 'apollon',
    name: 'Apollon Limassol',
    shortName: 'Apollon',
    sport: 'football',
    category: 'First Division',
    region: 'Cyprus',
    colors: { primary: '#0066CC', secondary: '#FFFFFF' },
    logo: '/clubs/apollon.png',
    stats: {
      members: 890,
      engagement: 4.8,
      points: 456,
      fanTokens: 'APO',
      totalActivity: 3200
    },
    socialMedia: {
      twitter: 680,
      telegram: 320,
      instagram: 890,
      youtube: 150
    }
  },
  {
    id: 'young-boys',
    name: 'BSC Young Boys',
    shortName: 'Young Boys',
    sport: 'football',
    category: 'Super League',
    region: 'Switzerland',
    colors: { primary: '#FFD700', secondary: '#000000' },
    logo: '/clubs/youngboys.png',
    stats: {
      members: 1800,
      engagement: 5.6,
      points: 789,
      fanTokens: 'YB',
      totalActivity: 6400
    },
    socialMedia: {
      twitter: 1400,
      telegram: 680,
      instagram: 1600,
      youtube: 290
    }
  },
  {
    id: 'legia-warsaw',
    name: 'Legia Warsaw',
    shortName: 'Legia',
    sport: 'football',
    category: 'Ekstraklasa',
    region: 'Poland',
    colors: { primary: '#00FF00', secondary: '#FFFFFF' },
    logo: '/clubs/legia.png',
    stats: {
      members: 2300,
      engagement: 5.9,
      points: 934,
      fanTokens: 'LEG',
      totalActivity: 8700
    },
    socialMedia: {
      twitter: 1900,
      telegram: 1100,
      instagram: 2400,
      youtube: 420
    }
  },
  {
    id: 'atletico-mineiro',
    name: 'Clube Atlético Mineiro',
    shortName: 'Atlético-MG',
    sport: 'football',
    category: 'Brasileirão',
    region: 'Brazil',
    colors: { primary: '#000000', secondary: '#FFFFFF' },
    logo: '/clubs/atletico-mg.png',
    stats: {
      members: 5600,
      engagement: 6.8,
      points: 1678,
      fanTokens: 'ATL',
      totalActivity: 19200
    },
    socialMedia: {
      twitter: 4200,
      telegram: 2400,
      instagram: 5100,
      youtube: 890
    }
  },
  {
    id: 'atletico-mg',
    name: 'Atlético Mineiro',
    shortName: 'Galo',
    sport: 'football',
    category: 'Brasileirão',
    region: 'Brazil',
    colors: { primary: '#000000', secondary: '#FFFFFF' },
    logo: '/clubs/galo.png',
    stats: {
      members: 4800,
      engagement: 6.5,
      points: 1456,
      fanTokens: 'GALO',
      totalActivity: 17800
    },
    socialMedia: {
      twitter: 3600,
      telegram: 2100,
      instagram: 4400,
      youtube: 760
    }
  },
  {
    id: 'argentina-nt',
    name: 'Argentina National Team',
    shortName: 'Argentina',
    sport: 'football',
    category: 'National Team',
    region: 'Argentina',
    colors: { primary: '#74ACDF', secondary: '#FFFFFF' },
    logo: '/clubs/argentina.png',
    stats: {
      members: 12400,
      engagement: 8.9,
      points: 2890,
      fanTokens: 'ARG',
      totalActivity: 38900
    },
    socialMedia: {
      twitter: 9800,
      telegram: 6200,
      instagram: 11500,
      youtube: 2100
    }
  },
  {
    id: 'levante',
    name: 'Levante UD',
    shortName: 'Levante',
    sport: 'football',
    category: 'La Liga',
    region: 'Spain',
    colors: { primary: '#0066CC', secondary: '#FF0000' },
    logo: '/clubs/levante.png',
    stats: {
      members: 1600,
      engagement: 5.2,
      points: 678,
      fanTokens: 'LEV',
      totalActivity: 5900
    },
    socialMedia: {
      twitter: 1200,
      telegram: 650,
      instagram: 1400,
      youtube: 240
    }
  },
  {
    id: 'flamengo',
    name: 'Clube de Regatas do Flamengo',
    shortName: 'Flamengo',
    sport: 'football',
    category: 'Brasileirão',
    region: 'Brazil',
    colors: { primary: '#E60026', secondary: '#000000' },
    logo: '/clubs/flamengo.png',
    stats: {
      members: 18900,
      engagement: 8.7,
      points: 3234,
      fanTokens: 'FLA',
      totalActivity: 52600
    },
    socialMedia: {
      twitter: 14200,
      telegram: 9800,
      instagram: 17600,
      youtube: 3400
    }
  },
  {
    id: 'valencia',
    name: 'Valencia CF',
    shortName: 'Valencia',
    sport: 'football',
    category: 'La Liga',
    region: 'Spain',
    colors: { primary: '#FF6600', secondary: '#000000' },
    logo: '/clubs/valencia.png',
    stats: {
      members: 6200,
      engagement: 6.4,
      points: 1789,
      fanTokens: 'VAL',
      totalActivity: 20400
    },
    socialMedia: {
      twitter: 4800,
      telegram: 2900,
      instagram: 5600,
      youtube: 980
    }
  },
  {
    id: 'galatasaray-esports',
    name: 'Galatasaray Esports',
    shortName: 'GS Esports',
    sport: 'football',
    category: 'Süper Lig',
    region: 'Turkey',
    colors: { primary: '#FFA500', secondary: '#8B0000' },
    logo: '/clubs/gs-esports.png',
    stats: {
      members: 2100,
      engagement: 7.1,
      points: 934,
      fanTokens: 'GSE',
      totalActivity: 8900
    },
    socialMedia: {
      twitter: 1600,
      telegram: 890,
      instagram: 1900,
      youtube: 340
    }
  },
  {
    id: 'napoli',
    name: 'SSC Napoli',
    shortName: 'Napoli',
    sport: 'football',
    category: 'Serie A',
    region: 'Italy',
    colors: { primary: '#0080FF', secondary: '#FFFFFF' },
    logo: '/clubs/napoli.png',
    stats: {
      members: 8900,
      engagement: 7.6,
      points: 2456,
      fanTokens: 'NAP',
      totalActivity: 28900
    },
    socialMedia: {
      twitter: 6800,
      telegram: 4200,
      instagram: 8100,
      youtube: 1400
    }
  },
  {
    id: 'millonarios',
    name: 'Millonarios FC',
    shortName: 'Millonarios',
    sport: 'football',
    category: 'Liga BetPlay',
    region: 'Colombia',
    colors: { primary: '#0066CC', secondary: '#FFFFFF' },
    logo: '/clubs/millonarios.png',
    stats: {
      members: 3200,
      engagement: 6.0,
      points: 1123,
      fanTokens: 'MIL',
      totalActivity: 11800
    },
    socialMedia: {
      twitter: 2400,
      telegram: 1300,
      instagram: 2900,
      youtube: 520
    }
  },
  {
    id: 'monaco',
    name: 'AS Monaco',
    shortName: 'Monaco',
    sport: 'football',
    category: 'Ligue 1',
    region: 'France',
    colors: { primary: '#FF0000', secondary: '#FFFFFF' },
    logo: '/clubs/monaco.png',
    stats: {
      members: 4100,
      engagement: 6.3,
      points: 1456,
      fanTokens: 'MON',
      totalActivity: 15600
    },
    socialMedia: {
      twitter: 3100,
      telegram: 1800,
      instagram: 3700,
      youtube: 650
    }
  },
  {
    id: 'italia-nt',
    name: 'Italy National Team',
    shortName: 'Italy',
    sport: 'football',
    category: 'National Team',
    region: 'Italy',
    colors: { primary: '#0066CC', secondary: '#FFFFFF' },
    logo: '/clubs/italy.png',
    stats: {
      members: 11200,
      engagement: 8.4,
      points: 2678,
      fanTokens: 'ITA',
      totalActivity: 35400
    },
    socialMedia: {
      twitter: 8600,
      telegram: 5400,
      instagram: 10200,
      youtube: 1800
    }
  },
  {
    id: 'vasco-da-gama',
    name: 'Club de Regatas Vasco da Gama',
    shortName: 'Vasco',
    sport: 'football',
    category: 'Brasileirão',
    region: 'Brazil',
    colors: { primary: '#000000', secondary: '#FFFFFF' },
    logo: '/clubs/vasco.png',
    stats: {
      members: 4600,
      engagement: 6.1,
      points: 1345,
      fanTokens: 'VAS',
      totalActivity: 16200
    },
    socialMedia: {
      twitter: 3400,
      telegram: 1900,
      instagram: 4100,
      youtube: 720
    }
  },
  {
    id: 'palmeiras',
    name: 'Sociedade Esportiva Palmeiras',
    shortName: 'Palmeiras',
    sport: 'football',
    category: 'Brasileirão',
    region: 'Brazil',
    colors: { primary: '#006600', secondary: '#FFFFFF' },
    logo: '/clubs/palmeiras.png',
    stats: {
      members: 16800,
      engagement: 8.2,
      points: 2987,
      fanTokens: 'PAL',
      totalActivity: 47300
    },
    socialMedia: {
      twitter: 12600,
      telegram: 8400,
      instagram: 15200,
      youtube: 2800
    }
  },
  {
    id: 'crystal-palace',
    name: 'Crystal Palace FC',
    shortName: 'Crystal Palace',
    sport: 'football',
    category: 'Premier League',
    region: 'England',
    colors: { primary: '#0066CC', secondary: '#FF0000' },
    logo: '/clubs/crystal-palace.png',
    stats: {
      members: 2800,
      engagement: 5.7,
      points: 967,
      fanTokens: 'CRY',
      totalActivity: 9800
    },
    socialMedia: {
      twitter: 2100,
      telegram: 1200,
      instagram: 2500,
      youtube: 450
    }
  },
  {
    id: 'sevilla',
    name: 'Sevilla FC',
    shortName: 'Sevilla',
    sport: 'football',
    category: 'La Liga',
    region: 'Spain',
    colors: { primary: '#FFFFFF', secondary: '#FF0000' },
    logo: '/clubs/sevilla.png',
    stats: {
      members: 7200,
      engagement: 6.9,
      points: 2134,
      fanTokens: 'SEV',
      totalActivity: 24600
    },
    socialMedia: {
      twitter: 5400,
      telegram: 3200,
      instagram: 6500,
      youtube: 1100
    }
  },
  {
    id: 'udinese',
    name: 'Udinese Calcio',
    shortName: 'Udinese',
    sport: 'football',
    category: 'Serie A',
    region: 'Italy',
    colors: { primary: '#000000', secondary: '#FFFFFF' },
    logo: '/clubs/udinese.png',
    stats: {
      members: 1900,
      engagement: 5.1,
      points: 723,
      fanTokens: 'UDI',
      totalActivity: 6800
    },
    socialMedia: {
      twitter: 1400,
      telegram: 780,
      instagram: 1700,
      youtube: 290
    }
  },
  // Additional clubs from the image
  {
    id: 'internacional',
    name: 'Sport Club Internacional',
    shortName: 'Internacional',
    sport: 'football',
    category: 'Brasileirão',
    region: 'Brazil',
    colors: { primary: '#FF0000', secondary: '#FFFFFF' },
    logo: '/clubs/internacional.png',
    stats: {
      members: 5400,
      engagement: 6.4,
      points: 1567,
      fanTokens: 'INT',
      totalActivity: 18200
    },
    socialMedia: {
      twitter: 4100,
      telegram: 2300,
      instagram: 4800,
      youtube: 820
    }
  },
  {
    id: 'bahia',
    name: 'Esporte Clube Bahia',
    shortName: 'Bahia',
    sport: 'football',
    category: 'Brasileirão',
    region: 'Brazil',
    colors: { primary: '#0066CC', secondary: '#FF0000' },
    logo: '/clubs/bahia.png',
    stats: {
      members: 3100,
      engagement: 5.8,
      points: 1089,
      fanTokens: 'BAH',
      totalActivity: 11400
    },
    socialMedia: {
      twitter: 2300,
      telegram: 1300,
      instagram: 2800,
      youtube: 480
    }
  },
  {
    id: 'fluminense',
    name: 'Fluminense Football Club',
    shortName: 'Fluminense',
    sport: 'football',
    category: 'Brasileirão',
    region: 'Brazil',
    colors: { primary: '#800020', secondary: '#00FF00' },
    logo: '/clubs/fluminense.png',
    stats: {
      members: 6800,
      engagement: 6.7,
      points: 1923,
      fanTokens: 'FLU',
      totalActivity: 22800
    },
    socialMedia: {
      twitter: 5100,
      telegram: 2900,
      instagram: 6200,
      youtube: 1050
    }
  },
  {
    id: 'benfica',
    name: 'Sport Lisboa e Benfica',
    shortName: 'Benfica',
    sport: 'football',
    category: 'Primeira Liga',
    region: 'Portugal',
    colors: { primary: '#FF0000', secondary: '#FFFFFF' },
    logo: '/clubs/benfica.png',
    stats: {
      members: 9800,
      engagement: 7.8,
      points: 2456,
      fanTokens: 'BEN',
      totalActivity: 31200
    },
    socialMedia: {
      twitter: 7400,
      telegram: 4300,
      instagram: 8900,
      youtube: 1500
    }
  },
  {
    id: 'persie-bandung',
    name: 'Persib Bandung',
    shortName: 'Persib',
    sport: 'football',
    category: 'Liga 1',
    region: 'Indonesia',
    colors: { primary: '#0066CC', secondary: '#FFFFFF' },
    logo: '/clubs/persib.png',
    stats: {
      members: 4200,
      engagement: 6.2,
      points: 1234,
      fanTokens: 'PER',
      totalActivity: 14600
    },
    socialMedia: {
      twitter: 3100,
      telegram: 1800,
      instagram: 3800,
      youtube: 650
    }
  },
  {
    id: 'sao-paulo',
    name: 'São Paulo Futebol Clube',
    shortName: 'São Paulo',
    sport: 'football',
    category: 'Brasileirão',
    region: 'Brazil',
    colors: { primary: '#FF0000', secondary: '#000000' },
    logo: '/clubs/saopaulo.png',
    stats: {
      members: 11200,
      engagement: 7.4,
      points: 2567,
      fanTokens: 'SAO',
      totalActivity: 34800
    },
    socialMedia: {
      twitter: 8400,
      telegram: 5100,
      instagram: 10200,
      youtube: 1800
    }
  },
  {
    id: 'braga',
    name: 'Sporting Clube de Braga',
    shortName: 'Braga',
    sport: 'football',
    category: 'Primeira Liga',
    region: 'Portugal',
    colors: { primary: '#FF0000', secondary: '#FFFFFF' },
    logo: '/clubs/braga.png',
    stats: {
      members: 2800,
      engagement: 5.9,
      points: 967,
      fanTokens: 'BRA',
      totalActivity: 9600
    },
    socialMedia: {
      twitter: 2100,
      telegram: 1200,
      instagram: 2500,
      youtube: 420
    }
  },
  {
    id: 'corinthians',
    name: 'Sport Club Corinthians Paulista',
    shortName: 'Corinthians',
    sport: 'football',
    category: 'Brasileirão',
    region: 'Brazil',
    colors: { primary: '#000000', secondary: '#FFFFFF' },
    logo: '/clubs/corinthians.png',
    stats: {
      members: 15600,
      engagement: 8.1,
      points: 2834,
      fanTokens: 'COR',
      totalActivity: 44200
    },
    socialMedia: {
      twitter: 11800,
      telegram: 7600,
      instagram: 14200,
      youtube: 2600
    }
  },
  {
    id: 'inter-miami',
    name: 'Inter Miami CF',
    shortName: 'Inter Miami',
    sport: 'football',
    category: 'MLS',
    region: 'USA',
    colors: { primary: '#FF69B4', secondary: '#000000' },
    logo: '/clubs/inter-miami.png',
    stats: {
      members: 8900,
      engagement: 7.9,
      points: 2134,
      fanTokens: 'MIA',
      totalActivity: 28600
    },
    socialMedia: {
      twitter: 6700,
      telegram: 3800,
      instagram: 8100,
      youtube: 1400
    }
  },
  {
    id: 'everton',
    name: 'Everton FC',
    shortName: 'Everton',
    sport: 'football',
    category: 'Premier League',
    region: 'England',
    colors: { primary: '#003399', secondary: '#FFFFFF' },
    logo: '/clubs/everton.png',
    stats: {
      members: 4600,
      engagement: 6.0,
      points: 1345,
      fanTokens: 'EVE',
      totalActivity: 16800
    },
    socialMedia: {
      twitter: 3400,
      telegram: 2000,
      instagram: 4100,
      youtube: 720
    }
  },
  {
    id: 'leeds-united',
    name: 'Leeds United FC',
    shortName: 'Leeds',
    sport: 'football',
    category: 'Championship',
    region: 'England',
    colors: { primary: '#FFFF00', secondary: '#0066CC' },
    logo: '/clubs/leeds.png',
    stats: {
      members: 3800,
      engagement: 6.3,
      points: 1234,
      fanTokens: 'LEE',
      totalActivity: 14200
    },
    socialMedia: {
      twitter: 2900,
      telegram: 1600,
      instagram: 3400,
      youtube: 580
    }
  },
  {
    id: 'aston-villa',
    name: 'Aston Villa FC',
    shortName: 'Aston Villa',
    sport: 'football',
    category: 'Premier League',
    region: 'England',
    colors: { primary: '#800020', secondary: '#87CEEB' },
    logo: '/clubs/aston-villa.png',
    stats: {
      members: 5200,
      engagement: 6.5,
      points: 1567,
      fanTokens: 'AVL',
      totalActivity: 18400
    },
    socialMedia: {
      twitter: 3900,
      telegram: 2200,
      instagram: 4700,
      youtube: 800
    }
  },
  {
    id: 'middlesbrough',
    name: 'Middlesbrough FC',
    shortName: 'Middlesbrough',
    sport: 'football',
    category: 'Championship',
    region: 'England',
    colors: { primary: '#FF0000', secondary: '#FFFFFF' },
    logo: '/clubs/middlesbrough.png',
    stats: {
      members: 1800,
      engagement: 5.2,
      points: 678,
      fanTokens: 'MID',
      totalActivity: 6400
    },
    socialMedia: {
      twitter: 1300,
      telegram: 720,
      instagram: 1600,
      youtube: 280
    }
  },
  {
    id: 'sao-paulo-fc',
    name: 'São Paulo FC',
    shortName: 'SPFC',
    sport: 'football',
    category: 'Brasileirão',
    region: 'Brazil',
    colors: { primary: '#FF0000', secondary: '#000000' },
    logo: '/clubs/spfc.png',
    stats: {
      members: 9800,
      engagement: 7.2,
      points: 2234,
      fanTokens: 'SPFC',
      totalActivity: 31600
    },
    socialMedia: {
      twitter: 7400,
      telegram: 4200,
      instagram: 8900,
      youtube: 1500
    }
  },
  {
    id: 'bologna',
    name: 'Bologna FC',
    shortName: 'Bologna',
    sport: 'football',
    category: 'Serie A',
    region: 'Italy',
    colors: { primary: '#FF0000', secondary: '#0066CC' },
    logo: '/clubs/bologna.png',
    stats: {
      members: 2400,
      engagement: 5.6,
      points: 834,
      fanTokens: 'BOL',
      totalActivity: 8200
    },
    socialMedia: {
      twitter: 1800,
      telegram: 1000,
      instagram: 2200,
      youtube: 380
    }
  },
  {
    id: 'sporting-cp',
    name: 'Sporting Clube de Portugal',
    shortName: 'Sporting CP',
    sport: 'football',
    category: 'Primeira Liga',
    region: 'Portugal',
    colors: { primary: '#00FF00', secondary: '#FFFFFF' },
    logo: '/clubs/sporting.png',
    stats: {
      members: 6800,
      engagement: 7.1,
      points: 1923,
      fanTokens: 'SCP',
      totalActivity: 23400
    },
    socialMedia: {
      twitter: 5100,
      telegram: 2900,
      instagram: 6200,
      youtube: 1050
    }
  },
  {
    id: 'dinamo-zagreb',
    name: 'GNK Dinamo Zagreb',
    shortName: 'Dinamo Zagreb',
    sport: 'football',
    category: 'HNL',
    region: 'Croatia',
    colors: { primary: '#0066CC', secondary: '#FFFFFF' },
    logo: '/clubs/dinamo-zagreb.png',
    stats: {
      members: 2100,
      engagement: 5.8,
      points: 756,
      fanTokens: 'DIN',
      totalActivity: 7800
    },
    socialMedia: {
      twitter: 1600,
      telegram: 890,
      instagram: 1900,
      youtube: 320
    }
  }
]

// Gaming/Esports Teams
export const gamingTeams: Club[] = [
  {
    id: 'og-esports',
    name: 'OG Esports',
    shortName: 'OG',
    sport: 'gaming',
    category: 'Dota 2',
    region: 'Europe',
    colors: { primary: '#000000', secondary: '#FFFFFF' },
    logo: '/clubs/og.png',
    stats: {
      members: 5600,
      engagement: 9.2,
      points: 1890,
      fanTokens: 'OG',
      totalActivity: 18900
    },
    socialMedia: {
      twitter: 4200,
      telegram: 2800,
      instagram: 3500,
      discord: 8900,
      youtube: 1100
    }
  },
  {
    id: 'red-bull-og',
    name: 'Red Bull OG',
    shortName: 'RB OG',
    sport: 'gaming',
    category: 'CS2',
    region: 'Europe',
    colors: { primary: '#1E3A8A', secondary: '#DC2626' },
    logo: '/clubs/redbull-og.png',
    stats: {
      members: 4800,
      engagement: 8.7,
      points: 1654,
      fanTokens: 'RBOG',
      totalActivity: 16200
    },
    socialMedia: {
      twitter: 3800,
      telegram: 2400,
      instagram: 3100,
      discord: 7600,
      youtube: 950
    }
  },
  {
    id: 'alliance',
    name: 'Alliance',
    shortName: 'Alliance',
    sport: 'gaming',
    category: 'Dota 2',
    region: 'Europe',
    colors: { primary: '#22C55E', secondary: '#000000' },
    logo: '/clubs/alliance.png',
    stats: {
      members: 3900,
      engagement: 8.1,
      points: 1423,
      fanTokens: 'ALL',
      totalActivity: 13800
    },
    socialMedia: {
      twitter: 3200,
      telegram: 1900,
      instagram: 2600,
      discord: 6400,
      youtube: 780
    }
  },
  {
    id: 'mibr',
    name: 'MIBR',
    shortName: 'MIBR',
    sport: 'gaming',
    category: 'CS2',
    region: 'Brazil',
    colors: { primary: '#1E1B4B', secondary: '#FBBF24' },
    logo: '/clubs/mibr.png',
    stats: {
      members: 6200,
      engagement: 8.9,
      points: 1756,
      fanTokens: 'MIBR',
      totalActivity: 17400
    },
    socialMedia: {
      twitter: 4600,
      telegram: 3100,
      instagram: 3800,
      discord: 8200,
      youtube: 1200
    }
  }
]

// Fighting Sports
export const fightingClubs: Club[] = [
  {
    id: 'ufc',
    name: 'Ultimate Fighting Championship',
    shortName: 'UFC',
    sport: 'fighting',
    category: 'MMA',
    region: 'Global',
    colors: { primary: '#D4AF37', secondary: '#000000' },
    logo: '/clubs/ufc.png',
    stats: {
      members: 25600,
      engagement: 9.8,
      points: 3456,
      fanTokens: 'UFC',
      totalActivity: 67800
    },
    socialMedia: {
      twitter: 18900,
      telegram: 12400,
      instagram: 22100,
      youtube: 3800
    }
  },
  {
    id: 'pfl',
    name: 'Professional Fighters League',
    shortName: 'PFL',
    sport: 'fighting',
    category: 'MMA',
    region: 'Global',
    colors: { primary: '#1E40AF', secondary: '#FFFFFF' },
    logo: '/clubs/pfl.png',
    stats: {
      members: 8900,
      engagement: 7.4,
      points: 1890,
      fanTokens: 'PFL',
      totalActivity: 23400
    },
    socialMedia: {
      twitter: 6700,
      telegram: 3200,
      instagram: 7800,
      youtube: 1400
    }
  }
]

// Motorsport Teams
export const motorsportTeams: Club[] = [
  {
    id: 'rfk-racing',
    name: 'RFK Racing',
    shortName: 'RFK',
    sport: 'motorsport',
    category: 'NASCAR',
    region: 'USA',
    colors: { primary: '#000000', secondary: '#FFFFFF' },
    logo: '/clubs/rfk.png',
    stats: {
      members: 4200,
      engagement: 6.8,
      points: 1234,
      fanTokens: 'RFK',
      totalActivity: 12600
    },
    socialMedia: {
      twitter: 3400,
      telegram: 1800,
      instagram: 2900,
      youtube: 850
    }
  },
  {
    id: 'aston-martin-f1',
    name: 'Aston Martin Aramco Cognizant F1 Team',
    shortName: 'Aston Martin',
    sport: 'motorsport',
    category: 'Formula 1',
    region: 'UK',
    colors: { primary: '#00352F', secondary: '#CEDC00' },
    logo: '/clubs/aston-martin.png',
    stats: {
      members: 7800,
      engagement: 8.2,
      points: 1876,
      fanTokens: 'AM',
      totalActivity: 19200
    },
    socialMedia: {
      twitter: 5900,
      telegram: 3600,
      instagram: 6700,
      youtube: 1200
    }
  }
]

// Rugby Teams
export const rugbyTeams: Club[] = [
  {
    id: 'stade-francais',
    name: 'Stade Français Paris',
    shortName: 'SF Paris',
    sport: 'rugby',
    category: 'Top 14',
    region: 'France',
    colors: { primary: '#E91E63', secondary: '#000000' },
    logo: '/clubs/stade-francais.png',
    stats: {
      members: 3400,
      engagement: 6.2,
      points: 987,
      fanTokens: 'SF',
      totalActivity: 8900
    },
    socialMedia: {
      twitter: 2800,
      telegram: 1200,
      instagram: 2100,
      youtube: 450
    }
  },
  {
    id: 'sharks',
    name: 'The Sharks',
    shortName: 'Sharks',
    sport: 'rugby',
    category: 'URC',
    region: 'South Africa',
    colors: { primary: '#000000', secondary: '#FFFFFF' },
    logo: '/clubs/sharks.png',
    stats: {
      members: 2900,
      engagement: 5.8,
      points: 834,
      fanTokens: 'SHARKS',
      totalActivity: 7600
    },
    socialMedia: {
      twitter: 2300,
      telegram: 980,
      instagram: 1800,
      youtube: 380
    }
  }
]

// Combine all clubs
export const allClubs: Club[] = [
  ...footballClubs,
  ...gamingTeams,
  ...fightingClubs,
  ...motorsportTeams,
  ...rugbyTeams
]

// Helper functions
export const getClubsBySport = (sport: string): Club[] => {
  return allClubs.filter(club => club.sport === sport)
}

export const getClubsByRegion = (region: string): Club[] => {
  return allClubs.filter(club => club.region === region)
}

export const searchClubs = (query: string): Club[] => {
  const searchTerm = query.toLowerCase()
  return allClubs.filter(club => 
    club.name.toLowerCase().includes(searchTerm) ||
    club.shortName.toLowerCase().includes(searchTerm) ||
    club.category.toLowerCase().includes(searchTerm) ||
    club.region.toLowerCase().includes(searchTerm)
  )
} 