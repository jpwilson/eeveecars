/**
 * Public API: Get full specs for one EV model
 * GET /api/ev/specs/{slug} or GET /api/ev/specs?slug={slug}
 * 
 * Returns complete specifications for a single EV model.
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

  // Support both query param and path param
  const slug = req.query.slug || req.query.model;

  if (!slug) {
    return res.status(400).json({ 
      error: 'Model slug required',
      example: '/api/ev/specs?slug=tesla-model-3'
    });
  }

  try {
    const response = await fetchWithTimeout(
      `${API_BASE}/cars/model-details/${encodeURIComponent(slug)}`
    );

    if (!response.ok) {
      return res.status(404).json({ 
        error: 'Model not found',
        slug 
      });
    }

    const data = await response.json();
    const rep = data.representative_model;
    const make = data.make_details;
    const submodels = data.submodels || [];

    if (!rep) {
      return res.status(404).json({ 
        error: 'Model data not available',
        slug 
      });
    }

    // Build complete spec response
    const specs = {
      name: `${rep.make_name} ${rep.model}`,
      slug: slug,
      make: {
        name: rep.make_name,
        country: make?.headquarters,
        founded: make?.founding_date,
        url: `https://www.evlineup.org/manufacturer/${rep.make_name.toLowerCase().replace(/\s+/g, '-')}`
      },
      model: {
        name: rep.model,
        year: rep.model_year,
        generation: rep.generation,
        class: rep.vehicle_class,
        description: rep.model_description || rep.car_description
      },
      pricing: {
        msrp: rep.current_price,
        msrpFormatted: rep.current_price ? `$${rep.current_price.toLocaleString()}` : null,
        currency: 'USD',
        note: 'Before taxes, fees, and incentives'
      },
      performance: {
        range: rep.epa_range,
        rangeUnit: 'miles',
        acceleration0to60: rep.acceleration_0_60,
        accelerationUnit: 'seconds',
        topSpeed: rep.top_speed,
        speedUnit: 'mph',
        power: rep.power,
        powerUnit: 'hp',
        torque: rep.torque,
        torqueUnit: 'lb-ft'
      },
      battery: {
        capacity: rep.battery_capacity,
        capacityUnit: 'kWh',
        chemistry: rep.battery_chemistry,
        maxChargingSpeed: rep.battery_max_charging_speed,
        chargingUnit: 'kW',
        voltage: rep.voltage,
        voltageUnit: 'V'
      },
      drivetrain: {
        type: rep.drive_type,
        motors: rep.num_motors
      },
      dimensions: {
        length: rep.length,
        width: rep.width,
        height: rep.height,
        wheelbase: rep.wheelbase,
        groundClearance: rep.ground_clearance,
        unit: 'inches',
        curbWeight: rep.curb_weight,
        weightUnit: 'lbs',
        cargoVolume: rep.cargo_volume,
        volumeUnit: 'cu ft'
      },
      interior: {
        seats: rep.number_of_full_adult_seats,
        doors: rep.num_doors
      },
      availability: {
        status: rep.availability_desc,
        releaseDate: rep.release_date,
        discontinued: rep.discontinuation_date
      },
      media: {
        image: rep.image_url,
        imageAlt: `${rep.make_name} ${rep.model}`
      },
      variants: submodels.map(sub => ({
        name: sub.submodel,
        price: sub.current_price,
        range: sub.epa_range,
        acceleration: sub.acceleration_0_60,
        power: sub.power
      })),
      url: `https://www.evlineup.org/model_detail/${slug}`,
      dataSource: 'EV Lineup',
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json(specs);
  } catch (error) {
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
