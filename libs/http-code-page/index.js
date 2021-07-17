/**
 * Given the HTTP status code it will create an HTML poge representing that code.
 * @param {object} params - An object containing the following properties:
 * @property {http.ServerResponse} res - The response used to answer the request.
 * @property {number} httpCode - An integer representing an HTTP status code.
 * @property {string} httpMsg - A string containing the name of the HTTP status code.
 * @property {string} bodyMsg - A string containing a message to put in the body of the HTML page.
 * @property {string} rgbBg - A string containing an HTML color in HEX value.
 * @property {string} style - A string containing a URL used to access a CSS file (if any).
 */
exports.page = function page(params) {
    if (params.httpCode === undefined || typeof(params.httpCode) !== 'number') {
        throw 'Property Not Found: The property "httpCode" must be present in the object.';
    }
    
    let rgbDefaultBg = {
        100: '16D9AE',
        200: '17E328',
        300: '0D10D4',
        400: 'D11D1D',
        500: '9D2CD1'
    };

    if (params.rgbBg === undefined || params.rgbBg === '') {
        let codeSeries = ((params.httpCode / 100) >> 0) * 100;
        params.rgbBg = rgbDefaultBg[codeSeries];
    }

    let resPage = `<!DOCTYPE html><html lang="en"><head>` +
    `<title>Oscar's Web Server | ${params.httpCode} ${params.httpMsg}</title>` +
    `<link rel="stylesheet" href="${params.style}"></head>` +
    `<body style="background-color: #${params.rgbBg};">` +
    `<div class="center" style="color: white;"><h1>${params.httpCode}!</h1>` +
    `<p>${params.bodyMsg}</p></div></body></html>`;

    params.res.writeHead(params.httpCode, {'Content-Type': 'text/html', });
    params.res.end(resPage);
}