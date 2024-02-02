import env from '../env'

const SPREADSHEET_ID = env.SPREADSHEET_ID
const SHEET_ID = env.SHEET_ID

export async function fetchSheet() {
  const response = await gapi.client.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
    includeGridData: true
  })
  console.log(response);

}
