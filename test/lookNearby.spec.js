const elasticsearch = require('elasticsearch');

const mockSearch = jest.fn().mockResolvedValue({
  hits: {
    hits: [
      {
        _id: 'b5KpcGoBqvA79y4uztog',
        _source: {
          beer: {
            id: 18,
            name: 'Russian Doll – India Pale Ale',
            tagline: 'Nesting Hop Bomb.',
            description: 'The levels of hops vary throughout the range. We love hops, so all four beers are big, bitter badasses, but by tweaking the amount of each hop used later in the boil and during dry- hopping, we can balance the malty backbone with some unexpected flavours. Simcoe is used in the whirlpool for all four beers, and yet still lends different characters to each',
          },
        },
      },
      {
        _id: 'cZKpcGoBqvA79y4u7Nqq',
        _source: {
          beer: {
            id: 18,
            name: 'Russian Doll – India Pale Ale',
            tagline: 'Nesting Hop Bomb.',
            description: 'The levels of hops vary throughout the range. We love hops, so all four beers are big, bitter badasses, but by tweaking the amount of each hop used later in the boil and during dry- hopping, we can balance the malty backbone with some unexpected flavours. Simcoe is used in the whirlpool for all four beers, and yet still lends different characters to each',
          },
        },
      },
    ],
  },
  aggregations: {
    locations: {
      buckets: [
        {
          key: '6fem96bj',
          beers: {
            buckets: [
              { key: 'b5KpcGoBqvA79y4uztog' },
              { key: 'cZKpcGoBqvA79y4u7Nqq' },
            ],
          },
        },
      ],
    },
  },
});

elasticsearch.Client = jest.fn().mockImplementation(() => ({
  search: mockSearch,
}));

const { handler } = require('../src/lookNearby');

const headers = { 'Content-Type': 'application/json' };

test('should return nearby a check-ins', async () => {
  const response = await handler({
    queryStringParameters: { latitude: -29.954693, longitude: -51.624725 },
  });

  expect(response).toEqual({
    headers,
    statusCode: 200,
    body: JSON.stringify([{
      latitude: -29.954652786254883,
      longitude: -51.62458419799805,
      distance: 14,
      beers: [
        {
          id: 18,
          name: 'Russian Doll – India Pale Ale',
          tagline: 'Nesting Hop Bomb.',
          description: 'The levels of hops vary throughout the range. We love hops, so all four beers are big, bitter badasses, but by tweaking the amount of each hop used later in the boil and during dry- hopping, we can balance the malty backbone with some unexpected flavours. Simcoe is used in the whirlpool for all four beers, and yet still lends different characters to each',
          image_url: 'https://images.punkapi.com/v2/18.png',
        },
        {
          id: 18,
          name: 'Russian Doll – India Pale Ale',
          tagline: 'Nesting Hop Bomb.',
          description: 'The levels of hops vary throughout the range. We love hops, so all four beers are big, bitter badasses, but by tweaking the amount of each hop used later in the boil and during dry- hopping, we can balance the malty backbone with some unexpected flavours. Simcoe is used in the whirlpool for all four beers, and yet still lends different characters to each',
          image_url: 'https://images.punkapi.com/v2/18.png',
        },
      ],
    }]),
  });

  expect(mockSearch).toBeCalledWith({
    index: 'beer_nearby',
    type: 'check_in',
    body: {
      query: {
        bool: {
          filter: [
            { geo_distance: { location: { lat: -29.954693, lon: -51.624725 }, distance: '1km' } },
            { range: { timestamp: { gte: 'now-1h' } } },
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
});

test('should return a client error', async () => {
  const response = await handler({
    queryStringParameters: { latitude: 'abcde', longitude: 'fghij' },
  });

  expect(response).toEqual({ headers, statusCode: 422, body: expect.any(String) });
  expect(mockSearch).not.toBeCalled();
});
