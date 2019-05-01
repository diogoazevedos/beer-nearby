const Joi = require('@hapi/joi');
const { prop } = require('ramda');
const client = require('./client');

const checkIn = Joi.object().keys({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  beer: Joi.object().keys({
    id: Joi.number().integer().min(1).required(),
    name: Joi.string().required(),
    tagline: Joi.string().required(),
    description: Joi.string().required(),
  }),
});

exports.handler = async ({ body }) => {
  const { error, value } = checkIn.validate(JSON.parse(body));

  if (error) {
    return { statusCode: 422, body: JSON.stringify(prop('details', error)) };
  }

  await client.index({
    index: 'beer_nearby',
    type: 'check_in',
    body: {
      beer: value.beer,
      location: { lat: value.latitude, lon: value.longitude },
      timestamp: Date.now(),
    },
  });

  return { statusCode: 201 };
};
