import selenium from '../libs/selenium'

module.exports = app => {
  app.get('/', async (req, res) => {
    res.send(await selenium.start())
  })
}