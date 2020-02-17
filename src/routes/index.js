import selenium from '../libs/selenium'

module.exports = app => {
  app.get('/', async (req, res) => {
    await selenium.start()
  })
}