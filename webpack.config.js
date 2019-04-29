module.exports = {
  entry: {
    checkIn: './src/checkIn.js',
    lookNearby: './src/lookNearby.js',
  },
  externals: ['aws-sdk'],
  mode: 'production',
  target: 'node',
  output: {
    libraryTarget: 'commonjs',
  },
};
