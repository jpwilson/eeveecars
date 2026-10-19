/**
 * Public API: Get best EVs by criteria
 * GET /api/ev/best/{criteria}
 * 
 * Returns ranked lists: cheapest, longest-range, fastest, evs-under-40k, 3-row-evs
 */

const API_BASE = "https://ev-backend-three.vercel.app";

async function fetchWithTimeout(url, ms = 6000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try {
    return await fetch(url, { signal: ctl.signal });
  } finally {
    clearTimeout(t);
  }
}

const CRITERIA = {
  'cheapest-evs': {
    title: 'Cheapest Electric Cars',
    description: 'Most affordable EVs ranked by MSRP',
    filter: (c) => c.availability_desc === 'available' && c.current_price,
    sort: (a, b) => (a.current_price ?? 0) - (b.current_price ?? 0),
    limit: 12
  },
  'longest-range-evs': {
    title: 'Longest Range Electric Cars',
    description: 'EVs that go furthest on a charge, ranked by EPA range',
    filter: (c) => c.availability_desc === 'available' && c.epa_range,
    sort: (a, b) => (b.epa_range ?? 0) - (a.epa_range ?? 0),
    limit: 12
  },
  'fastest-evs': {
    title: 'Fastest Electric Cars',
    description: 'Quickest EVs ranked by 0-60 mph acceleration',
    filter: (c) => c.availability_desc === 'available' && c.acceleration_0_60,
    sort: (a, b) => (a.acceleration_0_60 ?? 99) - (b.acceleration_0_60 ?? 99),
    limit: 12
  },
  'evs-under-40k': {
    title: 'Best EVs Under $40,000',
    description: 'Electric vehicles under $40k MSRP, ranked by review score',
    filter: (c) => c.availability_desc === 'available' && c.current_price && c.current_price < 40000,
    sort: (a, b) => (b.average_rating ?? 0) - (a.average_rating ?? 0) || (a.current_price ?? 0) - (b.current_price ?? 0),
    limit: 12
  },
  '3-row-evs': {
    title: 'Best 3-Row Electric SUVs',
    description: 'Electric vehicles with 6+ seats, ranked by review score',
    filter: (c) => c.availability_desc === 'available' && (c.number_of_full_adult_seats ?? 0) >= 6,
    sort: (a, b) => (b.average_rating ?? 0) - (a.average_rating ?? 0),
    limit: 12
  },
  'electric-trucks': {
    title: 'Electric Pickup Trucks',
    description: 'All electric trucks ranked by capability',
    filter: (c) => c.availability_desc === 'available' && (c.vehicle_class?.toLowerCase().includes('truck') || c.vehicle_class?.toLowerCase().includes('pickup')),
    sort: (a, b) => (b.average_rating ?? 0) - (a.average_rating ?? 0),
    limit: 12
  }
};

export default async function handler(req, res) {
  // CORS headers for public API access
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { criteria } = req.query;

  if (!criteria) {
    return res.status(200).json({
      availableCriteria: Object.keys(CRITERIA),
      example: '/api/ev/best?criteria=cheapest-evs'
    });
  }

  const config = CRITERIA[criteria];

  if (!config) {
    return res.status(400).json({
      error: 'Invalid criteria',
      available: Object.keys(CRITERIA),
      provided: criteria
    });
  }

  try {
    const response = await fetchWithTimeout(`${API_BASE}/cars/cards`);
    
    if (!response.ok) {
      return res.status(response.status).json({ 
        error: 'Failed to fetch data',
        status: response.status 
      });
    }

    const cars = await response.json();
    const ranked = cars
      .filter(config.filter)
      .sort(config.sort)
      .slice(0, config.limit);

    const results = ranked.map((car, index) => ({
      rank: index + 1,
      make: car.make_name,
      model: car.model,
      submodel: car.submodel,
      slug: car.make_model_slug,
      price: car.current_price,
      range: car.epa_range,
      acceleration: car.acceleration_0_60,
      topSpeed: car.top_speed,
      power: car.power,
      battery: car.battery_capacity,
      seats: car.number_of_full_adult_seats,
      rating: car.average_rating,
      image: car.image_url,
      url: `https://www.evlineup.org/model_detail/${car.make_model_slug}`
    }));

    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json({
      criteria,
      title: config.title,
      description: config.description,
      count: results.length,
      data: results,
      pageUrl: `https://www.evlineup.org/best/${criteria}`
    });
  } catch (error) {
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
