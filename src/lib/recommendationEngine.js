export const CROP_TYPES = [
  'Rice',
  'Wheat',
  'Maize',
  'Cotton',
  'Tomato',
  'Sugarcane',
  'Potato',
  'Soybean',
  'Groundnut',
  'Millet',
]

export const DEMONSTRATION_THRESHOLDS = {
  moisture: {
    veryDry: 20,
    dry: 35,
    adequateMax: 65,
    wet: 80,
  },
  pH: {
    stronglyAcidic: 5.0,
    acidic: 5.8,
    alkaline: 7.5,
    stronglyAlkaline: 8.2,
  },
  temperatureC: {
    cold: 12,
    warmMax: 30,
    hot: 35,
  },
}

export const CROP_PROFILES = {
  Rice: {
    targetMoisture: 70,
    droughtTolerance: 'low',
    notes: 'Demo profile: rice is treated as preferring wetter soil.',
  },
  Wheat: {
    targetMoisture: 45,
    droughtTolerance: 'medium',
    notes: 'Demo profile: wheat is treated as moderately drought-tolerant.',
  },
  Maize: {
    targetMoisture: 50,
    droughtTolerance: 'medium',
    notes: 'Demo profile: maize is treated as needing consistent moderate moisture.',
  },
  Cotton: {
    targetMoisture: 40,
    droughtTolerance: 'high',
    notes: 'Demo profile: cotton is treated as more drought-tolerant.',
  },
  Tomato: {
    targetMoisture: 55,
    droughtTolerance: 'low',
    notes: 'Demo profile: tomato is treated as sensitive to moisture swings.',
  },
  Sugarcane: {
    targetMoisture: 65,
    droughtTolerance: 'low',
    notes: 'Demo profile: sugarcane is treated as a high-water crop.',
  },
  Potato: {
    targetMoisture: 50,
    droughtTolerance: 'medium',
    notes: 'Demo profile: potato is treated as needing even soil moisture.',
  },
  Soybean: {
    targetMoisture: 48,
    droughtTolerance: 'medium',
    notes: 'Demo profile: soybean is treated as a moderate-water crop.',
  },
  Groundnut: {
    targetMoisture: 42,
    droughtTolerance: 'high',
    notes: 'Demo profile: groundnut is treated as relatively drought-tolerant.',
  },
  Millet: {
    targetMoisture: 35,
    droughtTolerance: 'high',
    notes: 'Demo profile: millet is treated as a low-water crop.',
  },
}

const DISCLAIMER =
  'Demonstration rule-based output only. Thresholds are illustrative and are not scientifically validated agricultural advice.'

export function validateRecommendationInput(input) {
  const errors = {}
  const farmName = String(input.farmName ?? '').trim()
  const cropType = String(input.cropType ?? '').trim()
  const moisture = Number(input.moisture)
  const pH = Number(input.pH)
  const temperature = Number(input.temperature)

  if (!farmName) errors.farmName = 'Farm name is required.'
  else if (farmName.length > 80) errors.farmName = 'Farm name must be 80 characters or fewer.'

  if (!cropType) errors.cropType = 'Crop type is required.'
  else if (!CROP_TYPES.includes(cropType)) errors.cropType = 'Select a supported crop type.'

  if (input.moisture === '' || input.moisture === null || Number.isNaN(moisture)) {
    errors.moisture = 'Soil moisture is required.'
  } else if (moisture < 0 || moisture > 100) {
    errors.moisture = 'Soil moisture must be between 0 and 100%.'
  }

  if (input.pH === '' || input.pH === null || Number.isNaN(pH)) {
    errors.pH = 'Soil pH is required.'
  } else if (pH < 0 || pH > 14) {
    errors.pH = 'Soil pH must be between 0 and 14.'
  }

  if (input.temperature === '' || input.temperature === null || Number.isNaN(temperature)) {
    errors.temperature = 'Soil temperature is required.'
  } else if (temperature < -10 || temperature > 60) {
    errors.temperature = 'Soil temperature must be between -10°C and 60°C.'
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    values: {
      farmName,
      cropType,
      moisture,
      pH,
      temperature,
    },
  }
}

function urgencyRank(value) {
  if (value === 'high') return 3
  if (value === 'medium') return 2
  return 1
}

function raiseUrgency(current, next) {
  return urgencyRank(next) > urgencyRank(current) ? next : current
}

export function generateRecommendation(input) {
  const profile = CROP_PROFILES[input.cropType] ?? {
    targetMoisture: 50,
    droughtTolerance: 'medium',
    notes: 'Generic demonstration crop profile.',
  }

  const t = DEMONSTRATION_THRESHOLDS
  const moisture = input.moisture
  const pH = input.pH
  const temperature = input.temperature
  const reasons = []
  const modifiers = []

  let irrigationAction = 'Hold irrigation and continue monitoring'
  let urgency = 'low'
  let volumeHint = 'Demonstration hint: no additional irrigation suggested at this reading.'

  if (moisture < t.moisture.veryDry) {
    irrigationAction = 'Apply irrigation now'
    urgency = 'high'
    volumeHint = 'Demonstration hint: consider a full irrigation cycle because moisture is in the very-dry band.'
    reasons.push(
      `Soil moisture is ${moisture}%, below the demonstration very-dry threshold of ${t.moisture.veryDry}%.`,
    )
  } else if (moisture < t.moisture.dry) {
    irrigationAction = 'Schedule irrigation soon'
    urgency = 'medium'
    volumeHint = 'Demonstration hint: a moderate irrigation event is suggested in the dry band.'
    reasons.push(
      `Soil moisture is ${moisture}%, below the demonstration dry threshold of ${t.moisture.dry}%.`,
    )
  } else if (moisture <= t.moisture.adequateMax) {
    irrigationAction = 'Hold irrigation and continue monitoring'
    urgency = 'low'
    volumeHint = 'Demonstration hint: moisture sits in the adequate demonstration range.'
    reasons.push(
      `Soil moisture is ${moisture}%, within the demonstration adequate range of ${t.moisture.dry}–${t.moisture.adequateMax}%.`,
    )
  } else if (moisture <= t.moisture.wet) {
    irrigationAction = 'Delay irrigation'
    urgency = 'low'
    volumeHint = 'Demonstration hint: skip irrigation until moisture recedes from the wet band.'
    reasons.push(
      `Soil moisture is ${moisture}%, above the demonstration adequate maximum of ${t.moisture.adequateMax}%.`,
    )
  } else {
    irrigationAction = 'Do not irrigate — possible overwatering'
    urgency = 'medium'
    volumeHint = 'Demonstration hint: withhold water and review drainage if this trend continues.'
    reasons.push(
      `Soil moisture is ${moisture}%, above the demonstration wet threshold of ${t.moisture.wet}%.`,
    )
  }

  const moistureGap = profile.targetMoisture - moisture
  if (moistureGap >= 20 && moisture < t.moisture.wet) {
    urgency = raiseUrgency(urgency, profile.droughtTolerance === 'low' ? 'high' : 'medium')
    if (irrigationAction === 'Hold irrigation and continue monitoring') {
      irrigationAction = 'Apply a light irrigation'
      volumeHint = `Demonstration hint: ${input.cropType} target moisture is about ${profile.targetMoisture}%.`
    }
    modifiers.push(
      `${input.cropType} demo profile targets ~${profile.targetMoisture}% moisture (gap ${moistureGap.toFixed(0)} points). Drought tolerance is labelled ${profile.droughtTolerance}.`,
    )
  } else if (moistureGap <= -15) {
    if (irrigationAction.startsWith('Apply') || irrigationAction.startsWith('Schedule')) {
      irrigationAction = 'Hold irrigation and continue monitoring'
      volumeHint = `Demonstration hint: current moisture already exceeds the ${input.cropType} demo target of ${profile.targetMoisture}%.`
      urgency = 'low'
    }
    modifiers.push(
      `Current moisture is ${Math.abs(moistureGap).toFixed(0)} points above the ${input.cropType} demo target of ${profile.targetMoisture}%.`,
    )
  } else {
    modifiers.push(profile.notes)
  }

  if (pH < t.pH.stronglyAcidic) {
    modifiers.push(
      `Soil pH ${pH} is below the demonstration strongly-acidic threshold of ${t.pH.stronglyAcidic}. Nutrient availability may be limited in real fields; this does not change the irrigation volume by itself.`,
    )
  } else if (pH < t.pH.acidic) {
    modifiers.push(
      `Soil pH ${pH} is in the demonstration acidic band (below ${t.pH.acidic}). Record for agronomy follow-up; irrigation still follows moisture rules.`,
    )
  } else if (pH > t.pH.stronglyAlkaline) {
    modifiers.push(
      `Soil pH ${pH} is above the demonstration strongly-alkaline threshold of ${t.pH.stronglyAlkaline}.`,
    )
  } else if (pH > t.pH.alkaline) {
    modifiers.push(
      `Soil pH ${pH} is in the demonstration alkaline band (above ${t.pH.alkaline}).`,
    )
  } else {
    modifiers.push(
      `Soil pH ${pH} is inside the demonstration preferred window of ${t.pH.acidic}–${t.pH.alkaline}.`,
    )
  }

  if (temperature < t.temperatureC.cold) {
    if (urgency === 'high') {
      volumeHint = 'Demonstration hint: irrigate carefully; cold soils can slow uptake.'
    } else if (irrigationAction.startsWith('Schedule') || irrigationAction.startsWith('Apply a light')) {
      irrigationAction = 'Hold irrigation unless moisture is very low'
      urgency = 'low'
    }
    modifiers.push(
      `Soil temperature ${temperature}°C is below the demonstration cold threshold of ${t.temperatureC.cold}°C, so evaporative demand is treated as lower.`,
    )
  } else if (temperature > t.temperatureC.hot) {
    urgency = raiseUrgency(urgency, moisture < t.moisture.adequateMax ? 'high' : 'medium')
    if (irrigationAction === 'Hold irrigation and continue monitoring' && moisture < t.moisture.wet) {
      irrigationAction = 'Apply a light irrigation'
      volumeHint = 'Demonstration hint: hot soils can increase evaporative demand in this demo rule set.'
    }
    modifiers.push(
      `Soil temperature ${temperature}°C is above the demonstration hot threshold of ${t.temperatureC.hot}°C.`,
    )
  } else if (temperature > t.temperatureC.warmMax) {
    modifiers.push(
      `Soil temperature ${temperature}°C is above the demonstration warm maximum of ${t.temperatureC.warmMax}°C. Monitor drying rate.`,
    )
  } else {
    modifiers.push(
      `Soil temperature ${temperature}°C is inside the demonstration growing window of ${t.temperatureC.cold}–${t.temperatureC.warmMax}°C.`,
    )
  }

  return {
    irrigationAction,
    urgency,
    volumeHint,
    reasons,
    modifiers,
    cropProfile: profile,
    thresholdsUsed: t,
    disclaimer: DISCLAIMER,
  }
}
