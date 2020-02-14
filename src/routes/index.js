import selenium from '../libs/selenium'

module.exports = app => {
  app.get('/buscar/:processos', async (req, res) => {
    res.send(await selenium.start(req.params.processos))
  })
}