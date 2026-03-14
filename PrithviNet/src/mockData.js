// ─── Mock Data for PrithviNet Dashboard ─────────────────────────────
// Realistic demo data for Chhattisgarh environmental monitoring

export const REGIONS = [
  {
    id: "raipur",
    name: "Raipur",
    lat: 21.2514,
    lng: 81.6296,
    district: "Raipur",
    compliance: 45,
  },
  {
    id: "bilaspur",
    name: "Bilaspur",
    lat: 22.0797,
    lng: 82.1409,
    district: "Bilaspur",
    compliance: 92,
  },
  {
    id: "korba",
    name: "Korba",
    lat: 22.3595,
    lng: 82.7501,
    district: "Korba",
    compliance: 71,
  },
  {
    id: "durg",
    name: "Durg",
    lat: 21.1904,
    lng: 81.2849,
    district: "Durg",
    compliance: 52,
  },
  {
    id: "bhilai",
    name: "Bhilai",
    lat: 21.2167,
    lng: 81.3833,
    district: "Durg",
    compliance: 72,
  },
  {
    id: "jagdalpur",
    name: "Jagdalpur",
    lat: 19.0868,
    lng: 82.0208,
    district: "Bastar",
    compliance: 88,
  },
  {
    id: "rajnandgaon",
    name: "Rajnandgaon",
    lat: 21.0974,
    lng: 81.0283,
    district: "Rajnandgaon",
    compliance: 78,
  },
  {
    id: "ambikapur",
    name: "Ambikapur",
    lat: 23.1216,
    lng: 83.1985,
    district: "Surguja",
    compliance: 85,
  },
];

export const MOCK_INDUSTRIES = [
  {
    id: "ind-1",
    name: "ABC Steel Ltd.",
    type: "Steel",
    registrationNo: "CG-STL-001",
    status: "ACTIVE",
    compliant: false,
    violations: 5,
    region: "Raipur",
    lat: 21.26,
    lng: 81.64,
    lastReport: "2 hours ago",
    problem: "Air pollution too high",
  },
  {
    id: "ind-2",
    name: "PQR Textiles",
    type: "Textile",
    registrationNo: "CG-TXT-002",
    status: "ACTIVE",
    compliant: true,
    violations: 0,
    region: "Raipur",
    lat: 21.24,
    lng: 81.62,
    lastReport: "4 hours ago",
    problem: null,
  },
  {
    id: "ind-3",
    name: "XYZ Chemicals",
    type: "Chemical",
    registrationNo: "CG-CHM-003",
    status: "ACTIVE",
    compliant: false,
    violations: 3,
    region: "Raipur",
    lat: 21.27,
    lng: 81.65,
    lastReport: "2 days late",
    problem: "Report not submitted",
  },
  {
    id: "ind-4",
    name: "Korba Thermal Power",
    type: "Power",
    registrationNo: "CG-PWR-004",
    status: "ACTIVE",
    compliant: false,
    violations: 8,
    region: "Korba",
    lat: 22.36,
    lng: 82.75,
    lastReport: "1 hour ago",
    problem: "SO₂ exceedance",
  },
  {
    id: "ind-5",
    name: "Bhilai Steel Plant",
    type: "Steel",
    registrationNo: "CG-STL-005",
    status: "ACTIVE",
    compliant: true,
    violations: 1,
    region: "Bhilai",
    lat: 21.22,
    lng: 81.38,
    lastReport: "30 mins ago",
    problem: null,
  },
  {
    id: "ind-6",
    name: "Durg Cement Works",
    type: "Cement",
    registrationNo: "CG-CMT-006",
    status: "ACTIVE",
    compliant: false,
    violations: 4,
    region: "Durg",
    lat: 21.19,
    lng: 81.29,
    lastReport: "6 hours ago",
    problem: "PM2.5 exceedance",
  },
  {
    id: "ind-7",
    name: "Green Valley Pharma",
    type: "Pharmaceutical",
    registrationNo: "CG-PHR-007",
    status: "ACTIVE",
    compliant: true,
    violations: 0,
    region: "Bilaspur",
    lat: 22.08,
    lng: 82.14,
    lastReport: "3 hours ago",
    problem: null,
  },
  {
    id: "ind-8",
    name: "Raipur Paper Mill",
    type: "Paper",
    registrationNo: "CG-PPR-008",
    status: "ACTIVE",
    compliant: false,
    violations: 2,
    region: "Raipur",
    lat: 21.23,
    lng: 81.6,
    lastReport: "1 day ago",
    problem: "Water BOD limit exceeded",
  },
  {
    id: "ind-9",
    name: "Jagdalpur Agro",
    type: "Agriculture",
    registrationNo: "CG-AGR-009",
    status: "ACTIVE",
    compliant: true,
    violations: 0,
    region: "Jagdalpur",
    lat: 19.09,
    lng: 82.02,
    lastReport: "1 hour ago",
    problem: null,
  },
  {
    id: "ind-10",
    name: "Ambikapur Mining Co.",
    type: "Mining",
    registrationNo: "CG-MIN-010",
    status: "ACTIVE",
    compliant: true,
    violations: 0,
    region: "Ambikapur",
    lat: 23.12,
    lng: 83.2,
    lastReport: "5 hours ago",
    problem: null,
  },
  {
    id: "ind-11",
    name: "Rajnandgaon Iron",
    type: "Iron & Steel",
    registrationNo: "CG-IRN-011",
    status: "ACTIVE",
    compliant: true,
    violations: 1,
    region: "Rajnandgaon",
    lat: 21.1,
    lng: 81.03,
    lastReport: "2 hours ago",
    problem: null,
  },
  {
    id: "ind-12",
    name: "Korba Coal Washery",
    type: "Coal",
    registrationNo: "CG-COL-012",
    status: "SUSPENDED",
    compliant: false,
    violations: 12,
    region: "Korba",
    lat: 22.37,
    lng: 82.74,
    lastReport: "5 days late",
    problem: "Multiple violations",
  },
];

export const MOCK_STATIONS = [
  {
    id: "stn-1",
    name: "Raipur Central AQMS",
    type: "AIR",
    lat: 21.2514,
    lng: 81.6296,
    region: "Raipur",
    aqi: 156,
    status: "Poor",
  },
  {
    id: "stn-2",
    name: "Raipur Mowa WQ",
    type: "WATER",
    lat: 21.27,
    lng: 81.61,
    region: "Raipur",
    ph: 7.2,
    status: "Good",
  },
  {
    id: "stn-3",
    name: "Raipur Noise Station",
    type: "NOISE",
    lat: 21.24,
    lng: 81.65,
    region: "Raipur",
    laeq: 72,
    status: "Moderate",
  },
  {
    id: "stn-4",
    name: "Bilaspur AQMS",
    type: "AIR",
    lat: 22.0797,
    lng: 82.1409,
    region: "Bilaspur",
    aqi: 85,
    status: "Good",
  },
  {
    id: "stn-5",
    name: "Korba Industrial AQMS",
    type: "AIR",
    lat: 22.3595,
    lng: 82.7501,
    region: "Korba",
    aqi: 198,
    status: "Poor",
  },
  {
    id: "stn-6",
    name: "Durg AQMS",
    type: "AIR",
    lat: 21.1904,
    lng: 81.2849,
    region: "Durg",
    aqi: 142,
    status: "Moderate",
  },
  {
    id: "stn-7",
    name: "Bhilai Steel Zone AQMS",
    type: "AIR",
    lat: 21.2167,
    lng: 81.3833,
    region: "Bhilai",
    aqi: 98,
    status: "Good",
  },
  {
    id: "stn-8",
    name: "Jagdalpur AQMS",
    type: "AIR",
    lat: 19.0868,
    lng: 82.0208,
    region: "Jagdalpur",
    aqi: 62,
    status: "Good",
  },
];

export const REGION_DETAILS = {
  raipur: {
    industries: { total: 142, compliant: 64, nonCompliant: 78, pending: 12 },
    stations: 8,
    recentViolations: [
      { type: "PM2.5 Exceedance", cases: 15 },
      { type: "Water BOD Limit", cases: 8 },
      { type: "Noise Pollution", cases: 5 },
    ],
    trend: { change: -8, direction: "down" },
    actions: "3 Show Cause Notices Issued",
    avgAir: { aqi: 156, pm25: 78.5, no2: 42.3, so2: 28.1 },
    avgWater: { ph: 7.2, bod: 18.5, cod: 45.2, tds: 320 },
    avgNoise: { laeq: 72, lmax: 89, lmin: 45 },
  },
  bilaspur: {
    industries: { total: 45, compliant: 41, nonCompliant: 4, pending: 2 },
    stations: 5,
    recentViolations: [
      { type: "PM10 Exceedance", cases: 2 },
      { type: "Water TDS", cases: 1 },
    ],
    trend: { change: 5, direction: "up" },
    actions: "0 Notices Issued",
    avgAir: { aqi: 85, pm25: 35.2, no2: 22.1, so2: 15.3 },
    avgWater: { ph: 7.5, bod: 8.2, cod: 22.1, tds: 180 },
    avgNoise: { laeq: 52, lmax: 68, lmin: 38 },
  },
  korba: {
    industries: { total: 68, compliant: 48, nonCompliant: 20, pending: 5 },
    stations: 6,
    recentViolations: [
      { type: "SO₂ Exceedance", cases: 10 },
      { type: "PM2.5 Exceedance", cases: 8 },
      { type: "Fly Ash Violation", cases: 3 },
    ],
    trend: { change: -3, direction: "down" },
    actions: "5 Show Cause Notices Issued",
    avgAir: { aqi: 198, pm25: 95.3, no2: 55.8, so2: 68.2 },
    avgWater: { ph: 6.8, bod: 22.5, cod: 58.3, tds: 420 },
    avgNoise: { laeq: 78, lmax: 95, lmin: 52 },
  },
  durg: {
    industries: { total: 82, compliant: 43, nonCompliant: 39, pending: 8 },
    stations: 4,
    recentViolations: [
      { type: "PM2.5 Exceedance", cases: 12 },
      { type: "Noise Standard", cases: 6 },
    ],
    trend: { change: -5, direction: "down" },
    actions: "2 Show Cause Notices Issued",
    avgAir: { aqi: 142, pm25: 68.2, no2: 38.5, so2: 32.1 },
    avgWater: { ph: 7.0, bod: 15.3, cod: 38.5, tds: 280 },
    avgNoise: { laeq: 68, lmax: 82, lmin: 42 },
  },
  bhilai: {
    industries: { total: 55, compliant: 40, nonCompliant: 15, pending: 3 },
    stations: 4,
    recentViolations: [{ type: "PM10 Exceedance", cases: 5 }],
    trend: { change: 3, direction: "up" },
    actions: "1 Show Cause Notice Issued",
    avgAir: { aqi: 98, pm25: 42.1, no2: 28.5, so2: 22.3 },
    avgWater: { ph: 7.3, bod: 12.5, cod: 30.2, tds: 240 },
    avgNoise: { laeq: 65, lmax: 78, lmin: 40 },
  },
  jagdalpur: {
    industries: { total: 22, compliant: 19, nonCompliant: 3, pending: 1 },
    stations: 3,
    recentViolations: [{ type: "Water pH", cases: 1 }],
    trend: { change: 2, direction: "up" },
    actions: "0 Notices Issued",
    avgAir: { aqi: 62, pm25: 25.3, no2: 15.8, so2: 10.2 },
    avgWater: { ph: 7.8, bod: 5.2, cod: 15.3, tds: 120 },
    avgNoise: { laeq: 48, lmax: 62, lmin: 32 },
  },
  rajnandgaon: {
    industries: { total: 38, compliant: 30, nonCompliant: 8, pending: 2 },
    stations: 3,
    recentViolations: [{ type: "PM2.5 Exceedance", cases: 3 }],
    trend: { change: 1, direction: "up" },
    actions: "1 Notice Issued",
    avgAir: { aqi: 88, pm25: 38.5, no2: 25.2, so2: 18.5 },
    avgWater: { ph: 7.4, bod: 10.2, cod: 25.5, tds: 200 },
    avgNoise: { laeq: 55, lmax: 70, lmin: 38 },
  },
  ambikapur: {
    industries: { total: 28, compliant: 24, nonCompliant: 4, pending: 1 },
    stations: 3,
    recentViolations: [{ type: "Water BOD", cases: 2 }],
    trend: { change: 4, direction: "up" },
    actions: "0 Notices Issued",
    avgAir: { aqi: 72, pm25: 30.1, no2: 18.5, so2: 12.8 },
    avgWater: { ph: 7.6, bod: 6.8, cod: 18.2, tds: 150 },
    avgNoise: { laeq: 50, lmax: 65, lmin: 35 },
  },
};

// Year-over-year trend data
export function generateYoYData(type) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  if (type === "air") {
    return months.map((month, i) => {
      const base2022 = [
        165, 158, 145, 152, 168, 142, 135, 138, 148, 172, 185, 178,
      ][i];
      const base2023 = [
        142, 138, 131, 139, 155, 128, 122, 124, 135, 158, 169, 163,
      ][i];
      const base2024 = [
        128, 125, 118, 121, 142, 115, 109, 112, 119, 145, 152, 148,
      ][i];
      const target = [
        120, 115, 110, 115, 130, 110, 105, 108, 115, 135, 140, 138,
      ][i];
      const yoyChange = (((base2024 - base2023) / base2023) * 100).toFixed(1);
      return {
        month,
        y2022: base2022,
        y2023: base2023,
        y2024: base2024,
        target,
        yoyChange: parseFloat(yoyChange),
      };
    });
  }

  if (type === "water") {
    return months.map((month, i) => {
      const base2022 = [
        7.8, 7.6, 7.5, 7.4, 7.3, 7.2, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6,
      ][i];
      const base2023 = [
        7.5, 7.4, 7.3, 7.2, 7.1, 7.0, 7.0, 7.1, 7.2, 7.3, 7.3, 7.4,
      ][i];
      const base2024 = [
        7.3, 7.2, 7.1, 7.1, 7.0, 6.9, 6.9, 7.0, 7.1, 7.2, 7.2, 7.3,
      ][i];
      const target = [
        7.0, 7.0, 7.0, 7.0, 7.0, 7.0, 7.0, 7.0, 7.0, 7.0, 7.0, 7.0,
      ][i];
      const yoyChange = (((base2024 - base2023) / base2023) * 100).toFixed(1);
      return {
        month,
        y2022: base2022,
        y2023: base2023,
        y2024: base2024,
        target,
        yoyChange: parseFloat(yoyChange),
      };
    });
  }

  // noise
  return months.map((month, i) => {
    const base2022 = [72, 70, 68, 71, 74, 69, 66, 67, 70, 73, 75, 74][i];
    const base2023 = [68, 66, 64, 67, 70, 65, 62, 63, 66, 69, 71, 70][i];
    const base2024 = [65, 63, 61, 64, 67, 62, 59, 60, 63, 66, 68, 67][i];
    const target = [55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55, 55][i];
    const yoyChange = (((base2024 - base2023) / base2023) * 100).toFixed(1);
    return {
      month,
      y2022: base2022,
      y2023: base2023,
      y2024: base2024,
      target,
      yoyChange: parseFloat(yoyChange),
    };
  });
}

export function getComplianceColor(score) {
  if (score >= 80) return "#10b981";
  if (score >= 60) return "#fbbf24";
  return "#ef4444";
}

export function getComplianceLabel(score) {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Moderate";
  return "Poor";
}

export function getRiskLevel(score) {
  if (score >= 80) return "LOW";
  if (score >= 60) return "MEDIUM";
  return "HIGH";
}

export const MOCK_ALERTS = [
  {
    id: "a1",
    severity: "CRITICAL",
    parameter: "PM2.5",
    message:
      "PM2.5 level at 185 µg/m³ exceeds limit of 60 µg/m³ at Raipur Central AQMS",
    location: "Raipur Central AQMS",
    region: "Raipur",
    value: 185,
    limit: 60,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: "a2",
    severity: "CRITICAL",
    parameter: "SO₂",
    message:
      "SO₂ level at 120 ppb — exceeds permitted limit of 80 ppb near Korba Thermal Power",
    location: "Korba Industrial AQMS",
    region: "Korba",
    value: 120,
    limit: 80,
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    id: "a3",
    severity: "WARNING",
    parameter: "BOD",
    message: "Water BOD at 32 mg/L — exceeds limit of 30 mg/L in Kharoon River",
    location: "Raipur Mowa WQ",
    region: "Raipur",
    value: 32,
    limit: 30,
    createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
  },
  {
    id: "a4",
    severity: "WARNING",
    parameter: "Noise",
    message:
      "Noise level at 82 dB in residential zone (limit: 55 dB) near Durg Cement Works",
    location: "Durg AQMS",
    region: "Durg",
    value: 82,
    limit: 55,
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
  {
    id: "a5",
    severity: "CRITICAL",
    parameter: "PM10",
    message: "PM10 at 245 µg/m³ — severe level at Korba Coal Washery area",
    location: "Korba Industrial AQMS",
    region: "Korba",
    value: 245,
    limit: 100,
    createdAt: new Date(Date.now() - 15 * 3600000).toISOString(),
  },
  {
    id: "a6",
    severity: "WARNING",
    parameter: "pH",
    message: "Water pH dropped to 5.8 at downstream monitoring — acidic",
    location: "Bilaspur AQMS",
    region: "Bilaspur",
    value: 5.8,
    limit: 6.5,
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    id: "a7",
    severity: "INFO",
    parameter: "AQI",
    message:
      "AQI improved to 85 in Jagdalpur region — maintenance advisory lifted",
    location: "Jagdalpur AQMS",
    region: "Jagdalpur",
    value: 85,
    limit: 100,
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
  },
];
