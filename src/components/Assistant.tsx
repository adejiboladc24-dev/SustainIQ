import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Leaf, Zap, Droplets, Recycle, ChevronRight, ShieldAlert } from 'lucide-react';
import { useSustainIQ } from '../context/SustainIQContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isOffTopic?: boolean;
}

// ─── SYSTEM IDENTITY ────────────────────────────────────────────────────────
const CREATOR = 'Engr. Adeleke Ajibola Joshua';
const PLATFORM = 'SustainIQ environmental intelligence platform';

// ─── INTENT CLASSIFIERS ─────────────────────────────────────────────────────

/** Returns true if the query is asking about the creator / origin of the AI */
const isCreatorQuery = (q: string): boolean => {
  const patterns = [
    'who created you', 'who built you', 'who made you', 'who developed you',
    'who designed you', 'who programmed you', 'who wrote you', 'who engineered you',
    'who is your creator', 'who is your developer', 'who is your author',
    'who built this', 'who made this', 'who created this', 'who built this app',
    'who made this app', 'who created this app', 'who developed this app',
    'who built sustainiq', 'who made sustainiq', 'who created sustainiq',
    'your origin', 'your creator', 'your developer', 'your author',
    'tell me about yourself', 'who are you', 'what are you',
  ];
  return patterns.some((p) => q.includes(p));
};

/**
 * Returns true if the query is clearly within the environmental / sustainability domain.
 * Returns false for off-topic queries (programming, math, cooking, entertainment, etc.)
 */
const isOnTopic = (q: string): boolean => {
  const onTopicKeywords = [
    // core domain
    'carbon', 'co2', 'emission', 'greenhouse', 'climate', 'global warming', 'temperature',
    'atmosphere', 'ozone', 'pollution', 'air quality', 'aqi',
    // water
    'water', 'hydro', 'drought', 'rainfall', 'ocean', 'river', 'lake', 'aquifer', 'irrigation',
    // energy
    'energy', 'solar', 'wind power', 'renewable', 'fossil fuel', 'electricity', 'grid',
    'battery', 'nuclear', 'geothermal', 'hydropower', 'efficiency',
    // waste
    'waste', 'recycle', 'compost', 'landfill', 'plastic', 'biodegradable', 'circular economy',
    'upcycle', 'zero waste', 'packaging',
    // ecology / geography
    'ecosystem', 'biodiversity', 'habitat', 'deforestation', 'reforestation', 'forest',
    'wetland', 'coral reef', 'species', 'wildlife', 'biome', 'geography', 'topography',
    'soil', 'erosion', 'desertification', 'permafrost', 'glacier', 'ice cap',
    // food / diet
    'diet', 'food', 'plant-based', 'vegan', 'vegetarian', 'meat', 'agriculture', 'farming',
    'organic', 'local produce', 'food waste', 'sustainable eating',
    // transport
    'transport', 'transit', 'electric vehicle', 'ev', 'cycling', 'walking', 'carpool',
    'aviation', 'shipping', 'freight',
    // sustainability / policy
    'sustainability', 'sustainable', 'green', 'eco', 'environment', 'nature', 'planet',
    'paris agreement', 'cop', 'ipcc', 'net zero', 'carbon offset', 'carbon credit',
    'footprint', 'impact', 'conservation', 'preservation',
    // app-specific
    'habit', 'xp', 'tier', 'badge', 'challenge', 'dashboard', 'metric', 'analytics',
    'sustainiq', 'log', 'streak',
  ];
  return onTopicKeywords.some((kw) => q.includes(kw));
};

/** Off-topic signals — explicit non-environmental domains */
const isExplicitlyOffTopic = (q: string): boolean => {
  const offTopicPatterns = [
    // programming / tech
    'javascript', 'python', 'react', 'html', 'css', 'code', 'programming', 'algorithm',
    'database', 'sql', 'api', 'debug', 'function', 'variable', 'loop', 'array',
    // math
    'calculate', 'equation', 'algebra', 'calculus', 'geometry', 'statistics', 'probability',
    'integral', 'derivative', 'matrix',
    // entertainment / pop culture
    'movie', 'film', 'music', 'song', 'artist', 'celebrity', 'actor', 'actress',
    'netflix', 'spotify', 'game', 'gaming', 'sport', 'football', 'basketball',
    'cricket', 'tennis', 'nba', 'fifa', 'esport',
    // cooking (non-sustainability angle)
    'recipe', 'bake', 'baking', 'cook', 'cooking', 'chef', 'restaurant', 'cuisine',
    'dessert', 'cake', 'pizza', 'pasta',
    // finance / business (non-eco)
    'stock', 'crypto', 'bitcoin', 'investment', 'trading', 'forex', 'nft',
    // general knowledge off-domain
    'history', 'war', 'politics', 'election', 'president', 'prime minister',
    'religion', 'philosophy', 'psychology', 'medical', 'doctor', 'medicine',
    'legal', 'law', 'court', 'joke', 'riddle', 'poem', 'story',
  ];
  return offTopicPatterns.some((p) => q.includes(p));
};


// ─── RESPONSE ENGINE ────────────────────────────────────────────────────────

interface ResponseResult {
  content: string;
  isOffTopic: boolean;
}

const KNOWLEDGE_BASE: { keywords: string[]; response: string }[] = [
  {
    keywords: ['carbon', 'co2', 'emission', 'footprint', 'greenhouse', 'climate', 'global warming'],
    response: `**Carbon Footprint & Climate Science**

Your carbon footprint is the total CO₂-equivalent emissions caused by your activities. The global average is ~4 tonnes per person per year — sustainable targets require cutting this to under 2 tonnes.

**Transport (highest individual impact)**
• Public transit over private car — saves ~2.5 kg CO₂ per trip
• Cycling or walking for journeys under 5 km — zero emissions
• Carpooling halves per-capita road emissions
• Aviation is the most carbon-intensive mode: one transatlantic flight ≈ 1.5 tonnes CO₂

**Home Energy**
• LED bulbs use 75% less energy than incandescent equivalents
• Unplugging idle electronics eliminates phantom load (~10% of home energy)
• Lowering thermostat by 2°C saves ~10% on heating bills annually

**Diet**
• One plant-based meal per day saves ~1.5 kg CO₂
• Beef produces 27 kg CO₂ per kg of food — the highest of any protein source
• Buying local and seasonal produce cuts embedded transport emissions

**Systemic Actions**
• Support carbon pricing and net-zero policy advocacy
• Invest in or switch to renewable energy tariffs
• Offset unavoidable emissions through verified carbon credit schemes (Gold Standard, VCS)`,
  },
  {
    keywords: ['water', 'hydro', 'drought', 'rainfall', 'ocean', 'river', 'aquifer', 'conservation', 'shower'],
    response: `**Hydrology & Water Conservation**

Only 2.5% of Earth's water is freshwater, and less than 1% is accessible for human use. Aquifer depletion and climate-driven drought are accelerating water scarcity globally.

**Daily Conservation Habits**
• Reduce shower time by 5 minutes — saves 50 L per shower
• Fix leaking taps immediately — a dripping tap wastes 15 L per day
• Turn off the tap while brushing teeth — saves 6 L per minute
• Run appliances only at full capacity

**Outdoor & Agricultural**
• Drip irrigation uses 30–50% less water than sprinkler systems
• Rainwater harvesting can offset 30–50% of garden water demand
• Drought-resistant native plants reduce irrigation needs by up to 70%

**Virtual Water Awareness**
• 1 kg of beef requires ~15,000 L of water to produce
• A plant-based diet uses approximately 50% less water than a meat-heavy diet
• Cotton clothing: one T-shirt requires ~2,700 L of water

**Ecosystem Importance**
• Wetlands act as natural water filters and flood buffers
• Deforestation disrupts regional rainfall patterns through reduced evapotranspiration
• Healthy riparian zones protect river water quality`,
  },
  {
    keywords: ['waste', 'recycle', 'compost', 'landfill', 'plastic', 'zero waste', 'circular', 'upcycle'],
    response: `**Waste Management & Circular Economy**

The linear economy (take → make → dispose) generates 2.1 billion tonnes of municipal solid waste annually. The circular economy closes this loop.

**The 5 R's Framework**
• **Refuse** — Decline single-use plastics, unnecessary packaging, and junk mail
• **Reduce** — Buy only what you need; choose products with minimal packaging
• **Reuse** — Carry reusable bags, bottles, and containers; repair before replacing
• **Recycle** — Learn local recycling rules; contamination ruins entire batches
• **Rot (Compost)** — Compost food scraps; diverts ~30% of household waste from landfill

**Plastic Pollution Facts**
• 8 million tonnes of plastic enter the ocean annually
• Microplastics have been detected in human blood, lungs, and placentas
• Only 9% of all plastic ever produced has been recycled

**Composting Impact**
• Home composting diverts ~150 kg of organic waste per household per year
• Compost improves soil carbon sequestration and reduces need for synthetic fertilisers
• Bokashi systems handle meat and dairy that standard composting cannot

**E-Waste**
• 53.6 million tonnes of e-waste generated globally per year
• Only 17.4% is formally recycled — the rest leaches heavy metals into soil and water`,
  },
  {
    keywords: ['energy', 'solar', 'wind', 'renewable', 'fossil fuel', 'electricity', 'efficiency', 'nuclear', 'geothermal'],
    response: `**Renewable Energy & Efficiency**

Energy production accounts for ~73% of global greenhouse gas emissions. The transition to renewables is the single most impactful systemic lever available.

**Renewable Technologies**
• **Solar PV** — Costs have fallen 89% since 2010; rooftop systems pay back in 7–10 years
• **Wind Power** — Onshore wind is now the cheapest electricity source in most markets
• **Hydropower** — Provides ~16% of global electricity; sensitive to drought impacts
• **Geothermal** — Highly reliable baseload power; limited to tectonically active regions
• **Green Hydrogen** — Emerging storage and industrial fuel; produced via electrolysis

**Home Efficiency Actions**
• Cold water laundry — 90% of washing machine energy goes to heating water
• Air-drying clothes saves ~150 kg CO₂ per household per year
• Smart thermostats reduce heating/cooling energy by 10–15%
• Heat pumps deliver 300% efficiency vs. gas boilers at 90%

**Grid & Policy**
• Battery storage is solving intermittency challenges at scale
• Net metering allows households to sell surplus solar back to the grid
• The IEA projects renewables will supply 90% of new electricity capacity through 2030`,
  },
  {
    keywords: ['ecosystem', 'biodiversity', 'habitat', 'deforestation', 'forest', 'wetland', 'coral', 'species', 'biome', 'geography', 'soil', 'erosion'],
    response: `**Environmental Geography & Ecosystems**

Earth's biosphere is organised into interconnected biomes — each a distinct ecological community shaped by climate, geography, and evolutionary history.

**Major Biomes & Threats**
• **Tropical Rainforests** — Cover 6% of Earth's surface but house 50% of species; deforestation rate: ~10 million ha/year
• **Coral Reefs** — Support 25% of marine species on 0.1% of ocean floor; 50% have been lost since 1950
• **Wetlands** — Filter water, store carbon, buffer floods; 35% lost since 1970
• **Arctic Tundra** — Permafrost stores twice the carbon currently in the atmosphere; thawing releases methane

**Biodiversity Crisis**
• Current extinction rate is 100–1,000× the natural background rate
• 1 million species face extinction within decades (IPBES 2019)
• Habitat loss, climate change, pollution, invasive species, and overexploitation are the five drivers

**Soil Health**
• Healthy soil sequesters ~2.5 billion tonnes of CO₂ annually
• Regenerative agriculture rebuilds soil organic matter and reduces erosion
• Desertification affects 33% of Earth's land surface

**Ecosystem Services**
• Pollination services are worth ~$577 billion annually to global food production
• Mangroves provide coastal protection worth $65 billion per year in storm damage prevention`,
  },
  {
    keywords: ['diet', 'food', 'plant', 'vegan', 'vegetarian', 'meat', 'agriculture', 'farming', 'organic', 'food waste'],
    response: `**Sustainable Food Systems & Diet**

Food systems account for ~26% of global greenhouse gas emissions, 70% of freshwater use, and 50% of habitable land.

**Dietary Impact by Food Type (kg CO₂ per kg food)**
• Beef: 60 kg | Lamb: 24 kg | Pork: 7 kg | Chicken: 6 kg
• Tofu: 3 kg | Legumes: 0.9 kg | Vegetables: 0.4 kg | Fruit: 0.4 kg

**Highest-Impact Dietary Shifts**
• Eliminating beef reduces your food-related emissions by up to 50%
• One plant-based day per week saves ~1.5 kg CO₂ and ~500 L water
• Oat milk produces 80% fewer emissions than dairy milk

**Food Waste**
• 1/3 of all food produced globally is wasted — equivalent to 3.3 billion tonnes CO₂
• Household food waste accounts for 61% of total food waste in developed nations
• Meal planning and FIFO (first in, first out) storage are the most effective reduction strategies

**Regenerative Agriculture**
• Cover cropping, no-till farming, and agroforestry rebuild soil carbon
• Regenerative practices can sequester up to 1.85 billion tonnes CO₂ per year globally
• Supports biodiversity by reducing pesticide use and maintaining habitat corridors`,
  },
  {
    keywords: ['air quality', 'aqi', 'pollution', 'smog', 'particulate', 'pm2', 'no2', 'ozone'],
    response: `**Air Quality & Atmospheric Pollution**

Air pollution causes ~7 million premature deaths annually — more than malaria and HIV/AIDS combined.

**Key Pollutants**
• **PM2.5** (fine particulate matter) — Penetrates deep into lungs and bloodstream; primary source: combustion
• **NO₂** (nitrogen dioxide) — Produced by vehicles and industry; causes respiratory inflammation
• **O₃** (ground-level ozone) — Formed by sunlight reacting with NOₓ and VOCs; damages lung tissue
• **SO₂** (sulphur dioxide) — Coal combustion byproduct; causes acid rain

**AQI Scale (WHO Guidelines)**
• 1 — Good (0–50): Air quality is satisfactory
• 2 — Fair (51–100): Acceptable; some pollutants may affect sensitive groups
• 3 — Moderate (101–150): Sensitive groups should reduce outdoor exertion
• 4 — Poor (151–200): Everyone may experience health effects
• 5 — Very Poor (201+): Health warnings; avoid outdoor activity

**Protective Actions**
• Monitor local AQI before outdoor exercise (SustainIQ shows your city's live AQI)
• Use HEPA air purifiers indoors during high-pollution events
• Advocate for low-emission zones and clean transport infrastructure in your city`,
  },
  {
    keywords: ['habit', 'xp', 'tier', 'badge', 'challenge', 'streak', 'sustainiq', 'dashboard', 'metric', 'log'],
    response: `**SustainIQ Platform Guide**

SustainIQ is an environmental intelligence platform engineered by **${CREATOR}** to help you quantify, track, and optimise your ecological impact.

**Tier Progression System**
• **Observer** (0–149 XP) — Beginning your sustainability journey
• **Catalyst** (150–449 XP) — Driving meaningful eco-change
• **Strategist** (450–899 XP) — Architecting systemic impact
• **Guardian** (900+ XP) — Steward of planetary resilience

**Earning XP**
• Each habit logged = +15 XP base
• Challenge activation = +25 XP × multiplier
• Challenge completion = base XP × multiplier (up to 3×)
• Maintaining daily streaks unlocks badge bonuses

**Habit Categories**
• 🚌 Transport — Public transit, cycling, carpooling
• ⚡ Energy — LED lighting, cold laundry, unplugging devices
• ♻️ Waste — Recycling, composting, refusing single-use plastic
• 🥗 Diet — Plant-based meals, local produce, zero food waste

**Badges** unlock automatically at impact milestones: First Step, Carbon Cutter, Water Warden, Zero Waste Hero, Guardian Rising, and more.

Navigate to the **Dashboard** to log habits, **Challenges** for XP multiplier sprints, and **Analytics** to visualise your weekly efficiency gains.`,
  },
];


/**
 * Core response router — applies all three personality constraints in priority order:
 * 1. Creator identity queries → explicit attribution response
 * 2. Off-topic queries → polite domain-lock redirect
 * 3. On-topic queries → knowledge base lookup or contextual guidance
 */
const getResponse = (
  query: string,
  profile: { name: string; ecoFocus: string } | null
): ResponseResult => {
  const q = query.toLowerCase().trim();

  // ── CONSTRAINT 1: Creator / identity attribution ──────────────────────────
  if (isCreatorQuery(q)) {
    return {
      isOffTopic: false,
      content: `**About SustainIQ AI**

I was created by **${CREATOR}** as a core component of the **${PLATFORM}**.

${CREATOR} engineered this assistant to serve as an expert guide in environmental geography, climate science, and sustainable development — helping users like you make data-driven decisions that reduce ecological impact.

**My capabilities include:**
• Climate data interpretation and carbon footprint analysis
• Hydrological systems and water conservation strategies
• Ecosystem geography and biodiversity science
• Renewable energy technology and efficiency optimisation
• Sustainable food systems and dietary impact assessment
• Real-time air quality and environmental telemetry guidance

Is there an environmental topic you'd like to explore?`,
    };
  }

  // ── CONSTRAINT 2: Off-topic domain lock ───────────────────────────────────
  if (isExplicitlyOffTopic(q) && !isOnTopic(q)) {
    return {
      isOffTopic: true,
      content: `I am programmed exclusively to assist you with **environmental geography and sustainable development**. Please ask me a question related to our planet's ecology or climate data!

Here are some topics I can help you with right now:

• 💨 **Carbon & Climate** — footprint reduction, emissions science, net-zero pathways
• 💧 **Hydrology** — water conservation, drought, freshwater ecosystems
• ☀️ **Renewable Energy** — solar, wind, efficiency, grid transition
• ♻️ **Circular Economy** — waste reduction, recycling, composting
• 🌿 **Ecosystems** — biodiversity, deforestation, biomes, soil health
• 🥗 **Sustainable Food** — dietary impact, food waste, regenerative agriculture
• 🌫️ **Air Quality** — AQI interpretation, pollution sources, health impacts`,
    };
  }

  // ── CONSTRAINT 3: On-topic knowledge base lookup ──────────────────────────
  for (const entry of KNOWLEDGE_BASE) {
    if (entry.keywords.some((kw) => q.includes(kw))) {
      return { isOffTopic: false, content: entry.response };
    }
  }

  // Contextual fallback — still on-topic, just no exact match
  const name = profile?.name;
  const focus = profile?.ecoFocus;
  return {
    isOffTopic: false,
    content: `**Environmental Guidance${name ? ` for ${name}` : ''}**

${focus ? `Based on your focus on **${focus}**, here are your highest-leverage actions:` : 'Here are your highest-leverage sustainability actions:'}

**Immediate Impact (start today)**
• Log a habit in the Dashboard — every action earns XP and updates your real impact metrics
• Activate a Challenge from the Challenge Portal for XP multipliers up to 3×
• Review your Analytics to identify which eco-discipline needs the most attention

**Deepen Your Knowledge**
Ask me about any of these environmental domains:

• 💨 Carbon footprint and climate science
• 💧 Water conservation and hydrology
• ☀️ Renewable energy and efficiency
• ♻️ Waste reduction and circular economy
• 🌿 Ecosystems, biodiversity, and environmental geography
• 🥗 Sustainable food systems and dietary impact
• 🌫️ Air quality and atmospheric pollution

What would you like to explore?`,
  };
};


// ─── MARKDOWN RENDERER ──────────────────────────────────────────────────────

const renderContent = (text: string) => {
  return text.split('\n').map((line, i) => {
    // Full-line bold heading (e.g. **Title**)
    if (line.startsWith('**') && line.endsWith('**') && !line.slice(2, -2).includes('**')) {
      return (
        <p key={i} className="font-bold text-slate-900 dark:text-white mt-3 mb-1 first:mt-0">
          {line.slice(2, -2)}
        </p>
      );
    }
    // Bullet point
    if (line.startsWith('• ')) {
      const html = line.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return (
        <div key={i} className="flex items-start gap-2 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
          <span className="text-emerald-500 mt-1 flex-shrink-0">•</span>
          <span dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      );
    }
    // Empty line spacer
    if (line.trim() === '') return <div key={i} className="h-1" />;
    // Regular paragraph with inline bold
    const html = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 dark:text-white font-semibold">$1</strong>');
    return (
      <p
        key={i}
        className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  });
};

// ─── QUICK PROMPTS ──────────────────────────────────────────────────────────

const QUICK_PROMPTS = [
  { label: 'Carbon tips',    icon: <Zap className="w-3.5 h-3.5" />,      query: 'How can I reduce my carbon footprint today?' },
  { label: 'Water saving',   icon: <Droplets className="w-3.5 h-3.5" />, query: 'Explain water conservation and hydrology' },
  { label: 'Zero waste',     icon: <Recycle className="w-3.5 h-3.5" />,  query: 'How do I start a zero waste lifestyle?' },
  { label: 'Eco diet',       icon: <Leaf className="w-3.5 h-3.5" />,     query: 'What foods have the lowest environmental impact?' },
];


// ─── COMPONENT ──────────────────────────────────────────────────────────────

export const Assistant: React.FC = () => {
  const { profile, portfolioMode } = useSustainIQ();

  // ── Onboarding welcome message (Constraint 2 — first message) ─────────────
  const welcomeMessage: Message = {
    id: 'welcome',
    role: 'assistant',
    timestamp: new Date(),
    content: `**Hello! Welcome to SustainIQ.**

I was engineered by **${CREATOR}** to serve as your expert guide in environmental intelligence and sustainability.

My knowledge spans climate science, carbon footprinting, hydrology, renewable energy, ecosystem geography, circular economy principles, and sustainable food systems.

**To begin optimising your green footprint:**
• Set your primary eco-goals in your **Profile** (via the Onboarding flow)
• Log your **daily habits** in the Dashboard to earn XP and climb the tier ladder
• Activate an **Eco-Challenge** for high-stakes XP multiplier sprints
• Ask me any questions regarding **environmental geography** or climate data!

${profile ? `I see your current focus is **${profile.ecoFocus}**, ${profile.name}. Let's make it count. 🌍` : 'What environmental topic would you like to explore first?'}`,
  };

  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const send = (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const delay = 500 + Math.random() * 700;
    setTimeout(() => {
      const result = getResponse(
        text,
        profile ? { name: profile.name, ecoFocus: profile.ecoFocus } : null
      );
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.content,
          timestamp: new Date(),
          isOffTopic: result.isOffTopic,
        },
      ]);
      setIsTyping(false);
    }, delay);
  };

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 8rem)' }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">AI Assistant</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Environmental intelligence · Engineered by {CREATOR}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {portfolioMode && (
            <div className="bg-amber-400/10 border border-amber-400/30 text-amber-500 dark:text-amber-400 text-xs px-3 py-1.5 rounded-full font-medium">
              Domain-locked NLP · Creator attribution
            </div>
          )}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-400/10 border border-emerald-200 dark:border-emerald-400/30 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-600 dark:text-emerald-400 text-xs font-medium">Online</span>
          </div>
        </div>
      </div>

      {/* Chat window */}
      <div className="flex-1 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl backdrop-blur-md flex flex-col overflow-hidden transition-colors duration-300">
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4" style={{ maxHeight: '420px' }}>
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'assistant'
                    ? 'bg-emerald-50 dark:bg-emerald-400/10 border border-emerald-200 dark:border-emerald-400/30'
                    : 'bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600'
                }`}
              >
                {msg.role === 'assistant'
                  ? <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  : <User className="w-4 h-4 text-slate-500 dark:text-slate-300" />}
              </div>

              {/* Bubble */}
              <div className="max-w-[80%] space-y-1">
                {/* Off-topic warning badge */}
                {msg.isOffTopic && (
                  <div className="flex items-center gap-1.5 text-[10px] text-amber-600 dark:text-amber-400 font-medium mb-1">
                    <ShieldAlert className="w-3 h-3" />
                    Domain restriction applied
                  </div>
                )}
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-emerald-50 dark:bg-emerald-400/10 border border-emerald-200 dark:border-emerald-400/20 rounded-tr-sm'
                      : msg.isOffTopic
                      ? 'bg-amber-50 dark:bg-amber-400/5 border border-amber-200 dark:border-amber-400/20 rounded-tl-sm'
                      : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-tl-sm'
                  }`}
                >
                  {msg.role === 'assistant'
                    ? <div className="space-y-0.5">{renderContent(msg.content)}</div>
                    : <p className="text-slate-900 dark:text-white text-sm">{msg.content}</p>}
                  <p className="text-slate-400 text-[10px] mt-2">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-400/10 border border-emerald-200 dark:border-emerald-400/30 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1 items-center h-4">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="border-t border-slate-100 dark:border-slate-800/60 p-4 flex-shrink-0">
          {/* Quick prompts */}
          <div className="flex gap-2 mb-3 flex-wrap">
            {QUICK_PROMPTS.map((qp) => (
              <button
                key={qp.label}
                onClick={() => send(qp.query)}
                disabled={isTyping}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 rounded-full text-xs transition-all disabled:opacity-40"
              >
                {qp.icon}
                {qp.label}
                <ChevronRight className="w-3 h-3" />
              </button>
            ))}
          </div>

          {/* Text input */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Ask about climate, ecosystems, water, energy, or sustainability..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send(input)}
                disabled={isTyping}
                className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/20 transition-all text-sm disabled:opacity-50"
              />
            </div>
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || isTyping}
              className="px-4 py-3 bg-emerald-500 dark:bg-emerald-400 text-white dark:text-slate-900 rounded-xl font-semibold hover:bg-emerald-400 dark:hover:bg-emerald-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
