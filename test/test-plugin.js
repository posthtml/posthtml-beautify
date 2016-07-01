import {readFile} from 'fs';
import test from 'ava';
import posthtml from 'posthtml';
import isPromise from 'is-promise';
import beautify from '../src/index.js';

function processing(html) {
	return posthtml()
		.use(beautify())
		.process(html);
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

test('plugin must be function', t => {
	t.true(typeof beautify === 'function');
});

test('should return reject', async t => {
	t.throws(beautify()());
});

test('should return promise', t => {
	t.true(isPromise(processing('')));
});

test('should return equal html', async t => {
	const fixture = '<html></html>';
	t.deepEqual(fixture, (await processing(fixture)).html);
});

test('should return with indent', async t => {
	t.deepEqual(
		(await read('expected/output-indent.html')),
		(await processing(await read('fixtures/input-indent.html'))).html
	);
});
