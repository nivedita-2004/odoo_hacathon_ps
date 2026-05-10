const cityQueries = require('../queries/city.queries');
const { asyncHandler } = require('../middleware/error.middleware');

const getAllCities = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, country_id } = req.query;

  const result = await cityQueries.findAll(
    parseInt(page),
    parseInt(limit),
    country_id ? parseInt(country_id) : null
  );

  res.status(200).json({
    success: true,
    data: result
  });
});

const searchCities = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 20, country_id } = req.query;

  if (!q) {
    return res.status(400).json({
      success: false,
      message: 'Search query is required'
    });
  }

  const result = await cityQueries.search(
    q,
    parseInt(page),
    parseInt(limit),
    country_id ? parseInt(country_id) : null
  );

  res.status(200).json({
    success: true,
    data: result
  });
});

const getCityById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const city = await cityQueries.findById(parseInt(id));

  if (!city) {
    return res.status(404).json({
      success: false,
      message: 'City not found'
    });
  }

  res.status(200).json({
    success: true,
    data: { city }
  });
});

const getPopularCities = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const cities = await cityQueries.getPopularCities(parseInt(limit));

  res.status(200).json({
    success: true,
    data: { cities }
  });
});

const getCityActivities = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const city = await cityQueries.findById(parseInt(id));
  if (!city) {
    return res.status(404).json({
      success: false,
      message: 'City not found'
    });
  }

  const result = await cityQueries.getCityActivities(
    parseInt(id),
    parseInt(page),
    parseInt(limit)
  );

  res.status(200).json({
    success: true,
    data: result
  });
});

const getCountries = asyncHandler(async (req, res) => {
  const countries = await cityQueries.getCountries();

  res.status(200).json({
    success: true,
    data: { countries }
  });
});

const createCity = asyncHandler(async (req, res) => {
  const { country_id, name, latitude, longitude, popularity_score } = req.body;

  const cityId = await cityQueries.create({
    country_id: parseInt(country_id),
    name,
    latitude: latitude ? parseFloat(latitude) : null,
    longitude: longitude ? parseFloat(longitude) : null,
    popularity_score: popularity_score ? parseFloat(popularity_score) : 0
  });

  const city = await cityQueries.findById(cityId);

  res.status(201).json({
    success: true,
    message: 'City created successfully',
    data: { city }
  });
});

const updateCity = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const allowedFields = ['name', 'latitude', 'longitude', 'popularity_score'];
  const updateData = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  }

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No valid fields to update'
    });
  }

  await cityQueries.update(parseInt(id), updateData);
  const city = await cityQueries.findById(parseInt(id));

  res.status(200).json({
    success: true,
    message: 'City updated successfully',
    data: { city }
  });
});

const deleteCity = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await cityQueries.delete(parseInt(id));

  res.status(200).json({
    success: true,
    message: 'City deleted successfully'
  });
});

module.exports = {
  getAllCities,
  searchCities,
  getCityById,
  getPopularCities,
  getCityActivities,
  getCountries,
  createCity,
  updateCity,
  deleteCity
};
