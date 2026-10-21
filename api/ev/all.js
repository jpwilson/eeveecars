/**
 * Public API: List all electric vehicles
 * GET /api/ev/all
 * 
 * Returns all EV models with basic specs for AI tools and integrations.
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

  try {
    const response = await fetchWithTimeout(`${API_BASE}/cars/cards`);
    
    if (!response.ok) {
      return res.status(response.status).json({ 
        error: 'Failed to fetch data',
        status: response.status 
      });
    }

    const cars = await response.json();
    
    // Filter out defunct brands that are no longer operating
    const DEFUNCT_BRANDS = ['Fisker', 'Canoo'];
    const activeCars = cars.filter(car => !DEFUNCT_BRANDS.includes(car.make_name));
    
    // Return simplified data structure
    const evData = activeCars.map(car => ({
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

    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json({
      count: evData.length,
      data: evData,
      updated: new Date().toISOString().split('T')[0]
    });
  } catch (error) {
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
