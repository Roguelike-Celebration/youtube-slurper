import { receivePlaylistItems } from "../videoMetadata";
import env from "../env";

const PLAYLIST_ID = env.PLAYLIST_ID
console.log("playolist id", PLAYLIST_ID)

export async function listVideos() {
  console.log("Listing videos")
  document.getElementById("content").innerText += "\nYouTube client configured";

  let items: YouTubePlaylistItem[] = [];
  try {
    items = await getVideoResults();
  } catch (err) {
    document.getElementById("content").innerText = err.message;
    return;
  }

  // WHERE WE SEND THE DATA OVER TO OUR OWN LOGIC
  // This could be abstracted to a more generalizable pattern. Shrug.
  console.log("Received items", items);
  receivePlaylistItems(items);
}

async function getVideoResults() {
  document.getElementById("content")!.innerText += "\nFetching results...";

  let items = [];
  let response = await fetchPage();
  items = items.concat(response.items);
  document.getElementById("content")!.innerText += "\nFetched first page...";
  while (response.nextPageToken) {
    response = await fetchPage(response.nextPageToken);
    document.getElementById("content")!.innerText +=
      "\nFetched additional page...";
    items = items.concat(response.items);
  }
  return items;
}

async function fetchPage(token: string | undefined = undefined) {
  const response = await gapi.client.youtube.playlistItems.list({
    part: ["contentDetails, id, snippet, status"],
    playlistId: PLAYLIST_ID,
    maxResults: 100,
    pageToken: token,
  });
  return response.result;
}

// This *should* exist somewhere in DefinitelyTyped...
export interface YouTubePlaylistItem {
  kind: string;
  etag: string;
  id: string;
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      // I don't know if this will ever change, but declaratively hardcoding this seems fine for now
      default?: YouTubeThumbnail;
      medium?: YouTubeThumbnail;
      high?: YouTubeThumbnail;
      standard?: YouTubeThumbnail;
      maxres?: YouTubeThumbnail;
    };
    channelTitle: string;
    playlistId: string;
    position: number;
    resourceId: {
      kind: string;
      videoId: string;
    };
    videoOwnerChannelTitle: string;
    videoOwnerChannelId: string;
  };
  contentDetails: {
    videoId: string;
    videoPublishedAt: string;
  };
  status: {
    privacyStatus: string;
  };
}

export interface YouTubeThumbnail {
  url: string;
  width: number;
  height: number;
}
