export const ALLOCATION = [
  {
    key: "ecosystem",
    name: "Ecosystem & Development",
    percent: 30,
    tokens: "300,000,000 WLT",
    color: "hsl(70.79deg 78% 58%)",
  },
  {
    key: "community",
    name: "Community Rewards",
    percent: 20,
    tokens: "200,000,000 WLT",
    color: "hsl(70.79deg 70% 52%)",
  },
  {
    key: "liquidity",
    name: "Liquidity & Exchanges",
    percent: 15,
    tokens: "150,000,000 WLT",
    color: "hsl(70deg 55% 46%)",
  },
  {
    key: "partnerships",
    name: "Strategic Partnerships",
    percent: 10,
    tokens: "100,000,000 WLT",
    color: "hsl(72deg 28% 38%)",
  },
  {
    key: "team",
    name: "Team & Advisors",
    percent: 10,
    tokens: "100,000,000 WLT",
    color: "hsl(70deg 12% 34%)",
  },
  {
    key: "marketing",
    name: "Marketing & Growth",
    percent: 10,
    tokens: "100,000,000 WLT",
    color: "hsl(0deg 0% 32%)",
  },
  {
    key: "treasury",
    name: "Treasury",
    percent: 5,
    tokens: "50,000,000 WLT",
    color: "hsl(0deg 0% 48%)",
  },
  {
    key: "launch",
    name: "Airdrops & Launch",
    percent: 5,
    tokens: "50,000,000 WLT",
    color: "hsl(55deg 18% 62%)",
  },
];

export const VESTING = [
  { category: "Ecosystem & Development", period: "48 Months", cliff: "6 Months" },
  { category: "Community Rewards", period: "36 Months", cliff: "3 Months" },
  { category: "Liquidity & Exchanges", period: "Unlocked as needed", cliff: "—" },
  { category: "Strategic Partnerships", period: "24 Months", cliff: "3 Months" },
  { category: "Team & Advisors", period: "36 Months", cliff: "6 Months" },
  { category: "Marketing & Growth", period: "24 Months", cliff: "3 Months" },
  { category: "Treasury", period: "48 Months", cliff: "6 Months" },
  { category: "Launch & Airdrops", period: "Partially Unlocked", cliff: "—" },
];

export const SUPPLY_CURVE = [
  { month: 0, supply: 0 },
  { month: 12, supply: 200000000 },
  { month: 24, supply: 480000000 },
  { month: 36, supply: 700000000 },
  { month: 48, supply: 880000000 },
  { month: 60, supply: 1000000000 },
];

export const GROWTH_METRICS = [
  { key: "utility", label: "Growing Utility", color: "hsl(70.79deg 67% 59%)" },
  { key: "ecosystem", label: "Expanding Ecosystem", color: "hsl(70.79deg 50% 55%)" },
  { key: "adoption", label: "Increasing Adoption", color: "hsl(0deg 0% 70%)" },
  { key: "value", label: "Long-Term Value", color: "hsl(0deg 0% 45%)" },
];

export const GROWTH_DATA = [
  { year: "2024", utility: 12, ecosystem: 10, adoption: 8, value: 9 },
  { year: "2025", utility: 26, ecosystem: 24, adoption: 20, value: 18 },
  { year: "2026", utility: 42, ecosystem: 40, adoption: 34, value: 30 },
  { year: "2027", utility: 58, ecosystem: 55, adoption: 48, value: 43 },
  { year: "2028", utility: 72, ecosystem: 68, adoption: 62, value: 57 },
  { year: "2029", utility: 86, ecosystem: 80, adoption: 76, value: 71 },
  { year: "2030", utility: 100, ecosystem: 92, adoption: 88, value: 84 },
];
