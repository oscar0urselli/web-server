# template-engine

[![License](https://img.shields.io/apm/l/vim-mode)](https://github.com/oscar0urselli/template-engine/blob/master/LICENSE)

# Index

- [Get started](#get-started)
- [Documentation](#documentation)
- [License](#license)

# Get started

## Requirements

The code is written in JavaScript with Node.js (v14.15.5) using ES6 features. It's not proved the compatibility with older version of the used one.

## Installation

For the moment the package is not available in npm, yarn or any other packege manager.
So the only way to do that is downloading the repository from GitHub and put the folder wherever you like (usually the folder used from npm for the other modules in the project).

# Documentation
## Index

- [Setting up the envoirement](#setting-up-the-envoirement)
- [Create the template](#create-the-template)
- [How to use the module](#how-to-use-the-module)
- [Variables](#variables)
- [class TemplateEngine](#class-templateengine)

## Setting up the envoirement
### How to import
After downloading the repository, go in JS file you want and import the module with:
```js
const te = require('template-engine');
```

### Directory managing
Is highly reccomanded to create two folders inside the project, one called ```base``` and the other ```content```.
In this two folder we will put the HTML files used as base file and content files to generate the final HTML pages.

## Create the template
### Base file
A base file is an HTML that contain those elements used in more pages. As the project grow the amount of files start to become larger and this mean also a lot of code.
To semplify a bit the thing is possible reduce the amount of code written, in particular you will avoid putting every time the footer, navbar or other items used in the page.

Let's start creating a file, you can call it how you wish, in this case base.
```html
<!-- folderx/foldery/.../base/base.html -->
<!DOCTYPE html>
<html>
    <head>
        <title>Title</title>
    </head>
    <body>
        <!-- Navbar code here -->
      
        <div>
          {% PUT cnt_page %}
        </div>
      
        <!-- Footer code here -->
    </body>
</html>
```

As you can see, in the body code there something different from the standard HTML5: ```{% PUT cnt_page %}```.
Well this is not HTML but a template language, in particular the command ```{% PUT [cntName] %}``` is like saying:
 - between all the contents, pick the one named cnt_page (or any other name used) and put its code into where the call happened;
 - then load the final file in memory, ready to use whene requested.

NOTICE: Inside a base file you can use evet number of PUT command the number doesn't matter, but use always the name of an existing content.

### Content file
We said that the command PUT will search among the contents, but what is a content?
A content is the HTML file that contain the primary information of the page. For example think about a forum or a blog, while navigating in the side you can notice how the footer, the navbar and some other elements remain identical, but the central content of the page is changing like passing from a post to another.
This is the content, the part of the page that is changing every time. NOTICE: Be aware that in some case the entaire page will change, but normally this happen in particular case you will have a file for it.

Now let's use a content file:
```html
<!-- folderx/foldery/.../content/content1.html -->
{% START cnt_page %}
<h1>Hello this is the content</h1>
<p>This content is not actually present in the file base.html it was loaded from content1.html</p>
{% END cnt_page %}
```

So what's happening? Basically inside the file, you have the HTML code you want to use put insed the base file. At the start and at the end of the block of code you want to use there is a command one: 
```{% START [cntName] %}``` say from the line under me start the content named cntName;
```{% END [cntName] %}``` say that the line above the command was the last line of the content.

NOTICE: In a file you can put as much contents you want (also 0 is accepted), but respect always the order of the START and END commands. Everything written on the same line of the command will be ignored and after a START with a cntName you will put an END with a cntName.

## How to use the module
It's very easy to do that, after importing the module and having setted up the project inside a JS file:
```js
// main.js
const te = require('template-engine');

let template = new te.TemplateEngine({
    baseFilepath: __dirname + '/base', // path to the base files
    cntFilepath: __dirname + '/content // path to the content files
});
```

Doing so you created an instance of the class and the HTML pages are already initialized.
The last thing to do is calling the method ```page()``` for getting the final page:
```js
let p = te.page('content1.html', {});
```
And so the method will return:
```html
<!DOCTYPE html>
<html>
    <head>
        <title>Title</title>
    </head>
    <body>
        <!-- Navbar code here -->
      
        <div>
            <h1>Hello this is the content</h1>
            <p>This content is not actually present in the file base.html it was loaded from content1.html</p>
        </div>
      
        <!-- Footer code here -->
    </body>
</html>
```
See how the PUT command was replaced with the content cnt_page of the file content1.html?
When we call the method ```let p = te.page('content1.html', {});``` we are passing two parameters:
 - the first is the name of the page we want to visualize. So we will pass the name of the HTML file containing the content of the page;
 - the second is a void object in this case, the object contain the values to put in case there were some variables.

## Variables
In this section we will discuss the use of variables inside an HTML file with the template language. In last section saw the use of this: ```let p = te.page('content1.html', {});``` and it was explained that the void object was for containing the values of the variables. But how the variables are used in the template files?

### Using variables
If we pick the file name content1.html used in the last example, we could have the situation where we want to change the message or simply use some value present in the code.
Well in this case came to the help the use of variables in out HTML code. So using variables an improvement could be:
```html
<!-- folderx/foldery/.../content/content1.html -->
{% START cnt_page %}
<h1>{{ title }}</h1>
<p>{{ msg }}</p>
{% END cnt_page %}
```
To define the use of a variable inside the file you can write: ```{{ [varName] }}```.

Instead in our code we will write:
```js
// main.js
const te = require('template-engine');

let template = new te.TemplateEngine({
    baseFilepath: __dirname + '/base', // path to the base files
    cntFilepath: __dirname + '/content // path to the content files
});

let p = te.page('content1.html', { title: 'Hello this is the content', msg: 'This content is not actually present in the file base.html it was loaded from content1.html' });
consol.log(p);
```
And so the ouput will be:
```html
<!DOCTYPE html>
<html>
    <head>
        <title>Title</title>
    </head>
    <body>
        <!-- Navbar code here -->
      
        <div>
            <h1>Hello this is the content</h1>
            <p>This content is not actually present in the file base.html it was loaded from content1.html</p>
        </div>
      
        <!-- Footer code here -->
    </body>
</html>
```

## class TemplateEngine
Class for managing the use of HTML template files. To access it:
```js
const te = require('template-engine');
let template = new te.TemplateEngine({
    baseFilePath: __dirname + '/base',
    cntFilePath: __dirname + '/content'
});
```

### ```new TemplateEngine(params)```
 - ```params <Object>```
    - ```baseFilePath <string>``` Directory where to find the base files.
    - ```cntFilePath <string>``` Same thing with ```baseFilePath``` but with content's files.

### ```TemplateEngine.getBaseFilePath()```
 - Returns: ```baseFilePath <string>``` the directory used to read the base's files.

### ```TemplateEngine.getCntFilePath()```
 - Returns: ```cntFilePath <string>``` the directory used to read the content's files.

### ```TemplateEngine.getPages()```
 - Returns: ```pages <Map>``` the Map containing the middle HTML pages generated after initializing the class.

### ```TemplateEngine.setBaseFilePath(path)```
 - ```path <string>```
Change the value of ```baseFilePath``` to a new directory.

### ```TemplateEngine.setCntFilePath(path)```
 - ```path <string>```
Change the value ```cntFilePath``` to a new directory.

### ```TemplateEngine.setPages()```
Create the middle HTML pages and load them in ```pages```.

### ```TemplateEngine.page(pageName, vars)```
 - ```pageName <string>```
 - ```vars <Object>```
 - Returns: ```page <string>``` the final HTML page ready to be used.

# License 
MIT License

Copyright (c) 2021 oscar0urselli

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.