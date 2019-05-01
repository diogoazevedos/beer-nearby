const elasticsearch = require('elasticsearch');

const mockIndex = jest.fn();
elasticsearch.Client = jest.fn().mockImplementation(() => ({
  index: mockIndex,
}));

const { handler } = require('../src/checkIn');

const headers = { 'Content-Type': 'application/json' };

test('should create a check-in point', async () => {
  const response = await handler({
    body: JSON.stringify({
      latitude: -29.954693,
      longitude: -51.624725,
      beer: {
        id: 18,
        name: 'Russian Doll – India Pale Ale',
        tagline: 'Nesting Hop Bomb.',
        description: 'The levels of hops vary throughout the range. We love hops, so all four beers are big, bitter badasses, but by tweaking the amount of each hop used later in the boil and during dry- hopping, we can balance the malty backbone with some unexpected flavours. Simcoe is used in the whirlpool for all four beers, and yet still lends different characters to each',
      },
    }),
  });

  expect(response).toEqual({ statusCode: 201 });
  expect(mockIndex).toBeCalledWith({
    index: 'beer_nearby',
    type: 'check_in',
    body: {
      location: {
        lat: -29.954693,
        lon: -51.624725,
      },
      beer: {
        id: 18,
        name: 'Russian Doll – India Pale Ale',
        tagline: 'Nesting Hop Bomb.',
        description: 'The levels of hops vary throughout the range. We love hops, so all four beers are big, bitter badasses, but by tweaking the amount of each hop used later in the boil and during dry- hopping, we can balance the malty backbone with some unexpected flavours. Simcoe is used in the whirlpool for all four beers, and yet still lends different characters to each',
      },
      timestamp: expect.any(Number),
    },
  });
});

test('should return a client error', async () => {
  const response = await handler({
    body: JSON.stringify({
      latitude: -29.954693,
      longitude: -51.624725,
      beer: {
        id: 'Ignore this message',
        name: 'Russian Doll – India Pale Ale',
        tagline: 'Nesting Hop Bomb.',
        description: 'The levels of hops vary throughout the range. We love hops, so all four beers are big, bitter badasses, but by tweaking the amount of each hop used later in the boil and during dry- hopping, we can balance the malty backbone with some unexpected flavours. Simcoe is used in the whirlpool for all four beers, and yet still lends different characters to each',
      },
    }),
  });

  expect(response).toEqual({ headers, statusCode: 422, body: expect.any(String) });
  expect(mockIndex).not.toBeCalled();
});
