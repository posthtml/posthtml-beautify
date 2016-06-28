const fs = require('fs');
const path = require('path');
const posthtml = require('posthtml');
const html = fs.readFileSync('test/fixtures/input-indent.html', 'utf8');

posthtml()
	.use(require(path.resolve('lib/index.js'))())
	.process(html)
	.then(function(result) {
		console.log(result.html);
		fs.writeFileSync('example.html', result.html);
	});
