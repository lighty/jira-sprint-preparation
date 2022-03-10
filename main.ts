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
  const createdSprint = createSprint();
  const futureSprints = fetchFutureSprints();
}

const nextSprintTerm = (): string => {
  const now = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(now.getDate() + 7);

  const from = `${now.getMonth()+1}/${now.getDate()}`
  const to = `${nextWeek.getMonth()+1}/${nextWeek.getDate()}`
  return `${from} - ${to}`;
}

const createSprint = (): Sprint => {
  const url = `https://${domain}/rest/agile/1.0/sprint/`;
  const headers = {
    'Authorization' : "Basic " + Utilities.base64Encode(`${username}:${accessToken}`),
    'Content-Type' : 'application/json',
  }
  const data = { originBoardId, 'name': nextSprintTerm() }
  const options = {
    headers,
    'method': 'post' as GoogleAppsScript.URL_Fetch.HttpMethod,
    'payload': JSON.stringify(data),
  }
  const response = UrlFetchApp.fetch(url, options);
  const responseJson: Sprint = JSON.parse(response.getContentText());
  return responseJson;

};

const fetchFutureSprints = (): Sprint[] => {
  const url = `https://${domain}/rest/agile/1.0/board/${originBoardId}/sprint/?state=future`;
  const headers = {
    'Authorization' : "Basic " + Utilities.base64Encode(`${username}:${accessToken}`),
    'Content-Type' : 'application/json',
  }
  const options = { headers }
  const response = UrlFetchApp.fetch(url, options);
  const responseJson: SprintResponse = JSON.parse(response.getContentText());
  return responseJson.values;
};