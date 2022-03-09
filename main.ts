const domain = PropertiesService.getScriptProperties().getProperty('DOMAIN');
const accessToken = PropertiesService.getScriptProperties().getProperty('ACCESS_TOKEN');
const username = PropertiesService.getScriptProperties().getProperty('USERNAME');
const originBoardId = PropertiesService.getScriptProperties().getProperty("ORIGIN_BOARD_ID");

interface Sprint {
  id: number
  name: string
}

interface SprintResponse {
  values: Sprint[]
}

const execute = () => {
  const futureSprints = fetchFutureSprints();
}

const fetchFutureSprints = (): Sprint[] => {
  const url = `https://${domain}/rest/agile/1.0/board/${originBoardId}/sprint/?state=future`;
  const headers = {
    'Authorization' : "Basic " + Utilities.base64Encode(`${username}:${accessToken}`)
  }
  const options = { headers }
  const response = UrlFetchApp.fetch(url, options);
  const responseJson: SprintResponse = JSON.parse(response.getContentText());
  return responseJson.values;
};