const { Client } = require('elasticsearch');
const { EnvironmentCredentials } = require('aws-sdk');

module.exports = new Client({
  host: process.env.ELASTICSEARCH_HOST,
  connectionClass: require('http-aws-es'), // eslint-disable-line global-require
  amazonES: {
    region: 'eu-east-1',
    credentials: new EnvironmentCredentials('AWS'),
  },
});
