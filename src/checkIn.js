const client = require('./client');

exports.handler = async ({ body }) => {
  const { latitude, longitude } = JSON.parse(body);

  await client.index({
    index: 'beer_nearby',
    type: 'check_in',
    body: {
      location: { lat: latitude, lon: longitude },
      timestamp: Date.now(),
    },
  });

  return { statusCode: 201 };
};
