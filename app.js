const express = require('express')
const cors = require('cors')
require('dotenv').config()

const db = require('./firestore')

const app = express()

app.use(cors())

app.listen(process.env.PORT, () => {
  console.log('Server running on port', process.env.PORT)
})

app.get('/', (req, res) => {
  res.send(`Usage: \n
	To add a score: [this url]/[leaderboard]/add/[username]/[score]/\n
	To list scores: [this url]/[leaderboard]/[topOrBottom]/[count]/
	`)
})

app.get(
  '/:leaderboard/add/:name/:score/:replace?/:lowerIsBetter?',
  async (req, res) => {
    const leaderboard = req.params.leaderboard
    const name = req.params.name.replace(
      /(fuck|shit|bitch|ass|cunt|fag|nigger|spic|twat)/g,
      '***'
    )
    const score = parseFloat(req.params.score)
    const replace = !(req.params.replace === 'false')
    const lowerIsBetter = !(req.params.lowerIsBetter === 'false')
    if (!leaderboard || !name || (!score && score !== 0))
      return res.sendStatus(403)
    const success = await db.addScore({
      leaderboard,
      name,
      score,
      replace,
      lowerIsBetter,
    })
    if (success) res.sendStatus(200)
    else res.sendStatus(500)
  }
)

app.get('/:leaderboard/:topOrBottom/:count/', async (req, res) => {
  const leaderboard = req.params.leaderboard
  const top = req.params.topOrBottom.toLowerCase() !== 'bottom'
  const count = parseInt(req.params.count)
  if (!leaderboard || !count) return res.sendStatus(403)
  if (count > 100) count = 100
  const scores = await db.getScores({ leaderboard, top, count })
  if (!scores) return res.sendStatus(500)
  return res.json(scores)
})
