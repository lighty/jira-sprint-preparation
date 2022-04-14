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
  console.log(`create ${createdSprint.name}`)
  const futureSprints = fetchFutureSprints();
  futureSprints.reverse().slice(1).forEach(futureSprint => {
    const response = swap(createdSprint, futureSprint);
    if (response.getResponseCode() === 204) {
      console.log(`swap ${createdSprint.name} to ${futureSprint.name}`);
    }
  });
}

const nextSprintTerm = (): string => {
  const now = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(now.getDate() + 7);

  const from = `${now.getFullYear()}/${now.getMonth()+1}/${now.getDate()+1}`
  const to = `${nextWeek.getFullYear()}/${nextWeek.getMonth()+1}/${nextWeek.getDate()}`
  return `${from} - ${to}`;
}

const swap = (from: Sprint, to: Sprint): GoogleAppsScript.URL_Fetch.HTTPResponse => {
  const url = `https://${domain}/rest/agile/1.0/sprint/${from.id}/swap`;
  const data = { sprintToSwapWith: to.id }
  const response = post(url, data);
  return response;
};

const createSprint = (): Sprint => {
  const url = `https://${domain}/rest/agile/1.0/sprint/`;
  const data = { originBoardId, 'name': nextSprintTerm() }
  const response = post(url, data);
  const responseJson: Sprint = JSON.parse(response.getContentText());
  return responseJson;
};

const post = (url: string, data: {}) => {
  const headers = {
    'Authorization' : "Basic " + Utilities.base64Encode(`${username}:${accessToken}`),
    'Content-Type' : 'application/json',
  }
  const options = {
    headers,
    'method': 'post' as GoogleAppsScript.URL_Fetch.HttpMethod,
    'payload': JSON.stringify(data),
  }
  return UrlFetchApp.fetch(url, options);
}

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
