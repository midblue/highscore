# High Score API

> Created for use in [my team's Ludum Dare 46 project](https://ldjam.com/events/ludum-dare/46/final-flower-petals-of-a-lost-age), this is a dead-simple API for globally displaying and adding high scores in your game.

Made to be run as a Heroku instance, this app uses Firebase (Firestore) and an Express server to expose a few simple endpoints to be queried from anywhere!

## Endpoints

- Add a score: `GET [heroku URL]/[uniqueLeaderboardId]/add/[username]/[score]/[replace?]/[lowerIsBetter?]`
- List scores: `GET [heroku URL]/[uniqueLeaderboardId]/[topOrBottom]/[count]/`

### Notes:
- `uniqueLeaderboardId` can be any string. This means that you can set up multiple leaderboards on the same server — i.e. 'level1', 'level2', etc.
- `score`s can be any integer or float.
- `replace` is optional, and can be set to `true` or `false`. It defaults to `true`. If set to `false`, it will allow adding multiple scores by the same name.
- `lowerIsBetter` is optional, and defaults to `true`. This defines the replace criteria for scores, whether it should keep the lower score or the higher one.
- `topOrBottom` is either 'top' or 'bottom' depending on whether you want the lowest or the highest scores.
- `count` must be an integer.
- Scores will be returned in `name,score` CSV format, delineated by `\n` line breaks.

## Setup

1. Rename the file called `.env_example` in the project root to `.env`.
1. Set up a new [Firebase](https://firebase.google.com/) project, initialize the Firestore DB from the console, and download your credentials JSON file from Settings / Service Accounts / Create Service Account.
1. From that file, copy the appropriate values into your `.env`. For `FIREBASE_PRIVATE_KEY`,  yes, you really need all the silly `---BEGIN PRIVATE KEY---\n` type stuff.
1. Install the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
1. You're ready to go!
```bash
npm install
npm run dev
```

From there, you can query your local server and confirm that everything is running as intended.  
Getting it running on Heroku is easy and free, check [this link](https://devcenter.heroku.com/articles/deploying-nodejs) for guidance.

Have fun!


## Example Unity Usage

```c#
using UnityEngine.Networking;

...

IEnumerator GetHighScores()
{
	string url = baseURL + leaderboardName + "/bottom/" + scoreCount.ToString() + '/';
	using (UnityWebRequest webRequest = UnityWebRequest.Get(url))
	{
		yield return webRequest.SendWebRequest();

		if (webRequest.isNetworkError)
		{
			Debug.Log("Network Error: " + webRequest.error);
		}
		else if (webRequest.downloadHandler.text.Substring(0, 1) == "<" || webRequest.downloadHandler.text == "Forbidden")
		{
			Debug.Log("Request Failed: " + webRequest.downloadHandler.text);
		}
		else if (webRequest.downloadHandler.text == "Internal Server Error")
		{
			Debug.Log("No high scores at this endpoint yet.");
		}
		else
		{
			Debug.Log("Received high scores: " + webRequest.downloadHandler.text);
    }
  }
}
```
