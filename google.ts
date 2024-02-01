import env from "./env";
import { receivePlaylistItems } from "./videoMetadata";
import data from "./data.json"

// Swap these two lines to swap between real data fetched from Google, and cached copy
// TODO: Right now there's no automated way to store a new cached copy
// I just manually updated the output to be a stringified version of items instead of calling our own parser

// window.addEventListener("DOMContentLoaded", tryToAuth)
window.addEventListener("DOMContentLoaded", fakeData)


function fakeData() {
  receivePlaylistItems(data);
}

function tryToAuth() {
  // console.log("tryToAuth", gapiReady, gsiReady, domReady) 
  // if (!(gapiReady && gsiReady && domReady)) return
  console.log("in dogoogleuathstuff")
  const CLIENT_ID = env.GOOGLE_CLIENT_ID;
  const API_KEY = env.GOOGLE_API_KEY;
  const DISCOVERY = "https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest";
  const SCOPE = "https://www.googleapis.com/auth/youtube.readonly";

  // DefinitelyTyped is wrong, google.accounts.oauth2 exists :/
  const client = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPE,
    auto_select: true,
    callback: (response) => {
      console.log("callback")
      console.log(response)
      if (!(response && response.access_token) {
        console.error("No access token")
        return
      }
      if (!google.accounts.oauth2.hasGrantedAllScopes(response, SCOPE)) {
        return
      }

      gapi.load('client', {
        callback: function() {
        // Handle gapi.client initialization.
        gapi.client.setToken({ access_token: response.access_token })
        gapi.client.setApiKey(API_KEY);
        gapi.client.load(DISCOVERY).then(listVideos)
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
        

      document.getElementById("content").innerText = "\nLogged in, initializing YouTube client..."
    },
  });
  client.requestAccessToken();
  
  async function listVideos() {
    document.getElementById("content").innerText += "\nYouTube client configured";

    let items: YouTubePlaylistItem[] = []
    try {
      items = await getVideoResults();
    } catch (err) {
      document.getElementById("content").innerText = err.message;
      return;
    }

    // WHERE WE SEND THE DATA OVER TO OUR OWN LOGIC
    // This could be abstracted to a more generalizable pattern. Shrug.
    console.log("Received items", items)
    receivePlaylistItems(items);
  }

  async function getVideoResults() {
    document.getElementById("content").innerText += "\nFetching results...";

    let items = []
    let response = await fetchPage()
    items = items.concat(response.items)
    document.getElementById("content").innerText += "\nFetched first page...";
    while (response.nextPageToken) {
      response = await fetchPage(response.nextPageToken)
      document.getElementById("content").innerText += "\nFetched additional page...";
      items = items.concat(response.items)
    }
    return items
  }

  async function fetchPage(token: string | undefined = undefined){
    const response = await gapi.client.youtube.playlistItems.list({
      "part": [
        "contentDetails, id, snippet, status"
      ],
      "playlistId": "UUKv_QzXft4mD6TXmQBZtzIA",
      "maxResults": 100,
      "pageToken": token
    })
    return response.result
  }
}

// This *should* exist somewhere in DefinitelyTyped...
export interface YouTubePlaylistItem {
  kind: string
  etag: string
  id: string
  snippet: {
    publishedAt: string
    channelId: string,
    title: string,
    description: string,
    thumbnails: {
      // I don't know if this will ever change, but declaratively hardcoding this seems fine for now
      default?: YouTubeThumbnail,
      medium?: YouTubeThumbnail,
      high?: YouTubeThumbnail,
      standard?: YouTubeThumbnail,
      maxres?: YouTubeThumbnail
    },
    channelTitle: string,
    playlistId: string,
    position: number,
    resourceId: {
      kind: string,
      videoId: string
    },
    videoOwnerChannelTitle: string,
    videoOwnerChannelId: string
  },
  contentDetails: {
    videoId: string,
    videoPublishedAt: string
  },
  status: {
    privacyStatus: string
  }
}

export interface YouTubeThumbnail {
  url: string
  width: number
  height: number
}