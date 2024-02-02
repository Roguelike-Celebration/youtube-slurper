import { appendToSheet, fetchSheet, videoToRow } from "./google/sheets";
import { YouTubeThumbnail, listVideos } from "./google/youtube";

export interface Video {
  title: string
  author: string
  year: number
  description: string
  videoId: string
  url: string
  thumbnails: {[type: string]: YouTubeThumbnail}
}

// This assumes Google has already been authed
// It results in Google API calls. This is not offline-safe.
export async function processEverything() {
  const videos = await listVideos()
  if (!videos) return
  const [_, headerMapping] = await fetchSheet()
  const sheetData = await appendToSheet(videos)
  document.getElementById("content")!.innerText = JSON.stringify(sheetData, null, 2)
}