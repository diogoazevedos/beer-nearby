const Joi = require('@hapi/joi');
const { getDistance } = require('geolib');
const { decode } = require('ngeohash');
const { pick, prop } = require('ramda');
const client = require('./client');

const headers = { 'Content-Type': 'application/json' };
const lookNearby = Joi.object().keys({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
});

exports.handler = async ({ queryStringParameters }) => {
  const { error, value } = lookNearby.validate(queryStringParameters);

  if (error) {
    return { headers, statusCode: 422, body: JSON.stringify(prop('details', error)) };
  }

  const location = { lat: value.latitude, lon: value.longitude };
  const { hits, aggregations } = await client.search({
    index: 'beer_nearby',
    type: 'check_in',
    body: {
      query: {
        bool: {
          filter: [
            { geo_distance: { location, distance: '1km' } },
            { range: { timestamp: { gte: 'now-1h' } } },
          ],
        },
      },
      aggregations: {
        locations: {
          geohash_grid: { field: 'location', precision: 8 },
          aggregations: {
            beers: { terms: { field: 'beer.id' } },
          },
        },
      },
    },
  });

  const checkIns = new Map(hits.hits.map(({ _source }) => [_source.beer.id, _source]));
  const response = aggregations.locations.buckets.map(({ beers, key: geohash }) => {
    const clusterLocation = pick(['latitude', 'longitude'], decode(geohash));

    return {
      ...clusterLocation,
      distance: getDistance(location, clusterLocation),
      beers: beers.buckets.map(({ key: beerId, doc_count: count }) => {
        const { beer } = checkIns.get(beerId);
        return { ...beer, count, image_url: `https://images.punkapi.com/v2/${beer.id}.png` };
      }),
    };
  });

  return { headers, statusCode: 200, body: JSON.stringify(response) };
};
