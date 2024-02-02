import { YouTubePlaylistItem, YouTubeThumbnail } from "./google/youtube";

interface Video {
  title: string
  author: string
  year: number
  description: string
  videoId: string
  thumbnails: {[type: string]: YouTubeThumbnail}
}

function transformPlaylistItems(items: YouTubePlaylistItem[]): Video[] {
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
      }
    })
}

export function receivePlaylistItems(playlistItems: YouTubePlaylistItem[]) {
  const items = transformPlaylistItems(playlistItems)
  document.getElementById("content")!.innerText = `${items.length} videos found:\n${JSON.stringify(items, null, 2)}`;

}