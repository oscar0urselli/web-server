const dotenv = require('dotenv');

dotenv.config();

exports.HOST = process.env.HOST;
exports.PORT = process.env.PORT;
exports.SITENAME = process.env.SITENAME;

/**
 * Configuration used to access the MySQL databases.
 * Zero, one or more databases are allowed to be used.
 * For each database a connection will be instanced.
 */
exports.MySQLConfig = [
    /*{
        host: process.env.DB1_HOST,
        user: process.env.DB1_USER,
        password: process.env.DB1_PASSWORD,
        database: process.env.DB1_NAME
    },*/
];

/**
 * Paths used to store each corrisponding file extension.
 * If an extension is not present in this object, it won't be stored.
 */
exports.UploadPaths = {
    jpg: '/upload/media/',
    png: '/upload/media/',
    jpeg: '/upload/media/',
    gif: '/upload/media/',
    mp4: '/upload/media/',
    json: '/upload/docs/',
    txt: '/upload/docs/',
    html: '/upload/docs/',
    xml: '/upload/docs/',
    csv: '/upload/docs/',
};

/**
 * Connect varius URL to a specified response.
 * The response can be HTML or any other type of allowed files format. Is permitted the incapsulation of objects inside other object.
 * If needed is possible to put a function instead of a file, so when the URL is requested the function will be executed.
 * The function must accept TWO parameters, req and res and will RETURN VOID. The response will be send from inside the function.
 */
exports.ROUTES = {
    'homepage': 'main.html',
    '': 'main.html',
    'ciao': 'ciao.html'
    // other sections
};