const fs = require('fs');
const http = require('http');
const formidable = require('formidable');

const mt = require('./../mime-types');
const hcp = require('./../http-code-page');
const fm = require('./../file-manager');
const te = require('./../template-engine');

const settings = require('./../../settings');

/**
 * Function to handle HTTP requests with GET method.
 * @param {http.ClientRequest} req - The request received.
 * @param {http.ServerResponse} res - The response used to answer the request.
 * @param {string} directory - A string containing the base direcotry where is located the folder www.
 * @param {object} routes - An object containing the basic routes.
 * @param {fm.StaticFiles[]} static - An array containing all the StaticFiles object.
 * @param {te.TemplateEngine} template - A TemplateEngine object containing all the created template.
 */
exports.GET = function GET(req, res, directory, routes, static, template) {
    let reqURL = new URL(req.url, `http://${settings.HOST}:${settings.PORT}`).pathname;
    let dirs = reqURL.split('/');
    dirs.shift();

    while (routes[dirs[0]] !== undefined) {
        routes = routes[dirs[0]];
        dirs.shift();
    }
    if (typeof(routes) === 'string') {
        let mime = mt.EXTTOMIME[routes.split('.').pop()];
        if (mime === undefined) {
            mime = 'application/octet-stream';
        }
        
        let page = template.page(routes, {});
        if (page !== null) {
            res.setHeader('Content-Type', mime);
            res.writeHead(200);
            res.end(page);
            return;
        }

        for (let folder of static) {
            let data = folder.get(routes);
            if (data !== null) {
                res.setHeader('Content-Type', mime);
                res.writeHead(200);
                res.end(data);
                return;
            }
        }

        fs.readFile(directory + '/www/web/' + routes, (err, data) => {
            if (err) {
                console.log(err);
                hcp.page({res: res, httpCode: 500, httpMsg: 'Internal Server Error', bodyMsg: 'An unexpected error occurred while sending a response.', style: ''});
                return;
            }

            res.setHeader('Content-Type', mime);
            res.writeHead(200);
            res.end(data);
        });
    }
    else if (typeof(routes) === 'function') {
        routes(req, res);
    }
    else {
        let mime = mt.EXTTOMIME[reqURL.split('.').pop()];
        if (mime === undefined) {
            mime = 'application/octet-stream';
        }

        let path = reqURL.split('/');
        let filename = path.pop();
        if (path[1] === 'static') {
            for (let folder of static) {
                let data = folder.get(filename);
                if (data !== null) {
                    res.setHeader('Content-Type', mime);
                    res.writeHead(200);
                    res.end(data);
                    return;
                }
            }
        }
        
        fs.readFile(directory + '/www/web' + reqURL, (err, data) => {
            if (err) {
                console.log(err);
                hcp.page({res: res, httpCode: 500, httpMsg: 'Internal Server Error', bodyMsg: 'An unexpected error occurred while sending a response.', style: ''});
                return;
            }
    
            res.setHeader('Content-Type', mime);
            res.writeHead(200);
            res.end(data);
        });
    }
}

/**
 * Function to handle HTTP requests with GET method.
 * @param {http.ClientRequest} req - The request received.
 * @param {http.ServerResponse} res - The response used to answer the request.
 * @param {string} directory - A string containing the base direcotry where is located the folder www.
 * @param {object} uploadPaths - An object containing the paths used to store the files uploaded based on their extension.
 */
exports.POST = function POST(req, res, directory, uploadPaths) {
    let reqURL = new URL(req.url, `http://${settings.HOST}:${settings.PORT}`).pathname;
    let mime = req.headers['content-type'].split(';')[0];

    if (reqURL === '/inbound') {
        if (mime === 'application/x-www-form-urlencoded') {
            let data = '';

            req.on('data', (chunk) => {
                data += chunk;

                // 1e7 == 10Mb
                if (data.length > 1e7) {
                    hcp.page({res: res, httpCode: 413, httpMsg: 'Request Entity Too Large', bodyMsg: 'Request Entity Too Large', style: ''});
                }
            });
            req.on('end', () => {
                hcp.page({res: res, httpCode: 200, httpMsg: 'Response', bodyMsg: 'File uploaded', style: ''});

                file = Buffer.concat(chunks);
                fs.writeFile('file.txt', file, () => {});
            });
        }
        else if (mime === 'multipart/form-data') {
            let form = new formidable.IncomingForm();
            form.parse(req, (err, fields, file) => {
                let filename = file.Image.path.split('\\').pop();
                let ext = file.Image.name.split('.').pop();
                let oldpath = file.Image.path;
                let newpath = directory + uploadPaths[ext] + filename + '.' + ext;
                
                fs.rename(oldpath, newpath, (err) => {
                    if (err) {
                        throw err;
                    }

                    hcp.page({res: res, httpCode: 200, httpMsg: 'Response', bodyMsg: 'File uploaded', style: ''});
                });
            });
        }
        else {
            hcp.page({res: res, httpCode: 403, httpMsg: 'Forbidden', style: ''});
        }
    }
    else {
        hcp.page({res: res, httpCode: 404, httpMsg: 'Resource Not Found', style: ''});
    }
}