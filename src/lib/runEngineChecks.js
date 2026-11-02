import { generateRecommendation, validateRecommendationInput } from './recommendationEngine.js'

const cases = [
  {
    name: 'very dry tomato',
    input: { farmName: 'Sunrise Demo Farm', cropType: 'Tomato', moisture: 12, pH: 6.4, temperature: 28 },
    expectActionIncludes: 'irrigat',
  },
  {
    name: 'wet rice',
    input: { farmName: 'Sunrise Demo Farm', cropType: 'Rice', moisture: 86, pH: 6.0, temperature: 24 },
    expectActionIncludes: 'not irrigate',
  },
  {
    name: 'adequate wheat',
    input: { farmName: 'Plot B', cropType: 'Wheat', moisture: 48, pH: 6.8, temperature: 21 },
    expectActionIncludes: 'hold',
  },
]

let failed = 0

const missingFarm = validateRecommendationInput({
  farmName: '',
  cropType: 'Tomato',
  moisture: 40,
  pH: 6,
  temperature: 22,
})
if (missingFarm.ok) {
  console.error('Expected farm name validation to fail')
  failed += 1
}

const badMoisture = validateRecommendationInput({
  farmName: 'A',
  cropType: 'Tomato',
  moisture: 140,
  pH: 6,
  temperature: 22,
})
if (badMoisture.ok) {
  console.error('Expected moisture validation to fail')
  failed += 1
}

for (const test of cases) {
  const check = validateRecommendationInput(test.input)
  if (!check.ok) {
    console.error(test.name, 'failed validation', check.errors)
    failed += 1
    continue
  }
  const result = generateRecommendation(check.values)
  if (!result.irrigationAction.toLowerCase().includes(test.expectActionIncludes)) {
    console.error(test.name, 'unexpected action:', result.irrigationAction)
    failed += 1
  } else {
    console.log('ok', test.name, '->', result.irrigationAction)
  }
}

if (failed > 0) {
  process.exit(1)
}

console.log('Engine checks passed')
