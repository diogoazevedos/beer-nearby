const { Client } = require('elasticsearch');
const { EnvironmentCredentials } = require('aws-sdk');

const client = new Client({
  host: process.env.ELASTICSEARCH_HOST,
  connectionClass: require('http-aws-es'), // eslint-disable-line global-require
  amazonES: {
    region: 'eu-east-1',
    credentials: new EnvironmentCredentials('AWS'),
  },
});

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
