import Vue from 'vue';
import posthtml from 'posthtml';
import beautify from '..';
import hljs from 'highlight.js';

new Vue({
  el: '#app',
  data: {
    HTML: '<!DOCTYPE html><head><link href="main.css" rel="stylesheet" type="text/css"><!--[if IE 7]><link href="ie7.css" rel="stylesheet" type="text/css"><![endif]--><!--[if IE 6]><link href="ie6.css" rel="stylesheet" type="text/css"><![endif]--><!--[if IE 5]><link href="ie5.css" rel="stylesheet" type="text/css"><![endif]--><script src="https://unpkg.com/vue@2.6.10/dist/vue.js"></script><script>(function () {\'use strict\';function log(message) {console.log(message);}log(\'test :)\');}());</script></head><table><tr><th>Name</th><th>Description</th></tr><tr><td>A</td><td>Description of A</td></tr><tr><td>B</td><td>Description of B</td></tr></table><div><DIV class="first">first</div>   <div class="middle"></div><div CLASS="last">last <b>line  </b> <a href="#">            test</a></div></div><img src="img.png" alt=""><input type="text" required>'
  },
  computed: {
    processingHTML() {
      return hljs.highlightAuto(posthtml()
        .use(beautify({
          rules: {
            indent: 2,
            eol: '\r\n'
          }
        }))
        .process(
          this.HTML,
          {
            sync: true
          }
        ).html).value;
    }
  }
});
