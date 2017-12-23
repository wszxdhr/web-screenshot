const router = require('koa-router')()
const types = require('../config').types
let browser = null;

require('../modules/puppeter')().then(b => {
  browser = b
})


function computeQuery (query) {
  let queryObj = {}
  query.type ? queryObj.type = query.type : 'jpeg'
  queryObj.type = (query.type === 'jpg' ? 'jpeg' : query.type)
  query.quality ? queryObj.quality = parseFloat(query.quality) : 100
  query.fullPage ? queryObj.fullPage = JSON.parse(query.fullPage) : ''
  // 截图范围，x,y,width,height必须给全, 且不可出现fullPage，omitBackground选填
  if (!queryObj.fullPage && query.x && query.y && query.width && query.height) {
    queryObj.clip = {
      x: parseInt(query.x),
      y: parseInt(query.y),
      width: parseInt(query.width),
      height: parseInt(query.height)
    }
    query.omitBackground ? queryObj.clip.omitBackground = JSON.parse(query.omitBackground) : ''
  }
  return queryObj
}

router.get('/screenshot', async (ctx, next) => {
  // if (!browser) {
  //   browser = await puppeteer.launch({
  //     args: ['--no-sandbox', '--disable-setuid-sandbox']
  //   })
  // }
  let timer = new Date().valueOf()
  let requestUrl = ctx.query.src || ''
  let query = computeQuery(ctx.query)
  console.log(query)

  console.log(`打开浏览器：${new Date().valueOf() - timer} ms`)
  const page = await browser.newPage()
  // 设置viewport
  await page.setViewport({width: 1920, height: 1080})
  console.log(`打开标签：${new Date().valueOf() - timer} ms`)
  await page.goto(requestUrl)
  console.log(`打开网页：${new Date().valueOf() - timer} ms （${requestUrl}）`)
  let buffer = await page.screenshot(query)
  console.log(`截图：${new Date().valueOf() - timer} ms`)

  await page.close()
  // console.log(`当前标签数量：${browser.pages().length}`)
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
