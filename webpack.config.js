module.exports = {
  entry: {
    checkIn: './func/checkIn.js',
    lookNearby: './func/lookNearby.js',
  },
  externals: ['aws-sdk'],
  mode: 'production',
  target: 'node',
  output: {
    libraryTarget: 'commonjs',
  },
};
