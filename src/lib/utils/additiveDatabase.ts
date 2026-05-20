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
  banned_in?: string[]
  acceptable_in?: string[]
  long_term_effects?: string[]
}

export const ADDITIVE_DATABASE: Record<string, AdditiveInfo> = {
  // HIGH RISK - Preservatives
  'e250': {
    code: 'E250',
    name: odium Nitrite',
    description: 'Preservative used in processed meats to prevent bacterial growth and maintain pink color.',
    risk_level: 'high',
    health_concerns: [
      'Linked to increased colorectal cancer risk in epidemiological studies (IARC Group 2A probable carcinogen when ingested)',
      'Forms nitrosamines (carcinogenic compounds) when heated or combined with stomach acid',
      'May cause methemoglobinemia in infants - dangerous oxygen transport disruption',
      'Associated with increased risk of type 2 diabetes in processed meat consumers'
    ],
    conditions_affected: ['cancer_history', 'digestive_issues', 'hypertension', 'diabetes', 'pregnancy', 'infants'],
    daily_limit: '0.07 mg per kg of body weight (JECFA/EFSA)',
    category: 'preservative',
    aliases: ['sodium nitrite', 'nitrite', 'NaNO2', 'E250', 'insodium nitrite'],
    banned_in: ['Norway (in certain products)'],
    acceptable_in: ['EU', 'USA', 'Canada'],
    long_term_effects: [
      'Chronic exposure may increase colorectal cancer risk by 18-21% (WHO/IARC data)',
      'Potential DNA damage in colon cells',
      'May contribute to chronic inflammation in digestive tract'
    ]
  },
  'e251': {
    code: 'E251',
    name: 'Sodium Nitrate',
    description: 'Naturally occurring salt used as preservative in cured meats and cheeses.',
    risk_level: 'high',
    health_concerns: [
      'Converts to nitrites in the body, sharing similar cancer risks',
      'Linked to gastric cancer in high-consumption populations',
      'May interfere with thyroid function by competing with iodine uptake'
    ],
    conditions_affected: ['cancer_history', 'thyroid_issues', 'digestive_issues', 'pregnancy'],
    daily_limit: '3.7 mg per kg of body weight (JECFA)',
    category: 'preservative',
    aliases: ['sodium nitrate', 'Chile saltpeter', 'E251', 'NaNO3'],
    banned_in: [],
    acceptable_in: ['EU', 'USA', 'Canada'],
    long_term_effects: [
      'Accumulates in body over time, converting to nitrites',
      'May contribute to methemoglobinemia in vulnerable populations'
    ]
  },

  // HIGH RISK - Artificial Sweeteners
  'e951': {
    code: 'E951',
    name: 'Aspartame',
    description: 'Artificial sweetener ~200x sweeter than sugar, used in diet products.',
    risk_level: 'high',
    health_concerns: [
      'IARC classified as "possibly carcinogenic to humans" (Group 2B) in July 2023',
      'Contains phenylalanine - DANGEROUS for people with Phenylketonuria (PKU)',
      'May trigger migraines and neurological symptoms in sensitive individuals',
      'Some studies suggest potential effects on gut microbiome composition',
      'Breaks down into methanol, aspartic acid, and phenylalanine when heated'
    ],
    conditions_affected: ['phenylketonuria', 'migraine', 'anxiety', 'depression', 'diabetes', 'pregnancy', 'neurological_disorders'],
    daily_limit: '40 mg per kg of body weight (FDA/EFSA)',
    category: 'sweetener',
    aliases: ['aspartame', 'NutraSweet', 'Equal', 'Canderel', 'E951', 'APM'],
    banned_in: [],
    acceptable_in: ['EU', 'USA', 'Canada', 'Most countries'],
    long_term_effects: [
      'Chronic consumption may alter gut bacteria balance',
      'Potential link to increased risk of stroke and cardiovascular disease (some observational studies)',
      'May increase sweet cravings, counteracting weight management goals'
    ]
  },
  'e954': {
    code: 'E954',
    name: 'Saccharin',
    description: 'Artificial sweetener ~300-500x sweeter than sugar, one of the oldest.',
    risk_level: 'medium',
    health_concerns: [
      'Early studies linked to bladder cancer in rats (mechanism not applicable to humans)',
      'May alter gut microbiome, potentially affecting glucose tolerance',
      'Some users report bitter aftertaste and digestive discomfort'
    ],
    conditions_affected: ['diabetes', 'digestive_issues', 'bladder_issues'],
    daily_limit: '5 mg per kg of body weight (FDA)',
    category: 'sweetener',
    aliases: ['saccharin', "Sweet'N Low", 'E954'],
    banned_in: ['Canada (in certain products)', 'Some EU restrictions'],
    acceptable_in: ['USA', 'Most countries'],
    long_term_effects: [
      'Long-term human data generally reassuring but limited',
      'May affect insulin response in some individuals despite zero calories'
    ]
  },

  // MEDIUM RISK - Preservatives
  'e211': {
    code: 'E211',
    name: 'Sodium Benzoate',
    description: 'Widely used preservative in acidic foods and beverages.',
    risk_level: 'medium',
    health_concerns: [
      'When combined with vitamin C (ascorbic acid), can form benzene - a known carcinogen',
      'May increase hyperactivity in children ( Southampton University study)',
      'Can trigger asthma attacks in sensitive individuals',
      'May deplete glycine levels, affecting detoxification processes'
    ],
    conditions_affected: ['adhd', 'asthma', 'allergies', 'liver_issues', 'pregnancy'],
    daily_limit: '5 mg per kg of body weight (JECFA)',
    category: 'preservative',
    aliases: ['sodium benzoate', 'benzoate of soda', 'E211'],
    banned_in: [],
    acceptable_in: ['EU', 'USA', 'Canada'],
    long_term_effects: [
      'Chronic exposure may affect mitochondrial function',
      'Potential DNA damage at high concentrations in combination with vitamin C'
    ]
  },
  'e220': {
    code: 'E220',
    name: 'Sulfur Dioxide',
    description: 'Preservative and antioxidant used in dried fruits, wine, and processed foods.',
    risk_level: 'medium',
    health_concerns: [
      'Common trigger for asthma attacks and allergic reactions',
      'Can cause headaches, skin rashes, and digestive upset in sensitive individuals',
      'Destroys thiamine (vitamin B1) in foods',
      'May cause breathing difficulties in people with sulfite sensitivity'
    ],
    conditions_affected: ['asthma', 'allergies', 'sulfite_sensitivity', 'headaches', 'vitamin_deficiency'],
    daily_limit: '0.7 mg per kg of body weight (JECFA)',
    category: 'preservative',
    aliases: ['sulfur dioxide', 'sulfite', 'SO2', 'E220'],
    banned_in: ['USA (on fresh produce)', 'EU (on certain fresh foods)'],
    acceptable_in: ['Most countries (processed foods)'],
    long_term_effects: [
      'Chronic exposure may deplete vitamin B1 stores',
      'Potential respiratory sensitivity development with repeated exposure'
    ]
  },

  // MEDIUM RISK - Colors
  'e102': {
    code: 'E102',
    name: 'Tartrazine (Yellow 5)',
    description: 'Bright yellow synthetic food coloring used in candies, drinks, and snacks.',
    risk_level: 'medium',
    health_concerns: [
      'Linked to hyperactivity and behavioral issues in children (Southampton Study)',
      'Can trigger allergic reactions including hives and asthma',
      'May cause cross-reactivity in people with aspirin allergy',
      'Some studies suggest potential genotoxic effects at high doses'
    ],
    conditions_affected: ['adhd', 'allergies', 'asthma', 'aspirin_allergy', 'children'],
    daily_limit: '7.5 mg per kg of body weight (JECFA)',
    category: 'color',
    aliases: ['tartrazine', 'Yellow 5', 'FD&C Yellow No. 5', 'E102', 'CI 19140'],
    banned_in: ['Norway', 'Austria', 'Some EU restrictions on products for children'],
    acceptable_in: ['USA', 'Canada', 'Most countries'],
    long_term_effects: [
      'May contribute to attention deficit issues with chronic childhood exposure',
      'Potential accumulation in tissues over long periods'
    ]
  },
  'e129': {
    code: 'E129',
    name: 'Allura Red AC (Red 40)',
    description: 'Most widely used red food coloring in the world.',
    risk_level: 'medium',
    health_concerns: [
      'Associated with hyperactivity in children (FDA acknowledges this link)',
      'May trigger allergic reactions in sensitive individuals',
      'Contains benzidine and 4-aminobiphenyl - potential carcinogenic contaminants',
      'Some animal studies suggest potential immune system effects'
    ],
    conditions_affected: ['adhd', 'allergies', 'autoimmune', 'children'],
    daily_limit: '7 mg per kg of body weight (JECFA)',
    category: 'color',
    aliases: ['allura red', 'Red 40', 'FD&C Red No. 40', 'E129'],
    banned_in: ['EU (since 2024 - requires warning label)', 'Switzerland', 'Denmark'],
    acceptable_in: ['USA', 'Canada', 'Most non-EU countries'],
    long_term_effects: [
      'Chronic exposure during childhood may affect neurodevelopment',
      'Potential immune system modulation with long-term consumption'
    ]
  },

  // MEDIUM RISK - Flavor Enhancers
  'e621': {
    code: 'E621',
    name: 'Monosodium Glutamate (MSG)',
    description: 'Flavor enhancer that adds umami taste to savory foods.',
    risk_level: 'medium',
    health_concerns: [
      'May cause "Chinese Restaurant Syndrome" - headache, flushing, sweating in sensitive individuals',
      'Can trigger asthma attacks in people with asthma (some studies)',
      'High doses may affect hypothalamic appetite regulation',
      'Some evidence of metabolic effects and potential weight gain association'
    ],
    conditions_affected: ['migraine', 'asthma', 'obesity', 'ibs', 'headaches'],
    daily_limit: 'Not specified - ADI "not specified" by JECFA (generally recognized as safe in normal amounts)',
    category: 'flavor_enhancer',
    aliases: ['monosodium glutamate', 'MSG', 'E621', 'glutamate', 'yeast extract', 'hydrolyzed protein'],
    banned_in: [],
    acceptable_in: ['Global'],
    long_term_effects: [
      'Chronic high intake may affect leptin sensitivity and appetite control',
      'Potential excitotoxicity concerns in extreme doses (theoretical)'
    ]
  },

  // LOW RISK - Common additives
  'e300': {
    code: 'E300',
    name: 'Ascorbic Acid (Vitamin C)',
    description: 'Natural antioxidant and essential vitamin, also used as preservative.',
    risk_level: 'low',
    health_concerns: [
      'Generally recognized as safe',
      'High doses may cause digestive upset in some people',
      'Can react with sodium benzoate to form benzene (rare, depends on conditions)'
    ],
    conditions_affected: ['kidney_stones_history'],
    daily_limit: 'Not applicable - essential nutrient',
    category: 'antioxidant',
    aliases: ['ascorbic acid', 'vitamin C', 'E300', 'L-ascorbic acid'],
    banned_in: [],
    acceptable_in: ['Global'],
    long_term_effects: ['Beneficial antioxidant effects', 'Supports immune function']
  },
  'e322': {
    code: 'E322',
    name: 'Lecithin',
    description: 'Natural emulsifier from soy or sunflower, used in chocolate and baked goods.',
    risk_level: 'low',
    health_concerns: [
      'Generally recognized as safe',
      'Soy-derived lecithin may contain trace allergens (highly refined, usually safe)',
      'Excellent source of choline - supports brain health'
    ],
    conditions_affected: ['soy_allergy'],
    daily_limit: 'Not specified',
    category: 'emulsifier',
    aliases: ['lecithin', 'soy lecithin', 'sunflower lecithin', 'E322'],
    banned_in: [],
    acceptable_in: ['Global'],
    long_term_effects: ['Supports cell membrane health', 'May improve cholesterol profile']
  },
  'e330': {
    code: 'E330',
    name: 'Citric Acid',
    description: 'Natural acid from citrus fruits, used as preservative and flavoring.',
    risk_level: 'low',
    health_concerns: [
      'Generally recognized as safe',
      'May erode tooth enamel in very high concentrations or frequent exposure',
      'Can trigger heartburn in people with GERD'
    ],
    conditions_affected: ['gerd', 'dental_erosion'],
    daily_limit: 'Not specified',
    category: 'other',
    aliases: ['citric acid', 'E330'],
    banned_in: [],
    acceptable_in: ['Global'],
    long_term_effects: ['Natural part of metabolism', 'May support kidney stone prevention']
  },
  'e415': {
    code: 'E415',
    name: 'Xanthan Gum',
    description: 'Fermented sugar polymer used as thickener and stabilizer.',
    risk_level: 'low',
    health_concerns: [
      'Generally recognized as safe',
      'May cause digestive bloating in large amounts',
      'Good prebiotic fiber source'
    ],
    conditions_affected: ['ibs', 'digestive_sensitivity'],
    daily_limit: 'Not specified',
    category: 'stabilizer',
    aliases: ['xanthan gum', 'E415'],
    banned_in: [],
    acceptable_in: ['Global'],
    long_term_effects: ['May support gut microbiome as soluble fiber']
  },

  // Additional critical additives
  'e407': {
    code: 'E407',
    name: 'Carrageenan',
    description: 'Seaweed-derived thickener used in dairy alternatives and processed foods.',
    risk_level: 'medium',
    health_concerns: [
      'Degraded carrageenan (poligeenan) is inflammatory and potentially carcinogenic',
      'May cause digestive inflammation and IBS symptoms in sensitive individuals',
      'Some animal studies link to glucose intolerance and insulin resistance',
      'May promote inflammation in the gut lining'
    ],
    conditions_affected: ['ibs', 'digestive_issues', 'diabetes', 'inflammatory_conditions', 'autoimmune'],
    daily_limit: 'Not specified - controversial',
    category: 'stabilizer',
    aliases: ['carrageenan', 'Irish moss', 'E407', 'processed eucheuma seaweed'],
    banned_in: ['EU (infant formula)', 'Some restrictions on use'],
    acceptable_in: ['USA', 'Canada', 'Most countries'],
    long_term_effects: [
      'Chronic consumption may contribute to low-grade intestinal inflammation',
      'Potential disruption of gut barrier function'
    ]
  },
  'e282': {
    code: 'E282',
    name: 'Calcium Propionate',
    description: 'Preservative used in bread and baked goods to prevent mold.',
    risk_level: 'medium',
    health_concerns: [
      'May cause behavioral changes and irritability in some children',
      'Can trigger headaches and migraines in sensitive individuals',
      'May disrupt gut microbiome balance',
      'Some studies suggest potential link to antibiotic resistance development'
    ],
    conditions_affected: ['adhd', 'migraine', 'digestive_issues', 'children'],
    daily_limit: 'Not specified',
    category: 'preservative',
    aliases: ['calcium propionate', 'E282', 'propionic acid calcium salt'],
    banned_in: [],
    acceptable_in: ['EU', 'USA', 'Canada'],
    long_term_effects: [
      'May alter gut bacteria composition with chronic consumption',
      'Potential behavioral effects in children with repeated exposure'
    ]
  },
  'e320': {
    code: 'E320',
    name: 'Butylated Hydroxyanisole (BHA)',
    description: 'Synthetic antioxidant used to prevent rancidity in fats and oils.',
    risk_level: 'high',
    health_concerns: [
      'IARC classified as "possibly carcinogenic to humans" (Group 2B)',
      'May disrupt endocrine function and hormone balance',
      'Linked to liver and kidney damage in high-dose animal studies',
      'Can accumulate in body fat over time'
    ],
    conditions_affected: ['cancer_history', 'hormone_disorders', 'liver_issues', 'kidney_issues', 'pregnancy'],
    daily_limit: '0.5 mg per kg of body weight (JECFA)',
    category: 'antioxidant',
    aliases: ['BHA', 'butylated hydroxyanisole', 'E320'],
    banned_in: ['EU (in cosmetics, restricted in food)', 'Japan', 'UK restrictions'],
    acceptable_in: ['USA', 'Canada'],
    long_term_effects: [
      'Bioaccumulates in adipose tissue',
      'Potential endocrine disruption with chronic exposure',
      'May interfere with thyroid hormone function'
    ]
  },
  'e321': {
    code: 'E321',
    name: 'Butylated Hydroxytoluene (BHT)',
    description: 'Synthetic antioxidant similar to BHA, used in cereals and snacks.',
    risk_level: 'high',
    health_concerns: [
      'Classified as "possibly carcinogenic" by some agencies',
      'May cause liver enlargement and enzyme changes',
      'Potential endocrine disruptor affecting thyroid and reproductive hormones',
      'Can cause allergic reactions including skin rashes'
    ],
    conditions_affected: ['cancer_history', 'hormone_disorders', 'liver_issues', 'allergies', 'pregnancy'],
    daily_limit: '0.3 mg per kg of body weight (JECFA)',
    category: 'antioxidant',
    aliases: ['BHT', 'butylated hydroxytoluene', 'E321'],
    banned_in: ['EU (restricted)', 'Japan', 'Romania', 'Sweden'],
    acceptable_in: ['USA', 'Canada'],
    long_term_effects: [
      'Accumulates in body fat',
      'Potential tumor promotion in combination with other chemicals',
      'May affect lung function with chronic inhalation exposure'
    ]
  },
  'e955': {
    code: 'E955',
    name: 'Sucralose',
    description: 'Artificial sweetener ~600x sweeter than sugar, made from sugar but chemically modified.',
    risk_level: 'medium',
    health_concerns: [
      'May alter gut microbiome, reducing beneficial bacteria by up to 50% (some studies)',
      'When heated, may break down into potentially toxic compounds',
      'May increase appetite and sugar cravings paradoxically',
      'Some studies suggest potential effects on glucose metabolism'
    ],
    conditions_affected: ['diabetes', 'digestive_issues', 'obesity', 'metabolic_syndrome'],
    daily_limit: '15 mg per kg of body weight (FDA/EFSA)',
    category: 'sweetener',
    aliases: ['sucralose', 'Splenda', 'E955'],
    banned_in: [],
    acceptable_in: ['Global'],
    long_term_effects: [
      'Chronic use may alter gut bacteria permanently',
      'Potential impact on glucose tolerance with long-term use',
      'May increase sweet preference over time'
    ]
  },
  'e950': {
    code: 'E950',
    name: 'Acesulfame K',
    description: 'Artificial sweetener ~200x sweeter than sugar, often blended with other sweeteners.',
    risk_level: 'medium',
    health_concerns: [
      'Some studies suggest potential carcinogenic effects in animal testing (controversial)',
      'May affect gut microbiome and glucose tolerance',
      'Contains methylene chloride - a known carcinogen used in manufacturing (trace amounts)',
      'May increase risk of metabolic syndrome with chronic use'
    ],
    conditions_affected: ['diabetes', 'metabolic_syndrome', 'cancer_history', 'pregnancy'],
    daily_limit: '15 mg per kg of body weight (EFSA)',
    category: 'sweetener',
    aliases: ['acesulfame K', 'acesulfame potassium', 'Sunett', 'Sweet One', 'E950'],
    banned_in: [],
    acceptable_in: ['Global'],
    long_term_effects: [
      'Potential accumulation in body tissues',
      'May contribute to insulin resistance with chronic use',
      'Effects on developing fetus not fully understood'
    ]
  },
  'e904': {
    code: 'E904',
    name: 'Shellac',
    description: 'Resin secreted by lac bugs, used as glazing agent on candies and pills.',
    risk_level: 'low',
    health_concerns: [
      'Generally recognized as safe',
      'Not vegan/vegetarian (insect-derived)',
      'May contain trace amounts of pesticides from harvesting',
      'Can cause allergic reactions in rare cases'
    ],
    conditions_affected: ['vegan', 'vegetarian', 'allergies'],
    daily_limit: 'Not specified',
    category: 'other',
    aliases: ['shellac', 'lac resin', 'E904', "confectioner's glaze"],
    banned_in: [],
    acceptable_in: ['Global'],
    long_term_effects: []
  },
  'e903': {
    code: 'E903',
    name: 'Carnauba Wax',
    description: 'Natural wax from Brazilian palm trees, used as glazing agent.',
    risk_level: 'low',
    health_concerns: [
      'Generally recognized as safe',
      'Completely plant-based and vegan-friendly',
      'No known health concerns at food-grade levels'
    ],
    conditions_affected: [],
    daily_limit: 'Not specified',
    category: 'other',
    aliases: ['carnauba wax', 'E903', 'Brazil wax'],
    banned_in: [],
    acceptable_in: ['Global'],
    long_term_effects: []
  }
}

export function getAdditiveInfo(additiveTag: string): AdditiveInfo | null {
  // Handle various formats: "en:e250", "e250", "additive-e250", etc.
  const normalized = additiveTag
    .toLowerCase()
    .replace(/^en:/, '')
    .replace(/^additive-/, '')
    .replace(/\s/g, '')

  // Direct lookup
  if (ADDITIVE_DATABASE[normalized]) {
    return ADDITIVE_DATABASE[normalized]
  }

  // Try with "e" prefix if not present
  if (!normalized.startsWith('e') && ADDITIVE_DATABASE[`e${normalized}`]) {
    return ADDITIVE_DATABASE[`e${normalized}`]
  }

  // Try aliases
  for (const [code, info] of Object.entries(ADDITIVE_DATABASE)) {
    if (info.aliases.some(alias => 
      alias.toLowerCase().replace(/\s/g, '') === normalized ||
      alias.toLowerCase().replace(/\s/g, '') === `e${normalized}`
    )) {
      return info
    }
  }

  return null
}

export function getAllAdditives(): AdditiveInfo[] {
  return Object.values(ADDITIVE_DATABASE)
}

export function getAdditivesByRiskLevel(level: 'low' | 'medium' | 'high'): AdditiveInfo[] {
  return Object.values(ADDITIVE_DATABASE).filter(a => a.risk_level === level)
}

export function getAdditivesByCondition(condition: string): AdditiveInfo[] {
  return Object.values(ADDITIVE_DATABASE).filter(a => 
    a.conditions_affected.includes(condition.toLowerCase().replace(/\s/g, '_'))
  )
}
