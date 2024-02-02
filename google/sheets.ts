import env from "../env";
import { Video } from "../videoMetadata";

import _ from 'lodash';

const SPREADSHEET_ID = env.SPREADSHEET_ID;
const SHEET_ID = env.SHEET_ID;

const DISCOVERY = "https://sheets.googleapis.com/$discovery/rest?version=v4";

let sheetsInitialized = false;
let headerMapping: string[] = [];

export async function fetchSheet(): [Video[], string[]] {
  await gapi.client.load(DISCOVERY);
  sheetsInitialized = true;

  const response = await gapi.client.sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
    includeGridData: true,
  });
  const data = response.result.sheets[0].data[0].rowData;
  console.log(data);

  return rowsToVideos(data);
}

export async function appendToSheet(data: Video[]) {
  if (!sheetsInitialized) {
    alert("ERROR: Fetch sheet data before appending");
    return;
  }

  const rows = videosToRows(data, headerMapping);
  console.log(rows)

  await gapi.client.sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requests: [{
      appendCells: {
        sheetId: SHEET_ID,
        rows: rows,
        fields: "userEnteredValue",
      }
  }]
  }
  );

  return rows;
}

type BoxedString = { stringValue: string };
interface CellData {
  userEnteredValue: BoxedString;
  effectiveValue: BoxedString;
  formattedValue: string;
  userEnteredFormat: any;
  effectiveFormat: any;
}

interface RowData {
  values: CellData[];
}

// Returns a tuple of (all video data, header row mapping)
function rowsToVideos(rowList: RowData[]): [Video[], string[]] {
  const [header, ...rows] = rowList;

  headerMapping = [];
  header.values.forEach((cell: any, i: number) => {
    headerMapping[i] = cell.formattedValue;
  });
  console.log(headerMapping);

  const newRows = rows.map((r) => {
    const row = r.values;
    const video: any = {};
    row.forEach((cell: any, i: number) => {
      video[headerMapping[i]] = cell.formattedValue;
    });
    return video;
  });
  return [newRows, headerMapping];
}

export function videosToRows(
  videos: Video[],
  keyMapping: string[]
): Partial<RowData>[] {
  return videos.map((video) => videoToRow(video, keyMapping));
}

export function videoToRow(
  video: Video,
  keyMapping: string[]
): Partial<RowData> {
  const row: Partial<RowData> = { values: [] };
  for (const key of keyMapping) {
    let val = video[key]
    if (!_.isString(val)) {
      val = JSON.stringify(val)
    }
    row.values!.push({ 
      userEnteredValue: { stringValue: val },
      userEnteredFormat: { wrapStrategy: "WRAP"});
  }
  return row;
}
