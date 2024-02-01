import env from "./env";
import { receiveItems } from "./videoMetadata";

let gapiReady = false
let gsiReady = false
let domReady = false;

(window as any).gapiLoaded = () => {
  console.log("gapiLoaded")
  gapiReady = true
  // tryToAuth()
}

(window as any).gsiLoaded = () => {
  console.log("gsiLoaded")
  gsiReady = true
  // tryToAuth()
}

window.addEventListener("DOMContentLoaded", () => {
  domReady = true
  tryToAuth()
})

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

      // We have a valid user with read access to YouTube!
      // var xhr = new XMLHttpRequest();
      // xhr.open('GET', 'https://www.googleapis.com/calendar/v3/calendars/primary/events');
      // xhr.setRequestHeader('Authorization', 'Bearer ' + tokenResponse.access_token);
      // xhr.send();

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
        

      console.log("tried to load client")
    },
  });
  client.requestAccessToken();
  
  async function listVideos() {
    let items: YouTubePlaylistItem[] = []
    try {
      items = await getVideoResults();
    } catch (err) {
      document.getElementById("content").innerText = err.message;
      return;
    }
    document.getElementById("content").innerText = `${items.length} videos found:\n${JSON.stringify(items, null, 2)}`;

    // WHERE WE SEND THE DATA OVER TO OUR OWN LOGIC
    // This could be abstracted to a more generalizable pattern. Shrug.
    receiveItems(items);
  }

  async function getVideoResults() {
    let items = []
    let response = await fetchPage()
    items = items.concat(response.items)
    while (response.nextPageToken) {
      response = await fetchPage(response.nextPageToken)
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


  // document.getElementById("signout_button")?.addEventListener("click", handleSignoutClick);
}

// This *should* exist somewhere in DefinitelyTyped...
export interface YouTubePlaylistItem {
  kind: string
  etag: string
  id: string
  snippet: {
    publishedAt: Date
    channelId: string,
    title: string,
    description: string,
    thumbnails: {
      // I don't know if this will ever change, but declaratively hardcoding this seems fine for now
      default: YouTubeThumbnail,
      medium: YouTubeThumbnail,
      high: YouTubeThumbnail,
      standard: YouTubeThumbnail,
      maxres: YouTubeThumbnail
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
    publishedAt: Date
  },
  status: {
    privacyStatus: string
  }
}

interface YouTubeThumbnail {
  url: string
  width: number
  height: number
}