const fs = require('fs');

/** 
 * Class for managing the use of HTML template files. 
 * In order to work properly put the content files and the base in two different directory.
 * For further reading in how to set up correctly the HTML files check: https://github.com/oscar0urselli/template-engine/blob/master/README.md
 * @property {string} baseFilePath - A string containing the directory where the base files are stored.
 * @property {string} cntFilePath - A string containing the directory where the content files are stored.
 * @property {Map} pages - A Map containing the final HTML files without putting the value of the variables. The map is organaized with (key) {string} fileName => (value) {string} page.
 */
exports.TemplateEngine = class TemplateEngine {
    #baseFilePath;
    #cntFilePath;
    #pages;

    /** 
     * An object containing:
     * @property {string} baseFilePath - A string containing the directory where the base files are stored.
     * @property {string} cntFilePath - A string containing the directory where the content files are stored.
     * 
     * In the form (key): (value).
     */
    constructor(params) {
        this.#baseFilePath = '';
        this.#cntFilePath = '';

        this.setBaseFilePath(params['baseFilePath']);
        this.setCntFilePath(params['cntFilePath']);
        
        this.#pages = new Map();
        this.setPages();
    }

    //#region get
    /**
     * @returns {string} The path used to read the base files.
     */
    getBaseFilePath() {
        return this.#baseFilePath;
    }
    /**
     * @returns {string} The path used to read the content files.
     */
    getCntFilePath() {
        return this.#cntFilePath;
    }
    /**
     * @returns {Map} A Map containing all the HTML page constructed in the form: (key) {string} pageName => (value) {string} page.
     */
    getPages() {
        return this.#pages;
    }
    //#endregion

    //#region set
    /** 
     * Function for assigning a new value to baseFilePath.
     * @param {string} path - A string containing the directory to use assign at baseFilePath.
     * @returns {void | ErrorEvent} Nothing or raise an error if somthing went wrong.
     */
    setBaseFilePath(path) {
        this.#baseFilePath = this.#setFilePath(path, 'base');
    }
    /**
     * Function for assigning a new value to cntFilePath.
     * @param {string} path - A string containing the directory to use assign at cntFilePath.
     * @returns {void | ErrorEvent} Nothing or raise an error if somthing went wrong.
    */
    setCntFilePath(path) {
        this.#cntFilePath = this.#setFilePath(path, 'content');
    }
    /** 
     * Read all the content files and load the contents temporarly in memory.
     * Then while reading all the base file it will generate page without inserting the variables. 
     */
    setPages() {
        let startCNTRegEx = /{ *% *START +[a-zA-Z_]+[a-zA-Z0-9_]* *% *}/; // {% START cntName %}
        let endCNTRegEx = /{ *% *END +[a-zA-Z_]+[a-zA-Z0-9_]* *% *}/; // {% END cntName %}
        let putCNTRegEx = /{ *% *PUT +[a-zA-Z_]+[a-zA-Z0-9_]* *% *}/; // {% PUT cntName %}
        let contents = {};

        // For every HTML file in the folder:
        this.#listFiles(this.#cntFilePath).forEach(fileName => {
            contents[fileName] = {};
            let cntStart = false;
            let data = '';
            let cntName = null;
            let thereIsCNT = false;
            
            // Synchronously reads the file line by line
            let file = fs.readFileSync(this.#cntFilePath + fileName, {encoding: 'utf8', flag: 'r'});
            file.split('\n').forEach(line => {
                // Use RegEx to find the correct syntax
                if (startCNTRegEx.test(line)) {
                    cntStart = true;
                    line.split('%')[1].split(' ').forEach(sub => {
                        if (sub !== 'START' && sub !== '') {
                            cntName = sub;
                        }
                    });
                    thereIsCNT = true;
                }
                else if (cntStart && endCNTRegEx.test(line)) {
                    cntStart = false;
                    line.split('%')[1].split(' ').forEach(sub => {
                        if (sub !== 'END' && sub !== '') {
                            if (sub !== cntName) {
                                throw `in ${this.#cntFilePath + fileName}\nSyntax Error: Content name used in the start block is different from that in the end.`;
                            }
                        }
                    });

                    cntStart = false;
                    contents[fileName][cntName] = data;
                    
                    data = '';
                }
                else if (!cntStart && endCNTRegEx.test(line)) {
                    throw `in ${this.#cntFilePath + fileName}\nSyntax Error: Used end of content but can't find the start.`;
                }
                else if (cntStart) {
                    data += line + '\n';
                }
            });

            if (cntStart) {
                throw `in ${this.#cntFilePath + fileName}\nSyntax Error: Started content but never ended.`;
            }

            // If no content was declared load the file as is
            if (!thereIsCNT) {
                this.#pages.set(fileName, file);
            }
        });

        // Load base files and create the pages
        this.#listFiles(this.#baseFilePath).forEach(fileName => {
            let file = fs.readFileSync(this.#baseFilePath + fileName, {encoding: 'utf8', flag: 'r'}).split('\n');
            
            for (let [key, value] of Object.entries(contents)) {
                if (Object.values(value) != '') {
                    let data = '';
                    file.forEach(line => {
                        if (putCNTRegEx.test(line)) {
                            let exec = putCNTRegEx.exec(line);
                            let cntName = undefined;
                            exec[0].split('%')[1].split(' ').forEach(sub => {
                                if (sub !== 'PUT' && sub !== '') {
                                    cntName = sub;
                                }
                            });
                            
                            if (value[cntName] === undefined) {
                                throw `in ${this.#baseFilePath + fileName}\nSyntax Error: no content named ${cntName} found in ${__dirname + key}`;
                            }

                            let splitted = exec['input'].split(exec[0]);
                            data += splitted[0] + value[cntName] + splitted[1] + '\n';
                        }
                        else {
                            data += line + '\n';
                        }
                    });

                    this.#pages.set(key, data);
                }
            }
        });
    }
    //#endregion

    /**
     * Function for checking if a path is correct.
     * @param {string} path - A string containing the directory to use.
     * @param {string} typePath - A string telling whenever the path is for baseFilePath or cntFilePath.
     * @returns {string | ErrorEvent} A string containing the directory after performing some checks or raise an error if some issues found.
    */
    #setFilePath(path, typePath) {
        if (fs.existsSync(path)) {
            if (path.slice(-1) !== '/') {
                path += '/';
            }

            let isEqual = false;
            switch (typePath) {
                case 'base':
                    if (this.#cntFilePath === path) {
                        isEqual = true;
                    }
                    break;
                case 'content':
                    if (this.#baseFilePath === path) {
                        isEqual = true;
                    }
                    break;
                default:
                    if (isEqual) {
                        throw 'Path Collision: cntFilePath and baseFilePath are identical. Change one of them.';
                    }
                    break;
            }
        }
        else {
            throw `Directory Not Found: ${path} was not found.`;
        }

        return path;
    } 

    /** 
     * List each HTML files inside the specified directory. 
     * @param {string} dir - A string containing the direcotry to list.
     * @returns {string[]}  An array of strings containig the list of all HTML files found.
     */
    #listFiles(dir) {
        let files = [];

        fs.readdirSync(dir).forEach(file => {
            let extension = file.split('.')[1];
            
            if (extension === 'html' || extension === 'htm') {
                files.push(file);
            }
        });

        return files;
    }

    /** 
     * Fill the basic page created with setPages using the variables passed and create a finished HTML page.
     * @param {string} pageName - A string containing the name of the HTML file to use already loaded in the property pages.
     * @param {object} vars - An object containing the value to put every time a variable call is used.
     * @returns {string | null}  A string containing the created page ready to be used, or null if the name passed is invalid.
     */
    page(pageName, vars) {
        let varRegEx = /{{ *[a-zA-Z_]+[a-zA-Z0-9_]* *}}/; // {{ varName }}
        let varNameRegEx = /[a-zA-Z_]+[a-zA-Z0-9_]*/; // varName

        if (this.#pages.has(pageName)) {
            let page = '';
            let buffer = '';
            let struct = this.#pages.get(pageName);
            for (let i = 0; i < struct.length; i++) {
                if (varRegEx.test(buffer)) {
                    let parsedBuffer = varRegEx.exec(buffer);
                    let varName = varNameRegEx.exec(parsedBuffer)['0'];

                    if (!vars.hasOwnProperty(varName)) {
                        page += buffer;
                    }
                    else {
                        page += buffer.slice(0, -parsedBuffer['0'].length) + vars[varName].toString();
                    }

                    buffer = '';
                }
                buffer += struct[i];
            }

            page += buffer;
            return page;
        }
        else {
            return null;
        }
    }
}