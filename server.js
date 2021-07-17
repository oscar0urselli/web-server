const http = require('http');
const settings = require('./settings');

const dbm = require('./libs/db-manager');
const te = require('./libs/template-engine');
const fm = require('./libs/file-manager');
const hmm = require('./libs/http-methods-manager');
const hcp = require('./libs/http-code-page');


let static = [
    new fm.StaticFiles(__dirname + '/www/web/static/media', []),                // media
    new fm.StaticFiles(__dirname + '/www/web/static/docs', []),                 // docs
    new fm.StaticFiles(__dirname + '/www/web/static/html', ['htm', 'html']),    // html
    new fm.StaticFiles(__dirname + '/www/web/static/scripts', []),              // scripts
    new fm.StaticFiles(__dirname + '/www/web/static/style', [])                 // style
];

let template = new te.TemplateEngine({
    baseFilePath: __dirname + '/www/web/static/html/template/base',
    cntFilePath: __dirname + '/www/web/static/html/template/content'
});

/**
 * Map of all the MySQL databases connected.
 * 
 * databaseName (key) => databaseConnection (value)
 */
let MySQLDataBases = new Map();
settings.MySQLConfig.forEach(config => {
    MySQLDataBases.set(config.database, new dbm.MySQL_DB(config));
});

const requestListener = function (req, res) {
    let method = req.method;
    let url = req.url;

    console.log(url, method);

    if (method === 'GET') {
        hmm.GET(req, res, settings.ROUTES, static, template);
    }
    else if (method === 'POST') {
        hmm.POST(req, res, settings.UploadPaths);
    }
    else {
        hcp.page({res: res, httpCode: 400, httpMsg: 'Bad Request', bodyMsg: 'The request method is invalid.', style: ''});
    }
}

const server = http.createServer(requestListener);
server.listen(settings.PORT || 8000, () => {
    console.log(`Server is running on port = ${settings.PORT}`);
});