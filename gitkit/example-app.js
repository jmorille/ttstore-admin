var express = require('express'), app = module.exports = express();
var cookieParser = require('cookie-parser');
app.use(cookieParser());
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var fs = require('fs');
var GitkitClient = require('gitkitclient');
var gitkitClient = new GitkitClient(JSON.parse(fs.readFileSync('./gitkit-server-config.json')));

// index page
app.get('/', renderIndexPage);

// widget page hosting Gitkit javascript
app.get('/gitkit', renderGitkitWidgetPage);
app.post('/gitkit', renderGitkitWidgetPage);

// Ajax endpoint to send email for password-recovery and email change event
app.post('/sendemail', renderSendEmailPage);

function renderGitkitWidgetPage(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  var html = new Buffer(fs.readFileSync('./gitkit-widget.html')).toString();
  html = html.replace('%%postBody%%', encodeURIComponent(req.body || ''));
  res.end(html);
}

function renderIndexPage(req, res) {
  if (req.cookies.gtoken) {
    gitkitClient.verifyGitkitToken(req.cookies.gtoken, function (err, resp) {
      if (err) {
        printLoginInfo(res, 'Invalid token: ' + err);
      } else {
        printLoginInfo(res, 'Welcome back! Login token is: ' + JSON.stringify(resp));
      }
    });
  } else {
    printLoginInfo(res, 'You are not logged in yet.');
  }
}

function renderSendEmailPage(req, res) {
  app.disable('etag');
  gitkitClient.getOobResult(req.body, req.ip, req.cookies.gtoken, function(err, resp) {
    if (err) {
      console.log('Error: ' + JSON.stringify(err));
    } else {
      console.log('Send email: ' + JSON.stringify(resp));
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.end(resp.responseBody);
  })
}

function printLoginInfo(res, loginInfo) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  var html = new Buffer(fs.readFileSync('./index.html'))
    .toString()
    .replace('%%loginInfo%%', loginInfo);
  res.end(html);
}

var port = 8000;
app.listen(port);
console.log('Server running at http://127.0.0.1:%d/', port);
