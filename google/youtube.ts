import { Video, receivePlaylistItems } from "../videoMetadata";
import env from "../env";

const PLAYLIST_ID = env.PLAYLIST_ID
const DISCOVERY = "https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest"

export async function listVideos() {
  await gapi.client.load(DISCOVERY)

  console.log("Listing videos")
  document.getElementById("content")!.innerText += "\nYouTube client configured";

  let items: YouTubePlaylistItem[] = [];
  try {
    items = await getVideoResults();
  } catch (err) {
    document.getElementById("content")!.innerText = err.message;
    return;
  }

  console.log("Received items", items);
  return playlistItemsToVideos(items)
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

function playlistItemsToVideos(items: YouTubePlaylistItem[]): Video[] {
  return items
    .filter(i => i.status.privacyStatus === "public")
    .map(i => {
      const [author, title, _] = i.snippet.title.split(/ - (.*)/s)
      if (i.status.privacyStatus !== "public") {[
        console.log("NOT PUBLIC", i)
      ]}
      return {
        author,
        title,
        year: new Date(i.contentDetails.videoPublishedAt).getFullYear(),
        description: i.snippet.description,
        videoId: i.contentDetails.videoId,
        thumbnails: i.snippet.thumbnails,
        url: `https://www.youtube.com/watch?v=${i.contentDetails.videoId}`
      }
    })
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
