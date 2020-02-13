import selenium from '../libs/selenium'

module.exports = app => {
  app.get('/buscar/:processos', async (req, res) => {
    selenium.start()
    res.send(selenium.start())
    // res.send(req.params.processos)
  })
}