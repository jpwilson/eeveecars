/**
 * Public API: Search electric vehicles
 * GET /api/ev/search?q={query}&minRange={num}&maxPrice={num}
 * 
 * Search EVs by name, make, or specs for AI tools and integrations.
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

  const { q, minRange, maxPrice, minSeats, availability } = req.query;

  if (!q && !minRange && !maxPrice && !minSeats && !availability) {
    return res.status(400).json({ 
      error: 'At least one search parameter required',
      params: ['q', 'minRange', 'maxPrice', 'minSeats', 'availability']
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

    let cars = await response.json();

    // Filter by text query
    if (q) {
      const query = q.toLowerCase();
      cars = cars.filter(car => 
        car.make_name?.toLowerCase().includes(query) ||
        car.model?.toLowerCase().includes(query) ||
        car.submodel?.toLowerCase().includes(query) ||
        car.vehicle_class?.toLowerCase().includes(query)
      );
    }

    // Filter by minimum range
    if (minRange) {
      const range = parseInt(minRange);
      cars = cars.filter(car => car.epa_range && car.epa_range >= range);
    }

    // Filter by maximum price
    if (maxPrice) {
      const price = parseInt(maxPrice);
      cars = cars.filter(car => car.current_price && car.current_price <= price);
    }

    // Filter by minimum seats
    if (minSeats) {
      const seats = parseInt(minSeats);
      cars = cars.filter(car => car.number_of_full_adult_seats && car.number_of_full_adult_seats >= seats);
    }

    // Filter by availability
    if (availability) {
      cars = cars.filter(car => car.availability_desc === availability);
    }

    // Return simplified data structure
    const evData = cars.map(car => ({
      id: car.id,
      make: car.make_name,
      model: car.model,
      submodel: car.submodel,
      slug: car.make_model_slug,
      year: car.model_year,
      price: car.current_price,
      range: car.epa_range,
      acceleration: car.acceleration_0_60,
      topSpeed: car.top_speed,
      power: car.power,
      battery: car.battery_capacity,
      chargingSpeed: car.battery_max_charging_speed,
      seats: car.number_of_full_adult_seats,
      driveType: car.drive_type,
      vehicleClass: car.vehicle_class,
      availability: car.availability_desc,
      image: car.image_url,
      url: `https://www.evlineup.org/model_detail/${car.make_model_slug}`
    }));

    res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');
    return res.status(200).json({
      query: { q, minRange, maxPrice, minSeats, availability },
      count: evData.length,
      data: evData
    });
  } catch (error) {
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
