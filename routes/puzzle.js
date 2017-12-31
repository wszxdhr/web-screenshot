const router = require('koa-router')()
let md5 = require('md5')
let fs = require('fs')
let path = require('path')
let pug = require('pug')
let browser = null;
let Model = require('../modules/sql/models/model')
//
// console.log(db)

require('../modules/puppeter')().then(b => {
  browser = b
})

// 添加模板
router.post('/puzzle/model/add', async (ctx) => {
  let reqBody = ctx.request.body
  if (!reqBody.name) {
    ctx.body = {
      msg: '名称为必填',
      status: 1
    }
    return
  }
  let wherestr = {name: reqBody.name}
  let findResult = await Model.find(wherestr)
  let canContinue = false
  if (findResult) {
    if (!findResult.length) {
      canContinue = true
    } else {
      ctx.body = {
        msg: '模板名称已存在',
        status: 1
      }
    }
  } else {
    ctx.body = {
      msg: '模板名称已存在',
      status: 1
    }
  }
  if (canContinue) {
    let model = new Model(reqBody)
    let saveResult = await model.save((err) => {
      if (err) {
        console.log(err)
      } else {
        console.log('add model success')
      }
    })
    if (!saveResult) {
      ctx.body = {
        msg: '保存到数据库失败',
        status: 1
      }
    } else {
      ctx.body = {
        msg: 'success',
        status: 0
      }
    }
  }
})

// 修改模板，FIXME: 需要优化
router.post('/puzzle/model/update', async (ctx) => {
  let reqBody = ctx.request.body
  let wherestr = {}
  let {name: modelName, id: modelId} = ctx.query
  if (modelName) {
    wherestr.name = modelName
  }
  if (modelId) {
    wherestr._id = modelId
  }
  let findResult = await Model.find(wherestr)
  let canContinue = false
  if (findResult) {
    if (findResult.length) {
      canContinue = true
    } else {
      ctx.body = {
        msg: '模板不存在',
        status: 1
      }
    }
  } else {
    ctx.body = {
      msg: '模板不存在',
      status: 1
    }
  }
  if (canContinue) {
    await Model.update(wherestr, reqBody, (err) => {
      if (err) {
        console.log(err)
      } else {
        console.log('update model success', 'name: ', modelName)
      }
    })
    ctx.body = {
      msg: 'success',
      status: 0
    }
  }
})

// 查询模板，FIXME: 需要优化
router.get('/puzzle/model/item', async (ctx) => {
  let wherestr = {}
  let {name: modelName, id: modelId} = ctx.query
  if (modelName) {
    wherestr.name = modelName
  }
  if (modelId) {
    wherestr._id = modelId
  }
  let findResult = await Model.find(wherestr)
  console.log(findResult)
  if (findResult) {
    if (findResult.length) {
      ctx.body = {
        status: 0,
        data: findResult
      }
    } else {
      ctx.body = {
        msg: '模板不存在',
        status: 1
      }
    }
  } else {
    ctx.body = {
      msg: '模板不存在',
      status: 1
    }
  }
})

// 查询模板，FIXME: 需要优化
router.get('/puzzle/model/list', async (ctx) => {
  let wherestr = {} || ctx.request.body
  let findResult = await Model.find(wherestr)
  if (findResult) {
    if (findResult.length) {
      ctx.body = {
        status: 0,
        data: findResult
      }
    } else {
      ctx.body = {
        msg: '模板不存在',
        status: 1
      }
    }
  } else {
    ctx.body = {
      msg: '模板不存在',
      status: 1
    }
  }
})

// 删除模板
router.post('/puzzle/model/delete', async (ctx) => {
  let wherestr = {}
  let {name: modelName, id: modelId} = ctx.query
  if (modelName) {
    wherestr.name = modelName
  }
  if (modelId) {
    wherestr._id = modelId
  }
  let findResult = await Model.find(wherestr)
  let canContinue = false
  if (findResult) {
    if (findResult.length) {
      canContinue = true
    } else {
      ctx.body = {
        msg: '模板不存在',
        status: 1
      }
    }
  } else {
    ctx.body = {
      msg: '模板不存在',
      status: 1
    }
  }
  if (canContinue) {
    await Model.remove(wherestr, (err) => {
      if (err) {
        console.log(err)
      } else {
        console.log('delete model success', 'name: ', modelName)
      }
    })
    ctx.body = {
      msg: 'success',
      status: 0
    }
  }
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
  let puzzleId = md5(ctx.request.body + timer)
  let filename = `/files/puzzles/${puzzleId}.png`
  let jsonFile = `/files/temp/${puzzleId}.json`
  let htmlFile = `/files/temp/${puzzleId}.html`
  let html = pug.renderFile('views/puzzle.pug', ctx.request.body)
  // fs.writeFileSync(path.join(__dirname, '../public', jsonFile), JSON.stringify(ctx.request.body))
  // fs.writeFileSync(path.join(__dirname, '../public', htmlFile), html)

  console.log(`打开浏览器：${new Date().valueOf() - timer} ms`)
  const page = await browser.newPage()
  // 设置viewport
  await page.setViewport({width: 1920, height: 20})
  console.log(`打开标签：${new Date().valueOf() - timer} ms`)
  await page.setContent(html)
  console.log(`打开网页：${new Date().valueOf() - timer} ms （${filename}）`)
  await page.screenshot({
    path: path.join(__dirname, '../public', filename),
    fullPage: true,
    omitBackground: false
  })
  console.log(`截图：${new Date().valueOf() - timer} ms`)

  await page.close()
  ctx.body = {filename: filename, host: `http://screenshot.anymelon.com`, status: 0}
})

module.exports = router
