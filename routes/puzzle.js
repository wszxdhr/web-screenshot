const router = require('koa-router')()

router.get('/puzzle', async (ctx, next) => {
  await ctx.render('puzzle.pug', { pageTitle: 'Home'})
  ctx.status = 200
})


module.exports = router
