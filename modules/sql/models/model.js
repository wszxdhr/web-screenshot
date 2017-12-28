let mongoose = require('../mongodb')

let Model = mongoose.model('model', {
  name: String,
  elements: Array,
  width: String,
  height: String
})

module.exports = Model

