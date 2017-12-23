const router = require('koa-router')()
let md5 = require('md5')
let fs = require('fs')
let path = require('path')
let pug = require('pug')
let browser = null;

require('../modules/puppeter')().then(b => {
  browser = b
})

router.get('/puzzle/:id', async (ctx, next) => {
  let filename = `${ctx.params.id}.json`
  let jsonPath = path.join(__dirname, '../public/files/temp/', filename)
  let assign = fs.readFileSync(jsonPath).toString()

  let html = pug.renderFile('views/puzzle.pug', JSON.parse(assign))
  // console.log(`当前标签数量：${browser.pages().length}`)
  ctx.body = html
})

router.post('/puzzle', async (ctx, next) => {
  let timer = new Date().valueOf()
  let filename = `/files/puzzles/${md5(ctx.request.body + timer)}.png`
  let jsonFile = `/files/temp/${md5(ctx.request.body + timer)}.json`
  let html = pug.renderFile('views/puzzle.pug', ctx.request.body)
  fs.writeFile(path.join(__dirname, '../public', jsonFile), JSON.stringify(ctx.request.body))

  console.log(`打开浏览器：${new Date().valueOf() - timer} ms`)
  const page = await browser.newPage()
  // 设置viewport
  await page.setViewport({width: 1920, height: 1})
  console.log(`打开标签：${new Date().valueOf() - timer} ms`)
  await page.setContent(html)
  console.log(`打开网页：${new Date().valueOf() - timer} ms （${filename}）`)
  await page.screenshot({
    path: path.join(__dirname, '../public', filename),
    fullPage: true,
    omitBackground: true
  })
  console.log(`截图：${new Date().valueOf() - timer} ms`)

  await page.close()
  ctx.body = {id: filename, url: `http://screenshot.anymelon.com/puzzle`, status: 0}
})

module.exports = router
