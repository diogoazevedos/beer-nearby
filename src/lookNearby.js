const { getDistance } = require('geolib');
const { decode } = require('ngeohash');
const { pick } = require('ramda');
const client = require('./client');

exports.handler = async ({ queryStringParameters }) => {
  const { latitude, longitude } = queryStringParameters;
  const location = { lat: latitude, lon: longitude };
  const { hits, aggregations } = await client.search({
    index: 'beer_nearby',
    type: 'check_in',
    body: {
      query: {
        bool: {
          filter: [
            { geo_distance: { location, distance: '1km' } },
            { range: { timestamp: { gte: 'now-15m' } } },
          ],
        },
      },
      aggregations: {
        locations: {
          geohash_grid: { field: 'location', precision: 8 },
          aggregations: {
            beers: { terms: { field: '_id' } },
          },
        },
      },
    },
  });

  const checkIns = new Map(hits.hits.map(({ _id, _source }) => [_id, _source]));
  const response = aggregations.locations.buckets.map(({ beers, key: geohash }) => {
    const clusterLocation = pick(['latitude', 'longitude'], decode(geohash));

    return {
      ...clusterLocation,
      distance: getDistance(location, clusterLocation),
      beers: beers.buckets.map(({ key: checkInId }) => {
        const { beer } = checkIns.get(checkInId);
        return { ...beer, image_url: `https://images.punkapi.com/v2/${beer.id}.png` };
      }),
    };
  });

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(response),
  };
};
