const client = require('./client');

exports.handler = async ({ body }) => {
  const { beer, latitude, longitude } = JSON.parse(body);

  await client.index({
    index: 'beer_nearby',
    type: 'check_in',
    body: {
      beer,
      location: { lat: latitude, lon: longitude },
      timestamp: Date.now(),
    },
  });

  return { statusCode: 201 };
};
