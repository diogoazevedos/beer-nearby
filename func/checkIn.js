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
