const router = require('koa-router')()

router.get('/puzzle', async (ctx, next) => {
  await ctx.render('puzzle.pug')
})

router.post('/puzzle', async (ctx, next) => {
  console.log(JSON.stringify(ctx.request.body))
  await ctx.render('puzzle.pug', {elements: JSON.stringify(ctx.request.body)})
})

module.exports = router
