import { generateRecommendation } from './recommendationEngine'

const DEMO_FARM_ID = 'farm_demo_sunrise'

export const DEMO_FARM = {
  id: DEMO_FARM_ID,
  name: 'Sunrise Demo Farm',
  location: 'Nashik, Maharashtra (sample)',
  areaHectares: 4.2,
  primaryCrop: 'Tomato',
  notes: 'Marked sample farm for demonstration. Values are illustrative.',
  createdAt: '2026-10-18T08:00:00.000Z',
  isDemo: true,
}

const DEMO_READING_SEED = [
  {
    id: 'reading_demo_1',
    farmId: DEMO_FARM_ID,
    farmName: DEMO_FARM.name,
    cropType: 'Tomato',
    moisture: 28,
    pH: 6.4,
    temperature: 27,
    createdAt: '2026-10-20T09:15:00.000Z',
    isDemo: true,
  },
  {
    id: 'reading_demo_2',
    farmId: DEMO_FARM_ID,
    farmName: DEMO_FARM.name,
    cropType: 'Tomato',
    moisture: 41,
    pH: 6.5,
    temperature: 29,
    createdAt: '2026-10-23T10:00:00.000Z',
    isDemo: true,
  },
  {
    id: 'reading_demo_3',
    farmId: DEMO_FARM_ID,
    farmName: DEMO_FARM.name,
    cropType: 'Wheat',
    moisture: 52,
    pH: 7.1,
    temperature: 22,
    createdAt: '2026-10-26T07:40:00.000Z',
    isDemo: true,
  },
  {
    id: 'reading_demo_4',
    farmId: DEMO_FARM_ID,
    farmName: DEMO_FARM.name,
    cropType: 'Maize',
    moisture: 18,
    pH: 6.1,
    temperature: 34,
    createdAt: '2026-10-29T11:20:00.000Z',
    isDemo: true,
  },
  {
    id: 'reading_demo_5',
    farmId: DEMO_FARM_ID,
    farmName: DEMO_FARM.name,
    cropType: 'Rice',
    moisture: 74,
    pH: 5.9,
    temperature: 26,
    createdAt: '2026-11-01T08:05:00.000Z',
    isDemo: true,
  },
]

function toRecommendation(reading, id) {
  const result = generateRecommendation(reading)
  return {
    id,
    farmId: reading.farmId,
    farmName: reading.farmName,
    cropType: reading.cropType,
    moisture: reading.moisture,
    pH: reading.pH,
    temperature: reading.temperature,
    createdAt: reading.createdAt,
    result,
    isDemo: true,
  }
}

export function buildDemoPayload() {
  return {
    farms: [DEMO_FARM],
    readings: DEMO_READING_SEED,
    recommendations: [
      toRecommendation(DEMO_READING_SEED[0], 'rec_demo_1'),
      toRecommendation(DEMO_READING_SEED[3], 'rec_demo_2'),
      toRecommendation(DEMO_READING_SEED[4], 'rec_demo_3'),
    ],
  }
}

export { DEMO_FARM_ID }
