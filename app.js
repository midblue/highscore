const express = require('express')
require('dotenv').config()

const db = require('./firestore')

const app = express()

app.listen(process.env.PORT, () => {
  console.log('Server running on port', process.env.PORT)
})

app.get('/', (req, res) => {
  res.send(`Usage: 
	To add a score: https://agile-citadel-44322.herokuapp.com/<game>/add/<username>/<score>/
	To list scores: https://agile-citadel-44322.herokuapp.com/<game>/<topOrBottom>/<count>/`)
})

app.get('/:game/add/:name/:score/', async (req, res, next) => {
  const game = req.params.game
  const name = req.params.name
  const score = parseFloat(req.params.score)
  if (!game || !name || (!score && score !== 0))
    return res.sendStatus(403)
  const success = await db.addScore({ game, name, score })
  if (success) res.sendStatus(200)
  else res.sendStatus(500)
})

app.get('/:game/:topOrBottom/:count/', async (req, res, next) => {
  const game = req.params.game
  const top = req.params.topOrBottom.toLowerCase() !== 'bottom'
  const count = parseInt(req.params.count)
  if (!game || !count) return res.sendStatus(403)
  if (count > 100) count = 100
  const scores = await db.getScores({ game, top, count })
  console.log('scores:', scores)
  if (!scores) return res.sendStatus(500)
  return res.json(scores)
})
