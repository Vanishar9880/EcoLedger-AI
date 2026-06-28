export const emissionFactors = {
  "Facility Energy": {
    factor: 0.716,
    unit: "kWh",
  },

  "Business Travel": {
    factor: 150,
    unit: "passenger",
  },

  Logistics: {
    factor: 0.12,
    unit: "km",
  },

  "Mobile Combustion": {
    factor: 2.68,
    unit: "litres",
  },
};

const categoryAliases = {
  electricity: "Facility Energy",
  "facility energy": "Facility Energy",
  "energy bill": "Facility Energy",
  "power bill": "Facility Energy",
  "electricity bill": "Facility Energy",
  power: "Facility Energy",
  energy: "Facility Energy",
  utility: "Facility Energy",
  travel: "Business Travel",
  flight: "Business Travel",
  flights: "Business Travel",
  "air travel": "Business Travel",
  "flight ticket": "Business Travel",
  "flight tickets": "Business Travel",
  "air ticket": "Business Travel",
  "air tickets": "Business Travel",
  airline: "Business Travel",
  airlines: "Business Travel",
  airfare: "Business Travel",
  aviation: "Business Travel",
  "business travel": "Business Travel",
  "air transport": "Business Travel",
  logistics: "Logistics",
  freight: "Logistics",
  transport: "Logistics",
  diesel: "Mobile Combustion",
  fuel: "Mobile Combustion",
  petrol: "Mobile Combustion",
  gasoline: "Mobile Combustion",
  "mobile combustion": "Mobile Combustion",
};

const unitAliases = {
  kwh: "kWh",
  kw: "kWh",
  kilowatt: "kWh",
  "kilowatt-hour": "kWh",
  "kilowatt-hours": "kWh",
  passenger: "passenger",
  passengers: "passenger",
  pax: "passenger",
  ticket: "passenger",
  tickets: "passenger",
  seat: "passenger",
  seats: "passenger",
  traveler: "passenger",
  travellers: "passenger",
  travelers: "passenger",
  traveller: "passenger",
  person: "passenger",
  persons: "passenger",
  adult: "passenger",
  adults: "passenger",
  pnr: "passenger",
  km: "km",
  kilometer: "km",
  kilometers: "km",
  kilometre: "km",
  kilometres: "km",
  litre: "litres",
  liter: "litres",
  liters: "litres",
  l: "litres",
  litres: "litres",
};

export const normalizeCategory = (category) => {
  if (!category) return null;

  const trimmed = String(category).trim();
  if (emissionFactors[trimmed]) return trimmed;

  const lower = trimmed.toLowerCase();
  const exactAlias = categoryAliases[lower];
  if (exactAlias) return exactAlias;

  const flightKeys = [
    "air travel",
    "flight ticket",
    "flight",
    "airline",
    "air ticket",
    "airfare",
    "aviation",
    "business travel",
  ];
  if (flightKeys.some((key) => lower.includes(key))) {
    return "Business Travel";
  }

  return trimmed;
};

export const normalizeUnit = (unit) => {
  if (!unit) return null;

  const trimmed = String(unit).trim();
  const alias = unitAliases[trimmed.toLowerCase()];
  return alias || trimmed;
};

export const getEmissionFactor = (category) => {
  const normalized = normalizeCategory(category);
  const entry = emissionFactors[normalized];
  if (!entry || !entry.factor) return null;
  return { category: normalized, ...entry };
};

export const validateCategoryUnit = (category, unit) => {
  const factorEntry = getEmissionFactor(category);
  if (!factorEntry) {
    return {
      valid: false,
      reason: `Unsupported invoice category: ${category}`,
    };
  }

  const normalizedUnit = normalizeUnit(unit);
  if (normalizedUnit !== factorEntry.unit) {
    return {
      valid: false,
      reason: `Invalid unit for ${factorEntry.category}: expected ${factorEntry.unit}, got ${unit}`,
    };
  }

  return { valid: true, category: factorEntry.category, unit: normalizedUnit };
};