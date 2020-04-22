const { Firestore } = require('@google-cloud/firestore')
const firestore = new Firestore({
  projectId: process.env.FIREBASE_PROJECT_ID,
  credentials: {
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(
      /\\n/g,
      '\n'
    ),
  },
})

firestore
  .collection('games')
  .get()
  .then((snapshot) => {
    console.log(snapshot.size, 'games found in database.')
  })

module.exports = {
  async addScore({ game, name, score }) {
    return await firestore
      .collection('games')
      .doc(game)
      .collection('scores')
      .add({
        name,
        score,
      })
      .then(() => {
        console.log('added score', game, name, score)
        return true
      })
      .catch((err) => {
        return console.log(err)
      })
  },

  async getScores({ game, top, count }) {
    return await firestore
      .collection('games')
      .doc(game)
      .collection('scores')
      .orderBy('score', top ? 'desc' : 'asc')
      .limit(count)
      .get()
      .then((snapshot) => {
        console.log(snapshot.docs.length, 'scores returned', game)
        if (snapshot.docs.length === 0) return
        return snapshot.docs
          .map((d) => {
            const data = d.data()
            return data.name.replace(/[,"]/g, '') + ',' + data.score
          })
          .join('\n')
      })
      .catch((err) => {
        return console.log(err)
      })
  },
}
