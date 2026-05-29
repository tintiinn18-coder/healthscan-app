export interface AdditiveInfo {
  code: string
  name: string
  description: string
  risk_level: 'low' | 'medium' | 'high'
  health_concerns: string[]
  conditions_affected: string[]
  daily_limit?: string
  category: 'preservative' | 'sweetener' | 'color' | 'emulsifier' | 'antioxidant' | 'flavor_enhancer' | 'stabilizer' | 'other'
  aliases: string[]
  sourceName?: string
  sourceUrl?: string
  evidenceNote?: string
  riskWording?: string
  banned_in?: string[]
  acceptable_in?: string[]
  long_term_effects?: string[]
}

const UK_FSA_SOURCE = {
  sourceName: 'UK Food Standards Agency',
  sourceUrl: 'https://www.food.gov.uk/safety-hygiene/food-additives',
  evidenceNote: 'The UK FSA notes that certain artificial colours could increase hyperactivity in some children.',
  riskWording: 'Certain artificial colours may increase hyperactivity in some children.',
} as const

const WHO_IARC_PROCESSED_MEAT = {
  sourceName: 'WHO/IARC',
  sourceUrl: 'https://www.who.int/news-room/questions-and-answers/item/cancer-carcinogenicity-of-the-consumption-of-red-meat-and-processed-meat',
  evidenceNote: 'WHO/IARC reported that each 50g daily portion of processed meat was associated with about 18% increased colorectal cancer risk.',
  riskWording: 'Processed meat consumption has been associated with increased colorectal cancer risk. Risk depends on product type, amount, and overall diet.',
} as const

export const ADDITIVE_DATABASE: Record<string, AdditiveInfo> = {
  e250: {
    code: 'E250',
    name: 'Sodium Nitrite',
    category: 'preservative',
    risk_level: 'high',
    description: 'Used to preserve processed meats and maintain colour.',
    health_concerns: [
      'Common in processed meats and often discussed alongside broader processed meat intake.',
      'Can form nitrosamines under some conditions during processing or cooking.',
      'People watching sodium intake may also want to review products containing it.',
    ],
    conditions_affected: ['cancer_history', 'digestive_issues', 'hypertension', 'pregnancy'],
    daily_limit: '0.07 mg per kg of body weight (JECFA/EFSA reference intake)',
    aliases: ['sodium nitrite', 'nitrite', 'NaNO2', 'E250'],
    ...WHO_IARC_PROCESSED_MEAT,
  },
  e251: {
    code: 'E251',
    name: 'Sodium Nitrate',
    category: 'preservative',
    risk_level: 'medium',
    description: 'Preservative used in some cured meats and cheese products.',
    health_concerns: [
      'Can convert to nitrite in the body, so it is usually discussed in similar contexts.',
      'People reviewing processed meat intake may want to limit frequent exposure.',
    ],
    conditions_affected: ['cancer_history', 'digestive_issues', 'hypertension'],
    daily_limit: '3.7 mg per kg of body weight (JECFA reference intake)',
    aliases: ['sodium nitrate', 'NaNO3', 'E251'],
    ...WHO_IARC_PROCESSED_MEAT,
  },
  e951: {
    code: 'E951',
    name: 'Aspartame',
    category: 'sweetener',
    risk_level: 'medium',
    description: 'Low-calorie sweetener used in diet beverages and sugar-free foods.',
    health_concerns: [
      'Some people prefer to limit it when they are sensitive to artificial sweeteners.',
      'Contains phenylalanine, which is especially relevant for people with PKU.',
      'Some studies suggest it may be a migraine trigger for certain individuals.',
    ],
    conditions_affected: ['phenylketonuria', 'migraine', 'pregnancy'],
    daily_limit: '40 mg per kg of body weight (EFSA/FDA reference intake)',
    aliases: ['aspartame', 'E951', 'nutrasweet', 'equal', 'canderel'],
    sourceName: 'IARC / JECFA',
    sourceUrl: 'https://www.iarc.who.int/featured-news/aspartame-hazard-and-risk-assessment-results-released/',
    evidenceNote: 'IARC classified aspartame as possibly carcinogenic to humans, while JECFA kept its acceptable daily intake unchanged.',
    riskWording: 'Some agencies recommend considering total intake and individual sensitivity rather than treating occasional exposure as a diagnosis-level risk.',
  },
  e954: {
    code: 'E954',
    name: 'Saccharin',
    category: 'sweetener',
    risk_level: 'low',
    description: 'Older artificial sweetener often used in tabletop sweeteners and low-sugar foods.',
    health_concerns: [
      'Some users report aftertaste or digestive discomfort.',
      'People comparing sweeteners may still prefer to limit frequent use.',
    ],
    conditions_affected: ['digestive_issues'],
    daily_limit: '5 mg per kg of body weight (FDA reference intake)',
    aliases: ['saccharin', 'E954'],
    riskWording: 'Usually treated as a lower-priority additive question compared with sugar content and overall diet pattern.',
  },
  e211: {
    code: 'E211',
    name: 'Sodium Benzoate',
    category: 'preservative',
    risk_level: 'medium',
    description: 'Preservative commonly used in acidic drinks and packaged sauces.',
    health_concerns: [
      'Often reviewed more carefully in products marketed heavily to children.',
      'Some studies suggest it may be relevant for people tracking behavioural sensitivity or asthma triggers.',
    ],
    conditions_affected: ['adhd', 'asthma', 'allergies'],
    daily_limit: '5 mg per kg of body weight (JECFA reference intake)',
    aliases: ['sodium benzoate', 'E211'],
    sourceName: 'UK Food Standards Agency',
    sourceUrl: 'https://www.food.gov.uk/safety-hygiene/food-additives',
    evidenceNote: 'Artificial colours and certain preservative combinations are sometimes reviewed together in public food-safety discussions for children.',
    riskWording: 'Some studies suggest sensitivity questions in certain children or people with asthma, but context and dose matter.',
  },
  e220: {
    code: 'E220',
    name: 'Sulfur Dioxide',
    category: 'preservative',
    risk_level: 'medium',
    description: 'Preservative used in dried fruit, juices, and some processed foods.',
    health_concerns: [
      'Can be an issue for people with sulfite sensitivity.',
      'Some people with asthma are advised to pay closer attention to it.',
    ],
    conditions_affected: ['asthma', 'allergies', 'sulfite_sensitivity'],
    daily_limit: '0.7 mg per kg of body weight (JECFA reference intake)',
    aliases: ['sulfur dioxide', 'sulphur dioxide', 'E220', 'sulfite'],
    riskWording: 'Main concern is usually sensitivity in certain people rather than a universal warning for everyone.',
  },
  e102: {
    code: 'E102',
    name: 'Tartrazine (Yellow 5)',
    category: 'color',
    risk_level: 'medium',
    description: 'Synthetic yellow food colour used in candies, drinks, and packaged snacks.',
    health_concerns: [
      'Some families choose to limit it when reviewing behaviour-related sensitivities.',
      'People with certain dye sensitivities may prefer products without it.',
    ],
    conditions_affected: ['adhd', 'allergies', 'asthma', 'children'],
    daily_limit: '7.5 mg per kg of body weight (JECFA reference intake)',
    aliases: ['tartrazine', 'yellow 5', 'E102'],
    ...UK_FSA_SOURCE,
  },
  e104: {
    code: 'E104',
    name: 'Quinoline Yellow',
    category: 'color',
    risk_level: 'medium',
    description: 'Synthetic yellow food colour used in sweets and drinks.',
    health_concerns: ['Families tracking behavioural sensitivity may prefer to limit products containing it.'],
    conditions_affected: ['adhd', 'children'],
    aliases: ['quinoline yellow', 'E104'],
    ...UK_FSA_SOURCE,
  },
  e110: {
    code: 'E110',
    name: 'Sunset Yellow FCF',
    category: 'color',
    risk_level: 'medium',
    description: 'Synthetic orange-yellow food colour used in beverages and confectionery.',
    health_concerns: ['Often reviewed by families looking to reduce certain artificial colours.'],
    conditions_affected: ['adhd', 'children'],
    aliases: ['sunset yellow', 'E110'],
    ...UK_FSA_SOURCE,
  },
  e122: {
    code: 'E122',
    name: 'Carmoisine',
    category: 'color',
    risk_level: 'medium',
    description: 'Synthetic red food colour used in sweets, sauces, and processed snacks.',
    health_concerns: ['Often discussed when families want to limit certain artificial colours.'],
    conditions_affected: ['adhd', 'children'],
    aliases: ['carmoisine', 'azorubine', 'E122'],
    ...UK_FSA_SOURCE,
  },
  e124: {
    code: 'E124',
    name: 'Ponceau 4R',
    category: 'color',
    risk_level: 'medium',
    description: 'Synthetic red colour used in candies and packaged products.',
    health_concerns: ['Sometimes limited by families who prefer to avoid certain artificial colours.'],
    conditions_affected: ['adhd', 'children'],
    aliases: ['ponceau 4r', 'E124'],
    ...UK_FSA_SOURCE,
  },
  e129: {
    code: 'E129',
    name: 'Allura Red AC',
    category: 'color',
    risk_level: 'medium',
    description: 'Synthetic red food colour used in drinks, sweets, and flavoured snacks.',
    health_concerns: [
      'Often reviewed in the same group as other artificial colours of concern for some children.',
      'Some households prefer to reduce frequent exposure where possible.',
    ],
    conditions_affected: ['adhd', 'children', 'allergies'],
    daily_limit: '7 mg per kg of body weight (JECFA reference intake)',
    aliases: ['allura red', 'red 40', 'E129'],
    ...UK_FSA_SOURCE,
  },
  e282: {
    code: 'E282',
    name: 'Calcium Propionate',
    category: 'preservative',
    risk_level: 'medium',
    description: 'Preservative commonly used in packaged bread and baked goods.',
    health_concerns: [
      'Some people prefer to watch it in heavily processed baked foods.',
      'Some studies suggest behavioural sensitivity questions in certain children.',
    ],
    conditions_affected: ['adhd', 'children', 'migraine'],
    aliases: ['calcium propionate', 'E282'],
    riskWording: 'Some studies suggest sensitivity concerns in certain children, but context and overall diet still matter.',
  },
  e320: {
    code: 'E320',
    name: 'BHA',
    category: 'antioxidant',
    risk_level: 'high',
    description: 'Synthetic antioxidant used to help packaged fats and oils stay shelf-stable.',
    health_concerns: [
      'Some consumers prefer to reduce frequent exposure where natural alternatives are available.',
      'Often discussed in additive reviews because of longer-running safety questions.',
    ],
    conditions_affected: ['cancer_history', 'pregnancy', 'liver_issues'],
    aliases: ['bha', 'butylated hydroxyanisole', 'E320'],
    sourceName: 'IARC',
    sourceUrl: 'https://monographs.iarc.who.int/list-of-classifications',
    evidenceNote: 'IARC has reviewed BHA in its monograph program and it is often cited in cautious additive reviews.',
    riskWording: 'Some public food-safety sources treat it as an additive worth limiting when more minimally processed alternatives are available.',
  },
  e321: {
    code: 'E321',
    name: 'BHT',
    category: 'antioxidant',
    risk_level: 'medium',
    description: 'Synthetic antioxidant used in cereals, snack foods, and packaged fats.',
    health_concerns: [
      'Often grouped with BHA in additive reviews.',
      'Some shoppers prefer products preserved with simpler ingredients instead.',
    ],
    conditions_affected: ['pregnancy', 'liver_issues'],
    aliases: ['bht', 'butylated hydroxytoluene', 'E321'],
    riskWording: 'May be worth limiting if you are trying to reduce highly processed additive exposure overall.',
  },
  e407: {
    code: 'E407',
    name: 'Carrageenan',
    category: 'stabilizer',
    risk_level: 'medium',
    description: 'Seaweed-derived thickener used in dairy alternatives and processed foods.',
    health_concerns: [
      'Some people with digestive sensitivity prefer to monitor it.',
      'Some studies suggest it may be a concern for certain people with IBS-style symptoms.',
    ],
    conditions_affected: ['ibs', 'digestive_issues', 'autoimmune'],
    aliases: ['carrageenan', 'E407'],
    riskWording: 'Some studies suggest it may be a concern for certain people with digestive sensitivity.',
  },
  e415: {
    code: 'E415',
    name: 'Xanthan Gum',
    category: 'stabilizer',
    risk_level: 'low',
    description: 'Thickener used in sauces, dressings, and gluten-free products.',
    health_concerns: [
      'Usually treated as low concern, though some people notice digestive bloating with higher intake.',
    ],
    conditions_affected: ['ibs'],
    aliases: ['xanthan gum', 'E415'],
    riskWording: 'Usually lower concern unless you are personally sensitive to gums or stabilizers.',
  },
  e621: {
    code: 'E621',
    name: 'Monosodium Glutamate (MSG)',
    category: 'flavor_enhancer',
    risk_level: 'medium',
    description: 'Flavour enhancer that adds umami taste to savoury packaged foods.',
    health_concerns: [
      'Some people report headache or flushing after large amounts.',
      'People with migraine sensitivity may prefer to track it personally.',
    ],
    conditions_affected: ['migraine', 'headaches', 'asthma'],
    aliases: ['monosodium glutamate', 'msg', 'E621'],
    riskWording: 'Main question is usually individual sensitivity rather than a blanket warning for everyone.',
  },
  e903: {
    code: 'E903',
    name: 'Carnauba Wax',
    category: 'other',
    risk_level: 'low',
    description: 'Plant-based glazing agent used on candies and coated products.',
    health_concerns: ['Typically treated as low concern in food amounts.'],
    conditions_affected: [],
    aliases: ['carnauba wax', 'E903'],
  },
  e904: {
    code: 'E904',
    name: 'Shellac',
    category: 'other',
    risk_level: 'low',
    description: 'Glazing agent used on confectionery and some coated products.',
    health_concerns: ['Relevant mainly for people avoiding insect-derived ingredients.'],
    conditions_affected: ['vegan', 'vegetarian'],
    aliases: ['shellac', 'E904'],
  },
  e955: {
    code: 'E955',
    name: 'Sucralose',
    category: 'sweetener',
    risk_level: 'medium',
    description: 'Artificial sweetener used in low-sugar drinks and packaged foods.',
    health_concerns: [
      'Some studies suggest it may affect appetite cues or gut comfort for certain people.',
      'People trying to reduce sweetener dependence may still prefer simpler options.',
    ],
    conditions_affected: ['digestive_issues', 'diabetes', 'obesity'],
    aliases: ['sucralose', 'splenda', 'E955'],
    riskWording: 'Some studies suggest it may be worth monitoring if you are sensitive to artificial sweeteners.',
  },
}

export function getAdditiveInfo(additiveTag: string): AdditiveInfo | null {
  const normalized = additiveTag
    .toLowerCase()
    .replace(/^en:/, '')
    .replace(/^additive-/, '')
    .replace(/\s/g, '')

  if (ADDITIVE_DATABASE[normalized]) {
    return ADDITIVE_DATABASE[normalized]
  }

  if (!normalized.startsWith('e') && ADDITIVE_DATABASE[`e${normalized}`]) {
    return ADDITIVE_DATABASE[`e${normalized}`]
  }

  for (const info of Object.values(ADDITIVE_DATABASE)) {
    if (info.aliases.some((alias) => alias.toLowerCase().replace(/\s/g, '') === normalized)) {
      return info
    }
  }

  return null
}

export function getAllAdditives(): AdditiveInfo[] {
  return Object.values(ADDITIVE_DATABASE)
}

export function getAdditivesByRiskLevel(level: 'low' | 'medium' | 'high'): AdditiveInfo[] {
  return Object.values(ADDITIVE_DATABASE).filter((item) => item.risk_level === level)
}

export function getAdditivesByCondition(condition: string): AdditiveInfo[] {
  const normalized = condition.toLowerCase().replace(/\s+/g, '_')
  return Object.values(ADDITIVE_DATABASE).filter((item) => item.conditions_affected.includes(normalized))
}
