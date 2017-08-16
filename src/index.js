require('babel-register')
require('babel-core').transform('code', {
  plugins: ['transform-es2015-destructuring'],
})

require('./app/vouches.js')
