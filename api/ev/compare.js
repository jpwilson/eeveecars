/**
 * Public API: Compare two electric vehicles
 * GET /api/ev/compare?models={slug1},{slug2}
 * 
 * Compare specs between two EV models for AI tools and integrations.
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

  const { models } = req.query;

  if (!models || !models.includes(',')) {
    return res.status(400).json({ 
      error: 'Two model slugs required, separated by comma',
      example: '/api/ev/compare?models=tesla-model-3,bmw-i4'
    });
  }

  const [slug1, slug2] = models.split(',').map(s => s.trim());

  if (!slug1 || !slug2) {
    return res.status(400).json({ 
      error: 'Both model slugs must be provided',
      example: '/api/ev/compare?models=tesla-model-3,bmw-i4'
    });
  }

  try {
    // Fetch both models
    const [res1, res2] = await Promise.all([
      fetchWithTimeout(`${API_BASE}/cars/model-details/${encodeURIComponent(slug1)}`),
      fetchWithTimeout(`${API_BASE}/cars/model-details/${encodeURIComponent(slug2)}`)
    ]);

    if (!res1.ok) {
      return res.status(404).json({ error: `Model not found: ${slug1}` });
    }
    if (!res2.ok) {
      return res.status(404).json({ error: `Model not found: ${slug2}` });
    }

    const [data1, data2] = await Promise.all([res1.json(), res2.json()]);
    const model1 = data1.representative_model;
    const model2 = data2.representative_model;

    if (!model1 || !model2) {
      return res.status(404).json({ error: 'Model data not available' });
    }

    // Build comparison
    const comparison = {
      model1: {
        name: `${model1.make_name} ${model1.model}`,
        slug: slug1,
        price: model1.current_price,
        range: model1.epa_range,
        acceleration: model1.acceleration_0_60,
        topSpeed: model1.top_speed,
        power: model1.power,
        battery: model1.battery_capacity,
        chargingSpeed: model1.battery_max_charging_speed,
        seats: model1.number_of_full_adult_seats,
        driveType: model1.drive_type,
        vehicleClass: model1.vehicle_class,
        image: model1.image_url,
        url: `https://www.evlineup.org/model_detail/${slug1}`
      },
      model2: {
        name: `${model2.make_name} ${model2.model}`,
        slug: slug2,
        price: model2.current_price,
        range: model2.epa_range,
        acceleration: model2.acceleration_0_60,
        topSpeed: model2.top_speed,
        power: model2.power,
        battery: model2.battery_capacity,
        chargingSpeed: model2.battery_max_charging_speed,
        seats: model2.number_of_full_adult_seats,
        driveType: model2.drive_type,
        vehicleClass: model2.vehicle_class,
        image: model2.image_url,
        url: `https://www.evlineup.org/model_detail/${slug2}`
      },
      differences: {}
    };

    // Calculate differences
    if (model1.current_price && model2.current_price) {
      comparison.differences.price = {
        difference: Math.abs(model1.current_price - model2.current_price),
        cheaper: model1.current_price < model2.current_price ? 'model1' : 'model2'
      };
    }

    if (model1.epa_range && model2.epa_range) {
      comparison.differences.range = {
        difference: Math.abs(model1.epa_range - model2.epa_range),
        longer: model1.epa_range > model2.epa_range ? 'model1' : 'model2'
      };
    }

    if (model1.acceleration_0_60 && model2.acceleration_0_60) {
      comparison.differences.acceleration = {
        difference: Math.abs(model1.acceleration_0_60 - model2.acceleration_0_60),
        faster: model1.acceleration_0_60 < model2.acceleration_0_60 ? 'model1' : 'model2'
      };
    }

    if (model1.power && model2.power) {
      comparison.differences.power = {
        difference: Math.abs(model1.power - model2.power),
        more: model1.power > model2.power ? 'model1' : 'model2'
      };
    }

    comparison.comparisonUrl = `https://www.evlineup.org/compare/${slug1}-vs-${slug2}`;

    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json(comparison);
  } catch (error) {
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
