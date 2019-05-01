# Beer Nearby

## Search beers

To search beers use the [Punk API](https://punkapi.com) third-party service, it's very complete, but debounce your requests, since the API has a rate limit of `3600` requests per hour. They already use a CloudFront to cache similar requests, so it can be handy to us.

## Check-in

```sh
$ curl -6 -H 'Content-Type: application/json' -d @checkIn.json https://api.contentful.diogo.im/check_in
```

Where the `checkIn.json` looks like:

```js
{
  "latitude": /* Number between -90 and 90 */,
  "longitude": /* Number between -180 and 180 */,
  "beer": {
    "id": /* The beer ID from Punk API */,
    "name": /* The beer name from Punk API */,
    "tagline": /* The beer tagline from Punk API */,
    "description": /* The beer description from Punk API */
  }
}
```

## What's nearby

```sh
$ curl -6 https://api.contentful.diogo.im/look_nearby?latitude=<latitude>&longitude=<longitude>
```

Where `latitude` is a number between `-90` and `90` and `longitude` is a number between `-180` and `180`.

The response looks like:

```js
[{
  "latitude": /* The location latitude */,
  "longitude": /* The location longitude */,
  "distance": /* The distance between you and the location in meter */,
  "beers": [{
    "id": /* The beer ID from Punk API */,
    "name": /* The beer name from Punk API */,
    "tagline": /* The beer tagline from Punk API */,
    "description": /* The beer description from Punk API */,
    "image_url": /* The beer image url, generated using the ID and Punk API */,
  }]
}]
```

## Running locally

```sh
$ docker-compose -p beer_nearby up -d
$ curl -4 -X PUT -H 'Content-Type: application/json' -d @mapping.json http://localhost:9200/beer_nearby
```

### CheckIn

```sh
$ docker run --rm -v $PWD:/var/task --network beer_nearby_elastic -e ELASTICSEARCH_HOST=elasticsearch:9200 lambci/lambda:nodejs8.10 src/checkIn.handler '{"body":"{\"latitude\":-29,\"longitude\":-51,\"beer\":{\"id\":18,\"name\":\"Russian Doll – India Pale Ale\",\"tagline\":\"Nesting Hop Bomb.\",\"description\":\"The levels of hops vary throughout the range. We love hops, so all four beers are big, bitter badasses, but by tweaking the amount of each hop used later in the boil and during dry- hopping, we can balance the malty backbone with some unexpected flavours. Simcoe is used in the whirlpool for all four beers, and yet still lends different characters to each\"}}"}'
```

### LookNearby

```sh
$ docker run --rm -v $PWD:/var/task --network beer_nearby_elastic -e ELASTICSEARCH_HOST=elasticsearch:9200 lambci/lambda:nodejs8.10 src/lookNearby.handler '{"queryStringParameters":{"latitude":-29,"longitude":-51}}'
```
