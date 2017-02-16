



/*
tested javascript Remote Console functions

function SessionCommand(url, sessionID, Command) {
  var target = url + '/SessionCommand/';
  console.log('Executing ' + Command + ' at ' + target);
  return urllib.request(
    target,
    {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token
      },
      data: {
        ID: sessionID,
        COMMAND: Command
      }
    }
  );
}

function readResponses(url, sessionID) {
  var target = url + '/ReadResponses/' + sessionID + '/';
  console.log('Reading at ' + target);
  return urllib.request(
    target,
    {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token
      },
      data: {
        ID: sessionID
      },
      timeout: 120000  // make this slow.  restConsole takes its sweet time responding
    }
  ).then((body) => { return body.data.toString(); })
}

function openRest(url, token) {
  var target = url + '/StartSession/';
  console.log('Opening session at ' + target);
  return urllib.request(
    target,
    {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token
      }
    }
  ).then((body) => {
    switch (body.status) {
      case 404:
        console.log('Endpoint Not Found');
        break;
      case 401:
        console.log('Access Forbidden');
        break;
      case 200:
        console.log('Token Accepted');
        var xml = body.data.toString();
        var opener = xml.indexOf('SessionID');
        var closer = xml.indexOf('SessionID', opener + 1);
        var sessionID = xml.substring(opener + 10, closer - 2)
        return sessionID;
        break;
      default:
        console.log(body);
    }
  }).catch((err) => {
    console.log(err.message);
  })
}

//getHalcyonToken().then(function (token) {
//  console.log('halToken: ' + token)
//  openRest(token);
//});

var token = getMGMToken();
var url = "http://10.10.0.108:9100";
var sessionID = '';
console.log('mgmtoken: ' + token)
openRest(url, token).then(function (id) {
  sessionID = id;
  return readResponses(url, sessionID);
}).then((body) => {
  //ignore this body, it will be the logs up till now
  return SessionCommand(url, sessionID, 'help');
}).then((body) => {
  // body is the result of the command.  Assume it worked and read again
  return readResponses(url, sessionID);
}).then((body) => {
  console.log(body);
})
*/