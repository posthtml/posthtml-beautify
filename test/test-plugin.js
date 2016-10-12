import {readFile} from 'fs';
import test from 'ava';
import posthtml from 'posthtml';
import isPromise from 'is-promise';
import beautify from '../src/index.js';

function processing(html, plugins = [], options = {}) {
	return posthtml(plugins)
		.process(html, options);
}

function read(pathFile) {
	return new Promise((resolve, reject) => {
		readFile(pathFile, 'utf8', (err, data) => {
			if (err) {
				reject(err);
			}
			return resolve(data);
		});
	});
}

test('processing should return promise', t => {
	t.true(isPromise(processing('')));
});

test('plugin beautify must be function', t => {
	t.true(typeof beautify === 'function');
});

test('plugin beautify should return reject', async t => {
	t.throws(beautify()());
});

test('processing with plugin beautify should return equal html', async t => {
	const fixture = '<div></div>\n\n<div></div>';
	t.deepEqual(fixture, (await processing(fixture, [beautify({rules: {eof: false}})])).html);
});

test('processing with plugin beautify should removing trailing slash in self-closing', async t => {
	const fixture = '<img src="image.jpg" />';
	const expected = '<img src="image.jpg">';
	t.deepEqual(expected, (await processing(fixture, [beautify({rules: {eof: false}})])).html);
});

test('processing with plugin beautify should removes spaces at the equal sign', async t => {
	const fixture = '<span class    =   "image"  rel=   "images"></span>';
	const expected = '<span class="image" rel="images"></span>';
	t.deepEqual(expected, (await processing(fixture, [beautify({rules: {eof: false}})])).html);
});

test('processing with plugin beautify should return boolean attribute', async t => {
	const fixture = '<input type="email" required>';
	const expected = '<input type="email" required>';
	t.deepEqual(expected, (await processing(fixture, [beautify({rules: {eof: false}})])).html);
});

test('processing with plugin beautify should transform lower case attribute names', async t => {
	const fixture = '<div CLASS="UPPERCLASS"></div>';
	const expected = '<div class="UPPERCLASS"></div>';
	t.deepEqual(expected, (await processing(fixture, [beautify({rules: {eof: false}})])).html);
});

test('processing with plugin beautify should return with indent', async t => {
	t.deepEqual(
		(await read('expected/output-indent.html')),
		(await processing(await read('fixtures/input-indent.html'), [beautify()])).html
	);
});

test('processing with plugin beautify and modules should return equal html using plugin posthtml-modules', async t => {
	t.deepEqual(
		(await read('expected/output-posthtml-modules.html')),
		(await processing(await read('fixtures/input-posthtml-modules.html'), [require('posthtml-modules')(), beautify()])).html
	);
});

test('processing with plugin beautify and include should return equal html using plugin posthtml-include', async t => {
	const expected = await read('expected/output-posthtml-include.html');
	const fixtures = (await processing(await read('fixtures/input-posthtml-include.html'), [require('posthtml-include')(), beautify()])).html;
	t.deepEqual(expected, fixtures);
});

test('processing with plugin beautify and include should return equal html which IE conditional comment', async t => {
	const expected = await read('expected/output-conditional-comment.html');
	const fixtures = (await processing(await read('fixtures/input-conditional-comment.html'), [require('posthtml-include')(), beautify()])).html;
	t.deepEqual(expected, fixtures);
});
