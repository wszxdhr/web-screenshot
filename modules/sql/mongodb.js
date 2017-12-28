let mongoose = require('mongoose')
let mongoConfig = require('../../sqlConfig')

let mongoAuthUrl = `mongodb://${mongoConfig.username}:${mongoConfig.password}@${mongoConfig.host}:${mongoConfig.port}/${mongoConfig.database}`

mongoose.connect(mongoAuthUrl, {
  useMongoClient: true
})
mongoose.Promise = global.Promise;

mongoose.connection.on('error', function (err) {
  console.log('Mongo connection error: ', err)
})

mongoose.connection.on('disconnected', function () {
  console.log('Mongo connection disconnected')
})

module.exports = mongoose.connection

