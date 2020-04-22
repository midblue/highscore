const { Firestore } = require('@google-cloud/firestore')
const memo = require('./memo')
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

const memoizedLeaderboardCollections = memo(1000)

firestore
  .collection('leaderboards')
  .get()
  .then((snapshot) => {
    console.log(snapshot.size, 'leaderboards found in database.')
  })

module.exports = {
  addScore,
  getScores,
}

async function addScore({
  leaderboard,
  name,
  score,
  replace,
  lowerIsBetter = true,
}) {
  const collection = await getLeaderboardScoreCollection(leaderboard)

  const addNewScore = async () => {
    return await collection
      .add({
        name,
        score,
      })
      .then(() => {
        console.log('added score', leaderboard, name, score)
        return true
      })
      .catch(handleError)
  }

  if (replace) {
    return await collection
      .where('name', '==', name)
      .get()
      .then(async (snapshot) => {
        if (snapshot.empty) {
          return await addNewScore()
        } else {
          console.log(
            snapshot.docs[0].data().score,
            score,
            lowerIsBetter
          )
          if (
            (snapshot.docs[0].data().score < score &&
              lowerIsBetter) ||
            (snapshot.docs[0].data().score > score && !lowerIsBetter)
          ) {
            console.log('skipping score because it is worse')
            return true
          }
          const userEntryId = snapshot.docs[0].id
          console.log('updated score', leaderboard, name, score)
          return await collection
            .doc(userEntryId)
            .set({ name, score })
        }
      })
  } else {
    return await addNewScore()
  }
}

async function getScores({ leaderboard, top, count }) {
  const collection = await getLeaderboardScoreCollection(leaderboard)
  return await collection
    .orderBy('score', top ? 'desc' : 'asc')
    .limit(count)
    .get()
    .then((snapshot) => {
      console.log(
        snapshot.docs.length,
        'scores returned',
        leaderboard
      )
      if (snapshot.docs.length === 0) return
      return snapshot.docs
        .map((d) => {
          const data = d.data()
          return data.name.replace(/[,"]/g, '') + ',' + data.score
        })
        .join('\n')
    })
    .catch(handleError)
}

function handleError(err) {
  return console.log(err)
}

function getLeaderboardScoreCollection(
  leaderboard,
  collection = 'leaderboards'
) {
  return new Promise(async (resolve) => {
    const memoed = memoizedLeaderboardCollections.get(leaderboard)
    if (memoed) return resolve(memoed)
    const ref = firestore.collection(collection).doc(leaderboard)
    ref.get().then(async (doc) => {
      if (!doc.exists) {
        await firestore
          .collection(collection)
          .doc(leaderboard)
          .set({ createdOn: new Date() })
      }
      memoizedLeaderboardCollections.set(
        leaderboard,
        ref.collection('scores')
      )
      resolve(ref.collection('scores'))
    })
  })
}

// * this is for a one-time data transfer I made
// function migrate() {
//   console.log('Migrating!')
//   return new Promise(async (resolve) => {
//     await firestore
//       .collection('games')
//       .get()
//       .then((leaderboardSnapshot) => {
//         if (leaderboardSnapshot.empty) console.log('empty snapshot!')
//         leaderboardSnapshot.forEach(async (oldLeaderboardDoc) => {
//           const newLeaderboardRef = await getLeaderboardScoreCollection(
//             oldLeaderboardDoc.id
//           )
//           oldLeaderboardDoc.ref
//             .collection('scores')
//             .get()
//             .then(async (scoreSnapshot) => {
//               const toAdd = []
//               scoreSnapshot.forEach(async (oldScoreDoc) => {
//                 toAdd.push(oldScoreDoc.data())
//               })
//               for (let entry of toAdd) {
//                 const { name, score } = entry
//                 const existingScore = await newLeaderboardRef
//                   .where('name', '==', name)
//                   .get()
//                   .then((snapshot) => {
//                     const score =
//                       !snapshot.empty && snapshot.docs[0].data().score
//                     return score
//                   })
//                 if (!existingScore || existingScore > score) {
//                   console.log(
//                     name,
//                     score,
//                     'is better than',
//                     existingScore
//                   )
//                   await addScore({
//                     leaderboard: oldLeaderboardDoc.id,
//                     name,
//                     score,
//                     replace: true,
//                   })
//                 }
//               }
//             })
//         })
//       })
//   })
// }

// * this is for putting back data when I fuck up
// function migrate() {
//   firestore
//     .collection('leaderboards')
//     .doc('ludumDare46Level 1')
//     .get()
//     .then((snapshot) => {
//       snapshot.ref
//         .collection('scores')
//         .get()
//         .then((scoresSnapshot) => {
//           scoresSnapshot.forEach(async (doc) => {
//             const { name, score } = doc.data()
//             const c = await getLeaderboardScoreCollection(
//               'ludumDare46Level 1', 'games'
//             )
//             c.add({
//               name,
//               score,
//             })
//               .then(() => {
//                 console.log('added score', name, score)
//                 return true
//               })
//               .catch(handleError)
//           })
//         })
//     })
// }
