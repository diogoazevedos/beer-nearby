const client = require('./client');

const unwrap = ({ hits: { hits, total } }) => ({
  total,
  data: hits.map(({ _id, _source, sort: [distance] }) => ({ distance, id: _id, ..._source })),
});

exports.handler = async ({ queryStringParameters }) => {
  const { latitude, longitude } = queryStringParameters;
  const location = { lat: latitude, lon: longitude };
  const response = await client.search({
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
          geogrid_hash: { field: 'location', precision: 8 },
        },
        aggregations: {
          beers: { terms: { field: '_id' } },
        },
      },
      sort: [
        { _geo_distance: { location, order: 'asc' } },
      ],
    },
  });

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(unwrap(response)),
  };
};
