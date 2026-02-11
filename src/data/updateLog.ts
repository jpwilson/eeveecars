export interface FieldChange {
  field: string;
  oldValue: string | number | null;
  newValue: string | number | null;
}

export interface UpdateEntry {
  id: string;
  date: string; // ISO date string
  carId?: number;
  model: string; // e.g. "Tesla Model Y" or "System"
  type: "spec_update" | "price_update" | "new_model" | "status_change" | "system";
  summary: string;
  changes: FieldChange[];
}

const updateLog: UpdateEntry[] = [
  {
    id: "init-001",
    date: "2026-02-05",
    model: "System",
    type: "system",
    summary: "Initial update log created. All 34 makes populated with descriptions, websites, countries, and statuses.",
    changes: [],
  },
  {
    id: "init-002",
    date: "2026-02-05",
    model: "System",
    type: "system",
    summary: "Added Slate Auto and Scout Motors as pre-production makes.",
    changes: [],
  },
  {
    id: "batch-000",
    date: "2026-02-10",
    model: "System",
    type: "system",
    summary: "Batch update of 33 model-reps to current 2025/2026 specs. 121 total field changes across pricing, range, performance, and generation data. Added Chevrolet make and Equinox EV.",
    changes: [],
  },
  {
    id: "batch-001",
    date: "2026-02-10",
    carId: 3,
    model: "Tesla Model Y",
    type: "spec_update",
    summary: "Updated to 2025/2026 specs: current_price, epa_range, acceleration_0_60, generation",
    changes: [{ field: "current_price", oldValue: 52490, newValue: 44990 }, { field: "epa_range", oldValue: 303, newValue: 327 }, { field: "acceleration_0_60", oldValue: 3.5, newValue: 4.1 }, { field: "generation", oldValue: "2021", newValue: "Juniper" }],
  },
  {
    id: "batch-002",
    date: "2026-02-10",
    carId: 23,
    model: "Tesla Model 3",
    type: "spec_update",
    summary: "Updated to 2025/2026 specs: current_price, epa_range, acceleration_0_60, top_speed, generation",
    changes: [{ field: "current_price", oldValue: 38990, newValue: 42490 }, { field: "epa_range", oldValue: 272, newValue: 363 }, { field: "acceleration_0_60", oldValue: 5.8, newValue: 2.9 }, { field: "top_speed", oldValue: 140, newValue: 163 }, { field: "generation", oldValue: "2021", newValue: "Highland" }],
  },
  {
    id: "batch-003",
    date: "2026-02-10",
    carId: 21,
    model: "Tesla Model S",
    type: "spec_update",
    summary: "Updated to 2025/2026 specs: current_price, epa_range",
    changes: [{ field: "current_price", oldValue: 89990, newValue: 74990 }, { field: "epa_range", oldValue: 396, newValue: 410 }],
  },
  {
    id: "batch-004",
    date: "2026-02-10",
    carId: 22,
    model: "Tesla Model X",
    type: "spec_update",
    summary: "Updated to 2025/2026 specs: current_price, epa_range, top_speed",
    changes: [{ field: "current_price", oldValue: 94990, newValue: 79990 }, { field: "epa_range", oldValue: 333, newValue: 329 }, { field: "top_speed", oldValue: 163, newValue: 149 }],
  },
  {
    id: "batch-005",
    date: "2026-02-10",
    carId: 19,
    model: "Tesla Cybertruck",
    type: "spec_update",
    summary: "Updated to 2025/2026 specs: current_price, epa_range",
    changes: [{ field: "current_price", oldValue: 99990, newValue: 79990 }, { field: "epa_range", oldValue: 320, newValue: 325 }],
  },
  {
    id: "batch-006",
    date: "2026-02-10",
    carId: 7,
    model: "Ford Mustang Mach-E",
    type: "spec_update",
    summary: "Updated to 2025/2026 specs: current_price, epa_range, acceleration_0_60, top_speed",
    changes: [{ field: "current_price", oldValue: 59995, newValue: 36495 }, { field: "epa_range", oldValue: 270, newValue: 320 }, { field: "acceleration_0_60", oldValue: 3.8, newValue: 3.3 }, { field: "top_speed", oldValue: 124, newValue: 130 }],
  },
  {
    id: "batch-007",
    date: "2026-02-10",
    carId: 49,
    model: "Ford F-150 Lightning",
    type: "spec_update",
    summary: "Updated to 2025/2026 specs: current_price, epa_range, acceleration_0_60, top_speed",
    changes: [{ field: "current_price", oldValue: 39974, newValue: 49995 }, { field: "epa_range", oldValue: 230, newValue: 320 }, { field: "acceleration_0_60", oldValue: 4.5, newValue: 3.8 }, { field: "top_speed", oldValue: 112, newValue: 110 }],
  },
  {
    id: "batch-008",
    date: "2026-02-10",
    carId: 103,
    model: "Hyundai Ioniq 5",
    type: "spec_update",
    summary: "Updated to 2025/2026 specs: current_price, epa_range, acceleration_0_60, generation",
    changes: [{ field: "current_price", oldValue: 57400, newValue: 43975 }, { field: "epa_range", oldValue: 260, newValue: 318 }, { field: "acceleration_0_60", oldValue: 5.1, newValue: 4.5 }, { field: "generation", oldValue: null, newValue: "2025 Facelift" }],
  },
  {
    id: "batch-009",
    date: "2026-02-10",
    carId: 96,
    model: "Hyundai Ioniq 6",
    type: "spec_update",
    summary: "Updated to 2025/2026 specs: current_price, epa_range, acceleration_0_60",
    changes: [{ field: "current_price", oldValue: 53650, newValue: 37750 }, { field: "epa_range", oldValue: 270, newValue: 361 }, { field: "acceleration_0_60", oldValue: 5.1, newValue: 4.4 }],
  },
  {
    id: "batch-010",
    date: "2026-02-10",
    carId: 202,
    model: "Chevrolet Equinox EV",
    type: "new_model",
    summary: "Added Chevrolet make and Equinox EV ($34,995, 319mi range). New brand and best-selling affordable EV.",
    changes: [{ field: "current_price", oldValue: null, newValue: 34995 }, { field: "epa_range", oldValue: null, newValue: 319 }],
  },
];

export default updateLog;
