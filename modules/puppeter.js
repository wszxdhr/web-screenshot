let browser = null
const puppeteer = require('puppeteer')

module.exports = async function getBrowser () {
  if (!browser) {
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
  }
  return browser
}
