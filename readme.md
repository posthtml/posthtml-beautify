# posthtml-beautify

> A [posthtml](https://github.com/posthtml) plugin to beautify you html files

[![Travis Build Status](https://img.shields.io/travis/posthtml/posthtml-beautify/master.svg?style=flat-square&label=unix)](https://travis-ci.org/posthtml/posthtml-beautify)[![AppVeyor Build Status](https://img.shields.io/appveyor/ci/gitscrum/posthtml-beautify/master.svg?style=flat-square&label=windows)](https://ci.appveyor.com/project/gitscrum/posthtml-beautify)[![node](https://img.shields.io/node/v/post-sequence.svg?maxAge=2592000&style=flat-square)]()[![npm version](https://img.shields.io/npm/v/posthtml-beautify.svg?style=flat-square)](https://www.npmjs.com/package/posthtml-beautify)[![Dependency Status](https://david-dm.org/gitscrum/posthtml-beautify.svg?style=flat-square)](https://david-dm.org/gitscrum/posthtml-beautify)[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg?style=flat-square)](https://github.com/sindresorhus/xo)[![Coveralls status](https://img.shields.io/coveralls/posthtml/posthtml-beautify.svg?style=flat-square)](https://coveralls.io/r/posthtml/posthtml-beautify)

[![npm downloads](https://img.shields.io/npm/dm/posthtml-beautify.svg?style=flat-square)](https://www.npmjs.com/package/posthtml-beautify)[![npm](https://img.shields.io/npm/dt/posthtml-beautify.svg?style=flat-square)](https://www.npmjs.com/package/posthtml-beautify)[![Package Quality](http://npm.packagequality.com/shield/posthtml-beautify.svg?style=flat-square)](http://packagequality.com/#?package=posthtml-beautify)

## Why?
Format your html and inline css markup according to the [HTML5 syntax Style Guide](http://www.w3schools.com/html/html5_syntax.asp), [Code Guide](http://codeguide.co/#html). Full list of supported options:
- [x] Transform lower case element names
- [x] Transform lower case attribute names
- [x] Only double quotes
- [x] Close all html elements 
- [x] Removing trailing slash in self-closing 
- [x] Removes spaces at the equal sign
- [x] Add blank lines to separate large or logical code blocks
- [x] Add 2 spaces of indentation. *Do not use TAB*.
- [ ] Add language attribute
- [ ] Add character encoding
- [ ] Attribute order
- [x] Boolean attributes
- [ ] Creates file from the inline styles
- [ ] Create scoped class name (*use css-modules*) instead inline styles
- [ ] validate elements and attributes name
- [x] parses Internet Explorer Conditional Comments (*not support Downlevel-revealed and valid version, [htmlparse2 invalid parses](https://github.com/posthtml/posthtml-beautify/issues/36)*)

## Install

```bash
npm i -S posthtml posthtml-beautify
```

> **Note:** This project is compatible with node v8+

## Usage

```js
import {readFileSync, writeFileSync} from 'fs';
import posthtml from 'posthtml';
import beautify from 'posthtml-beautify';

const html = readFileSync('input.html', 'utf8');

posthtml()
  .use(beautify({rules: {indent: 4}}))
  .process(html)
  .then(result => {
    writeFileSync('output.html', result.html);
  });

```
*Returns html-formatted according to rules based on the use [HTML5 syntax Style Guide](http://www.w3schools.com/html/html5_syntax.asp), [Code Guide](http://codeguide.co/#html) with custom settings `indent: 4`*

## Example

input.html
```html
<!DOCTYPE html>
<head><link href="main.css" rel="stylesheet" type="text/css">
    <!--[if IE 7]><link href="ie7.css" rel="stylesheet" type="text/css"><![endif]--><!--[if IE 6]><link href="ie6.css" rel="stylesheet" type="text/css"><![endif]--><!--[if IE 5]><link href="ie5.css" rel="stylesheet" type="text/css"><![endif]--></head>
 <table>
    <tr>
        <th>Name</th>
        <th>Description</th>
    </tr>
    <tr>
        <td>A</td>
        <td>Description of A</td>
    </tr>
    <tr>
        <td>B</td>
        <td>Description of B</td>
    </tr>
</table>
        <div>
<DIV class="first">
                                first</div>   <div class="middle"></div>
<div CLASS="last">last <b>line  </b> <a href="#">            test</a></div>

</div>
<img src="img.png" alt=""><input type="text" required>
```

output.html
```html
<!DOCTYPE html>

<head>
    <link href="main.css" rel="stylesheet" type="text/css">

    <!--[if IE 7]>
        <link href="ie7.css" rel="stylesheet" type="text/css">
    <![endif]-->

    <!--[if IE 6]>
        <link href="ie6.css" rel="stylesheet" type="text/css">
    <![endif]-->

    <!--[if IE 5]>
        <link href="ie5.css" rel="stylesheet" type="text/css">
    <![endif]-->
</head>

<table>
    <tr>
        <th>Name</th>

        <th>Description</th>
    </tr>

    <tr>
        <td>A</td>

        <td>Description of A</td>
    </tr>

    <tr>
        <td>B</td>

        <td>Description of B</td>
    </tr>
</table>

<div>
    <div class="first">first</div>
</div>

<div class="middle"></div>

<div class="last">
    last

    <b>line</b>

    <a href="#">test</a>
</div>

<img src="img.png" alt="">

<input type="text" required>
```

## Options

### `rules`
Type: `Object`  
Default:

  - **Indent**  
  Type: `Number|String(only tab)`  
  Default: 2  
  Description: *A numeric value indicates specifies the number of spaces. The string value only `tab`*

  - **blankLines**  
  Type: `String|Boolean(only false)`  
  Default: '\n'  
  Description: *Add or remove blank lines to separate large or logical code blocks*

  - **eol** (*end of line*)  
  Type: `String`  
  Default: '\n'  
  Description: *As value is a string symbol which is added to the end of the row*

  - **eof** (*end of file*)  
  Type: `String|Boolean`  
  Default: '\n'  
  Description: *As value is a string symbol which is added to the end of the file and will not adds if you specify a boolean value of `false`*

### `mini`
Type: `Object`  
Default:

  - **removeAttribute**  
  Type: `String|Boolean`  
  Default: false  
  Description: *Removes attributes that do not matter. The string value only `empty`*
