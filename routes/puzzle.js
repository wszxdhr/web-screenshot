const router = require('koa-router')()

router.get('/puzzle', async (ctx, next) => {
  await ctx.render('puzzle.pug')
})


module.exports = router
