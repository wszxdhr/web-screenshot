const router = require('koa-router')()
let md5 = require('md5')
let fs = require('fs')
let path = require('path')

router.get('/puzzle/:id', async (ctx, next) => {
  console.log(ctx.params.id)
  let elements = fs.readFileSync(path.join(__dirname, '../public/files/temp', `${ctx.params.id}.json`)).toString()
  ctx.body = elements
})

router.post('/puzzle', async (ctx, next) => {
  let filename = md5(ctx.request.body)
  fs.writeFileSync(path.join(__dirname, '../public/files/temp', `${filename}.json`), JSON.stringify(ctx.request.body))
  ctx.body = {id: filename, url: `http://screenshot.anymelon.com/puzzle`, status: 0}
})

module.exports = router
