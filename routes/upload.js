let fs = require('fs')
let path = require('path')
let qiniu = require('qiniu')
let Keys = require('../qiniuConfig')
const router = require('koa-router')()

router.post('/upload', (ctx) => {
    var file = ctx.request.body.files    //传输文件的name是abc
    console.log('body', ctx.request.body)

    var tmpath = file['path'];
    var tmparr = file['name'].split('.');
    var ext = '.' + tmparr[tmparr.length - 1];
    var newpath = path.join('./', parseInt(Math.random() * 100) + Date.parse(new Date()).toString() + ext);
    console.log(tmpath);
    console.log(newpath);
    var stream = fs.createWriteStream(newpath);//创建一个可写流
    fs.createReadStream(tmpath).pipe(stream);//可读流通过管道写入可写流
  }
)

router.post('/uptoken', async (ctx) => {
  let resBody = ctx.request.body
  let option = {
    scope: resBody.bucket,
    returnBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","name":"$(x:name)"}'
  }
  let mac = new qiniu.auth.digest.Mac(Keys.AK, Keys.SK);
  let putPolicy = new qiniu.rs.PutPolicy(option);
  let uploadToken = putPolicy.uploadToken(mac);
  ctx.body = {
    uptoken: uploadToken,
    key: resBody.key
  }
})

module.exports = router