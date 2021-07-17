const fs = require('fs');

/** 
 * Class for working with static files.
 * @property {string} directory - A path to the static files folder.
 * @property {string[]} extensions - An array of strings containing all the allowed or disallowed types of file. If [] is passed, all the encountered extesions will be considered.
 * @property {boolean} isAllowed - A boolean value, true (default) if the array contains the allowed types else false for not allowed.
 */
exports.StaticFiles = class {
    #directory;
    #extensions;
    #isAllowed;
    #staticFiles;

    /**
     * @param {string} directory - A path to the static files folder.
     * @param {string[]} extensions - An array of strings containing all the allowed or disallowed types of file. If [] is passed, all the encountered extesions will be considered.
     * @param {boolean} isAllowed - A boolean value, true (default) if the array contains the allowed types else false for not allowed.
    */
    constructor(directory, extensions, isAllowed = true) {
        this.#directory = directory;

        if (directory.slice(-1) !== '/') {
            this.#directory += '/';
        }

        if (Array.isArray(extensions) && (extensions.every(i => (typeof(i) === 'string')) || extensions == false)) {
            this.#extensions = extensions;
        }
        else {
            throw 'Type Error: the parameter "extensions" need to be an array of strings or [].';
        }

        this.#staticFiles = new Map();
        this.load();
    }

    //#region getter
    /**
     * Returns @property {string} directory
     * @returns {string} - A string containing the used directory for the static files 
     */
    getDirectory() {
        return this.#directory;
    }
    /**
     * Returns @property {string[]} extensions
     * @returns {string[]} - An array of strings or [] depending on what the property is setted. This array contain all the allowed or disallowed extensions.
     */
    getExtensions() {
        return this.#extensions;
    }
    /**
     * Returns @property {boolean} isAllowed
     * @returns {boolean} - True or false depending on the value of the property. This value tell if the array of extensions is of allowed types or disallowed.
     */
    getIsAllowed() {
        return this.#isAllowed;
    }
    //#endregion

    //#region setter
    /**
     * Set to a new value the directory used to read the static files and load the new path in memory.
     * @param {string} directory - A string containing the directory used to read the static files.
     */
    setDirectory(directory) {
        if (typeof(directory) !== 'string') {
            throw 'Type Error: the directory need to be a string.';
        }

        if (directory.slice(-1) !== '/') {
            directory += '/';
        }

        if (!fs.existsSync(directory)) {
            throw 'Path Error: the directory need to be an existing one.';
        }

        this.#directory = directory;
        this.load();
    }
    /**
     * Set to a new value the extensions used and reload the static files in memory.
     * @param {string[]} extensions - An array of strings containing all the allowed or disallowed types of file. If [] is passed, all the encountered extesions will be considered.
     */
    setExtensions(extensions) {
        if (Array.isArray(extensions) && (extensions.every(i => (typeof(i) === 'string')) || extensions == false)) {
            this.#extensions = extensions;
        }
        else {
            throw 'Type Error: the parameter "extensions" need to be an array of strings or [].';
        }

        this.load();
    }
    /**
     * Change whatever the extensions passed are considered as allowed (true) or disallowed (false) types.
     * @param {boolean} isAllowed - A boolean value, true (default) if the array contains the allowed types else false for not allowed.
     */
    setIsAllowed(isAllowed) {
        if (typeof(isAllowed) !== 'boolean') {
            throw 'Type Error: "isAllowed" need to be true or false';
        }

        this.#isAllowed = isAllowed;
        this.load();
    }
    //#endregion

    /** 
     * Get the list of all the files in the path.
     * @returns {string[]} - A list of strings containing all the allowed static files in the directory. 
     */
    list() {
        let allFiles = [];

        fs.readdirSync(this.#directory).forEach(file => {
            let isConsidered = this.#extensions.includes(file.split('.').pop());

            if ((isConsidered && this.#isAllowed) || (!isConsidered && !this.#isAllowed) || (this.#extensions == false && this.#isAllowed)) {
                allFiles.push(file);
            }
        });
    
        return allFiles;
    }

    /** 
     * Load all the static files in memory. 
     */ 
    load() {
        this.#staticFiles.clear();
        fs.readdirSync(this.#directory).forEach(file => {
            if (!fs.lstatSync(this.#directory + file).isDirectory()) {
                let isConsidered = this.#extensions.includes(file.split('.').pop());

                if ((isConsidered && this.#isAllowed) || (!isConsidered && !this.#isAllowed) || (this.#extensions == false && this.#isAllowed)) {
                    this.#staticFiles.set(file, fs.readFileSync(this.#directory + file, (err, data) => {
                        if (err) {
                            throw err;
                        }
                    }));
                }
            }
        });
    }

    /**
     * Search among all the current loaded files in memory and returns it if found else null.
     * @param {string} file - A string containing the complete name of the file (i.e. also the extension).
     * @returns {Buffer | null} - A buffer containing the raw data if the file is loaded in memory otherwise it will return null.
     */
    get(file) {
        let res = this.#staticFiles.get(file);

        if (res === undefined) {
            return null;
        }
        else {
            return res;
        }
    }
}