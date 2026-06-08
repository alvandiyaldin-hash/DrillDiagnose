// DrillDiagnose Problem and Symptom Database

const SYMPTOMS_DATABASE = [
  {
    category: "Drilling Performance",
    symptoms: [
      { id: "high-torque", name: "High Torque" },
      { id: "low-torque", name: "Low Torque" },
      { id: "unstable-torque", name: "Unstable Torque" },
      { id: "high-drag", name: "High Drag" },
      { id: "overpull", name: "Overpull" },
      { id: "low-rop", name: "Low ROP" },
      { id: "sudden-rop-change", name: "Sudden ROP Change" }
    ]
  },
  {
    category: "Pressure & Flow",
    symptoms: [
      { id: "high-spp", name: "High Standpipe Pressure" },
      { id: "low-spp", name: "Low Standpipe Pressure" },
      { id: "reduced-returns", name: "Reduced Returns" },
      { id: "zero-returns", name: "Zero Returns" },
      { id: "mud-loss", name: "Mud Loss" },
      { id: "annular-pressure-drop", name: "Annular Pressure Drop" },
      { id: "flow-restriction", name: "Flow Restriction" }
    ]
  },
  {
    category: "Equipment & Vibration",
    symptoms: [
      { id: "high-vibration", name: "High Vibration" },
      { id: "cutter-debris", name: "Cutter Debris Detected" },
      { id: "tool-joint-leak", name: "Tool Joint Leak Indication" },
      { id: "bha-damage", name: "BHA Damage Indication" },
      { id: "pump-pressure-spike", name: "Pump Pressure Spike" },
      { id: "torque-fluctuation", name: "Torque Fluctuation" }
    ]
  },
  {
    category: "Sticking Events",
    symptoms: [
      { id: "pipe-stuck-static", name: "Pipe Stuck Static" },
      { id: "pipe-stuck-moving", name: "Pipe Stuck While Moving" },
      { id: "no-pipe-movement", name: "No Pipe Movement" }
    ]
  },
  {
    category: "Formation Indicators",
    symptoms: [
      { id: "cutting-bed", name: "Cutting Bed Present" },
      { id: "shaker-cuttings-change", name: "Shale Shaker Cuttings Change" },
      { id: "wellbore-instability", name: "Wellbore Instability Signs" }
    ]
  }
];

const PROBLEMS_DATABASE = [
  {
    id: "poor-hole-cleaning",
    name: "Poor Hole Cleaning",
    risk: "Medium",
    description: "Inadequate removal of drilled cuttings from the wellbore, leading to cuttings accumulation in the annulus.",
    symptoms: ["high-torque", "high-drag", "overpull", "cutting-bed"],
    causes: [
      "Low annular velocity",
      "Poor hole cleaning efficiency",
      "Inadequate mud properties (viscosity, yield point)"
    ],
    actions: [
      "Increase circulation rate (flow rate)",
      "Improve mud rheology and carrying capacity",
      "Monitor shaker screen performance and cuttings volume return"
    ]
  },
  {
    id: "bit-wear",
    name: "Bit Wear",
    risk: "Medium",
    description: "Degradation, chipping, or wear of drill bit cutters, which reduces penetration rates and alters torque response.",
    symptoms: ["low-rop", "unstable-torque", "cutter-debris"],
    causes: [
      "Abrasive formations",
      "Long drilling intervals without replacement",
      "Excessive drilling vibration (chatter, stick-slip)"
    ],
    actions: [
      "Inspect bit condition (dull grading) upon retrieval",
      "Replace worn bit or choose a more wear-resistant cutter type",
      "Optimize drilling parameters (WOB, RPM) to reduce mechanical specific energy"
    ]
  },
  {
    id: "lost-circulation",
    name: "Lost Circulation",
    risk: "High",
    description: "The partial or complete loss of drilling fluid into fractured, highly permeable, or cavernous formations.",
    symptoms: ["mud-loss", "reduced-returns", "zero-returns", "annular-pressure-drop"],
    causes: [
      "Naturally fractured formations",
      "Cavernous or vuggy zones",
      "Induced fractures caused by excessive mud weight or equivalent circulating density (ECD)"
    ],
    actions: [
      "Pump Lost Circulation Material (LCM) pills",
      "Monitor pit volume closely and record loss rate",
      "Adjust mud program (reduce mud weight or ECD) and run casing if necessary"
    ]
  },
  {
    id: "differential-sticking",
    name: "Differential Sticking",
    risk: "High",
    description: "Drill string becomes held against a permeable zone due to a high pressure differential between the mud column and the formation.",
    symptoms: ["pipe-stuck-static", "no-pipe-movement", "low-torque"],
    causes: [
      "High overbalance pressure (excessive mud weight)",
      "Permeable formations (e.g., thick sands)",
      "Thick, high-permeability filter cake",
      "Keeping the drill string stationary for extended periods"
    ],
    actions: [
      "Work the pipe by applying maximum safe torque and tension",
      "Reduce mud weight (if well control parameters permit)",
      "Pump a chemical spotting fluid (oil or acid pill) to break the filter cake",
      "Spot a U-tube to reduce hydrostatic pressure temporarily"
    ]
  },
  {
    id: "mechanical-sticking",
    name: "Mechanical Sticking",
    risk: "High",
    description: "Physical restriction preventing drill string movement, often caused by wellbore debris, hole collapse, or geometry issues.",
    symptoms: ["pipe-stuck-moving", "pump-pressure-spike", "high-torque", "high-drag"],
    causes: [
      "Keyseating in doglegs or sharp wellbore deviations",
      "Wellbore collapse or sloughing shales",
      "Junk dropped down the hole",
      "Swelling shales reducing wellbore diameter"
    ],
    actions: [
      "Jar in the opposite direction of the sticking event (e.g., jar down if stuck going up)",
      "Work the pipe within safety limits while monitoring tension and torque",
      "Check cuttings volume at the shaker to identify cave-ins",
      "Circulate at a safe pressure to clear pack-offs around the BHA"
    ]
  },
  {
    id: "pack-off",
    name: "Pack-Off",
    risk: "High",
    description: "Annular blockage of the wellbore by accumulated cuttings or cave-ins, restricting mud returns and causing pressure spikes.",
    symptoms: ["high-spp", "reduced-returns", "high-torque", "flow-restriction"],
    causes: [
      "Wellbore instability and sloughing shales (cavings)",
      "Inadequate hole cleaning in high-angle sections",
      "Shale hydration/swelling in contact with water-based muds"
    ],
    actions: [
      "Reciprocate pipe with caution; do not pull into the pack-off",
      "Reduce pump rate immediately to clear the blockage safely and prevent formation breakdown",
      "Carefully monitor standpipe pressure and control pump startup",
      "Inspect shaker screens for unusual amounts of large cavings"
    ]
  },
  {
    id: "bit-balling",
    name: "Bit Balling",
    risk: "Medium",
    description: "Sticky clay or shale formation material adheres to the bit face and nozzles, packing it off and reducing drilling efficiency.",
    symptoms: ["low-rop", "high-spp", "high-torque"],
    causes: [
      "Drilling reactive shale/clay formations with water-based mud",
      "Insufficient mechanical cleaning (low flow rate or poor nozzle configuration)",
      "Excessive weight on bit (WOB) pushing the bit into sticky muck"
    ],
    actions: [
      "Pump specialized chemical pills (nut plug, detergent pills, or glycol washes)",
      "Increase mud flow rate and nozzle velocity to clean the cutters",
      "Adjust drilling parameters (reduce WOB, increase RPM) to throw off debris",
      "Switch to oil-based mud or add shale inhibitors to the mud system"
    ]
  },
  {
    id: "washout",
    name: "Washout",
    risk: "Medium",
    description: "A hole or leak developed in the drill string (often at a tool joint thread) due to fluid erosion from internal mud pressure.",
    symptoms: ["low-spp", "low-torque", "tool-joint-leak"],
    causes: [
      "High fluid velocity through a small crack or fatigue fissure",
      "Drill pipe connection fatigue or over-torque crack",
      "Corrosive drilling mud environment promoting pitting"
    ],
    actions: [
      "Pull Out Of Hole (POOH) to inspect the drill string immediately",
      "Locate and replace the washed-out joint or tool component",
      "Continuously monitor standpipe pressure for gradual drops at constant flow rate"
    ]
  },
  {
    id: "vibration-dysfunction",
    name: "Vibration Dysfunction",
    risk: "Medium",
    description: "Severe axial, torsional (stick-slip), or lateral vibration in the Bottom Hole Assembly (BHA) causing energy loss and tool damage.",
    symptoms: ["high-vibration", "torque-fluctuation", "bha-damage"],
    causes: [
      "Sub-optimal drill bit selection or BHA design",
      "Drilling through hard or interbedded formations",
      "Improper combination of RPM and WOB (critical speeds)"
    ],
    actions: [
      "Change RPM and WOB immediately to move out of the resonant frequency range",
      "Pick up off bottom to damp vibrations, then re-engage slowly",
      "Consider redesigning BHA (using roller reamers or shock subs) on the next trip",
      "Monitor MWD/LWD vibration sensors closely for real-time alerts"
    ]
  },
  {
    id: "formation-change",
    name: "Formation Change",
    risk: "Low",
    description: "A natural transition between geological layers with different drillability, strength, or mechanical properties.",
    symptoms: ["sudden-rop-change", "shaker-cuttings-change"],
    causes: [
      "Transition from soft clay to hard rock, or vice versa",
      "Crossing a geological fault or lithology transition zone",
      "Entering a zone with different pore pressure or compaction"
    ],
    actions: [
      "Perform a drill-off test to determine the optimal drilling parameters (WOB/RPM)",
      "Adjust WOB and mud weight if necessary to match the new formation properties",
      "Inspect shaker returns to confirm lithology change (e.g., sand to shale)"
    ]
  }
];

// Export to window object for browser scripts
window.SYMPTOMS_DATABASE = SYMPTOMS_DATABASE;
window.PROBLEMS_DATABASE = PROBLEMS_DATABASE;
