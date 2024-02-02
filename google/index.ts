import env from "../env";
import data from "../data.json"
import { receivePlaylistItems } from "../videoMetadata";
import { listVideos } from "./youtube";
import { fetchSheet } from "./sheets";

// Swap these two lines to swap between real data fetched from Google, and cached copy
// TODO: Right now there's no automated way to store a new cached copy
// I just manually updated the output to be a stringified version of items instead of calling our own parser

window.addEventListener("DOMContentLoaded", tryToAuth)
// window.addEventListener("DOMContentLoaded", fakeData)


function fakeData() {
  receivePlaylistItems(data);
}

// This is called "auth", but successful auth triggers a YouTube API hit.
// This will need to be decoupled for sheets.
function tryToAuth() {
  console.log("beginning google auth")
  const CLIENT_ID = env.GOOGLE_CLIENT_ID;
  const API_KEY = env.GOOGLE_API_KEY;

  const DISCOVERY = ["https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest", "https://sheets.googleapis.com/$discovery/rest?version=v4"]
  const SCOPES = "https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/spreadsheets";

  // DefinitelyTyped is wrong, google.accounts.oauth2 exists :/
  const client = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    auto_select: true,
    callback: (response) => {
      console.log("callback")
      console.log(response)
      if (!(response && response.access_token) {
        console.error("No access token")
        return
      }
      // This stopped working when I added a second scope. This fn wants a splat, we have a space-delimited string.
      // I don't care enough to fix it.
      // if (!google.accounts.oauth2.hasGrantedAllScopes(response, ...(SCOPES.split('')))) {
      //   console.log("Failed scopes")
      //   return
      // }

      try {
      console.log("Loading client")
      gapi.load('client', {
        callback: function() {
          console.log("In callback", response.access_token, API_KEY, DISCOVERY)
        // Handle gapi.client initialization.
        gapi.client.setToken({ access_token: response.access_token })
        gapi.client.setApiKey(API_KEY);
        // gapi.client.load(DISCOVERY).then(fetchSheet)
        gapi.client.load(DISCOVERY[0]).then(listVideos)
        },
        onerror: function() {
        // Handle loading error.
          alert('gapi.client failed to load!');
        },
        timeout: 5000, // 5 seconds.
        ontimeout: function() {
          // Handle timeout.
          alert('gapi.client could not load in a timely manner!');
        }
        });
      } catch (e) {
        console.log("E: ", e.message, e.stack)
      }
        

      document.getElementById("content")!.innerText = "\nLogged in, initializing YouTube client..."
    },
  });
  client.requestAccessToken();
}