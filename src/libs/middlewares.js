import express from 'express'

module.exports = app => {
  app.set('port', 41000)
  app.use(express.json())
}