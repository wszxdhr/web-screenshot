const router = require('koa-router')()
const puppeteer = require('puppeteer')
const types = require('../config').types

function computeQuery (query) {
  let queryObj = {}
  query.type ? queryObj.type = query.type : 'jpeg'
  queryObj.type = (query.type === 'jpg' ? 'jpeg' : query.type)
  query.quality ? queryObj.quality = parseFloat(query.quality) : 100
  query.fullPage ? queryObj.fullPage = JSON.parse(query.fullPage) : ''
  query.x ? queryObj.x = parseInt(query.x) : ''
  query.y ? queryObj.y = parseInt(query.y) : ''
  query.width ? queryObj.width = parseInt(query.width) : ''
  query.height ? queryObj.height = parseInt(query.height) : ''
  query.omitBackground ? queryObj.omitBackground = JSON.parse(query.omitBackground) : ''
  return queryObj
}

router.get('/', async (ctx, next) => {
  let requestUrl = ctx.query.src || ''
  let query = computeQuery(ctx.query)

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  const page = await browser.newPage()
  await page.goto(requestUrl)
  let buffer = await page.screenshot(query)

  await browser.close()
  ctx.res.writeHead(200, {
    'Content-Type': types[query.type],
    'Content-Length': buffer.length
  })
  ctx.res.write(buffer, 'binary')
  ctx.res.end()
})

router.get('/string', async (ctx, next) => {
  ctx.body = 'koa2 string'
})

router.get('/json', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json'
  }
})

module.exports = router
