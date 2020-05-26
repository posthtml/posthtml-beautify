import test from 'ava';
import {processing, read} from './utils';
import beautify from '../src';

test('plugin beautify must be function', t => {
  t.plan(2);
  t.true(typeof beautify === 'function');
  t.true(typeof beautify() === 'function');
});

test('plugin beautify should return Error with use option sync', t => {
  const error = t.throws(() => {
    beautify()();
  }, undefined);

  t.is(error.message, 'tree is not Array');
});

test('plugin beautify should return the passed value with use option sync', t => {
  const tree = [];

  t.deepEqual(tree, beautify()(tree));
});

test('processing with plugin beautify should not lost native api', async t => {
  t.plan(2);
  const fixture = '<div></div>\n\n<div></div>';
  t.true(
    Object.prototype.hasOwnProperty.call(
      (await processing(fixture, [beautify({rules: {eof: false}})])).tree,
      'walk'
    )
  );
  t.true(
    Object.prototype.hasOwnProperty.call(
      (await processing(fixture, [beautify({rules: {eof: false}})])).tree,
      'match'
    )
  );
});

test('processing with plugin beautify should return equal html', async t => {
  const fixture = '<div></div>\n\n<div></div>';
  t.deepEqual(fixture, (await processing(fixture, [beautify({rules: {eof: false}})])).html);
});

test('processing with plugin beautify should return allowed max line content', async t => {
  const fixture = '<div>some long long content here to test max len</div>';
  const expected = `<div>
  some long long content here to test max len
</div>`;
  t.deepEqual(expected, (await processing(fixture, [beautify({rules: {eof: false, maxlen: 10}})])).html);
});

test('processing with plugin beautify should return allowed max line content #2', async t => {
  const fixture = '<div><a>some long long content here to test max len</a></div>';
  const expected = `<div>
  <a>
    some long long content here to test max len
  </a>
</div>`;
  t.deepEqual(expected, (await processing(fixture, [beautify({rules: {eof: false, maxlen: 10}})])).html);
});

test('processing with plugin beautify should removing trailing slash in self-closing', async t => {
  const fixture = '<img src="image.jpg" />';
  const expected = '<img src="image.jpg">';
  t.deepEqual(expected, (await processing(fixture, [beautify({rules: {eof: false}})])).html);
});

test('processing with plugin beautify sort the attribute list', async t => {
  const fixture = '<p a="aa" c="cc" b="bb">a</p>';
  const expected = '<p a="aa" b="bb" c="cc">a</p>';
  t.deepEqual(expected, (await processing(fixture, [beautify({rules: {eof: false, sortAttr: true}})])).html);
});

test('processing with plugin beautify sort the attribute list example 2', async t => {
  const fixture = '<p a="aa" c b="bb">a</p>';
  const expected = '<p a="aa" b="bb" c="">a</p>';
  t.deepEqual(expected, (await processing(fixture, [beautify({rules: {eof: false, sortAttr: true}})])).html);
});

test('processing with plugin beautify sort the attribute list example 3', async t => {
  const fixture = '<p abc="aa" cba="" bac="bb">a</p>';
  const expected = '<p abc="aa" bac="bb" cba="">a</p>';
  t.deepEqual(expected, (await processing(fixture, [beautify({rules: {eof: false, sortAttr: true}})])).html);
});

test('processing with plugin beautify should removing empty attribute', async t => {
  const fixture = '<img src="image.jpg" alt="">';
  const expected = '<img src="image.jpg">';
  t.deepEqual(expected, (await processing(fixture, [beautify({rules: {eof: false}, mini: {removeAttribute: 'empty'}})])).html);
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

test('processing with plugin beautify should return trim attribute', async t => {
  const fixture = '<span class=" image  response"  rel="  images "></span>';
  const expected = '<span class="image response" rel="images"></span>';
  t.deepEqual(expected, (await processing(fixture, [beautify({rules: {eof: false}})])).html);
});

test('processing with plugin beautify should transform lower case attribute names', async t => {
  const fixture = '<div CLASS="UPPERCLASS"></div>';
  const expected = '<div class="UPPERCLASS"></div>';
  t.deepEqual(expected, (await processing(fixture, [beautify({rules: {eof: false}})])).html);
});

test('processing with plugin beautify should transform lower case tag name', async t => {
  const fixture = '<DIV></DIV>';
  const expected = '<div></div>';
  t.deepEqual(expected, (await processing(fixture, [beautify({rules: {eof: false}})])).html);
});

test('processing with plugin beautify should return with indent', async t => {
  t.deepEqual(
    (await read('test/expected/output-indent.html')),
    (await processing(await read('test/fixtures/input-indent.html'), [beautify()])).html
  );
});

test('processing with plugin beautify should return with without blankLines', async t => {
  t.deepEqual(
    (await read('test/expected/output-blank-lines.html')),
    (await processing(await read('test/fixtures/input-blank-lines.html'), [beautify({rules: {blankLines: false}})])).html
  );
});

test('processing with plugin beautify and modules should return equal html using plugin posthtml-modules', async t => {
  t.deepEqual(
    (await read('test/expected/output-posthtml-modules.html')),
    (await processing(await read('test/fixtures/input-posthtml-modules.html'), [require('posthtml-modules')(), beautify()])).html
  );
});

test('processing with plugin beautify and include should return equal html using plugin posthtml-include', async t => {
  const expected = await read('test/expected/output-posthtml-include.html');
  const fixtures = (await processing(await read('test/fixtures/input-posthtml-include.html'), [require('posthtml-include')(), beautify()])).html;
  t.deepEqual(expected, fixtures);
});

test('processing with plugin beautify and include should return equal html which IE conditional comment', async t => {
  const expected = await read('test/expected/output-conditional-comment.html');
  const fixtures = (await processing(await read('test/fixtures/input-conditional-comment.html'), [require('posthtml-include')(), beautify()])).html;
  t.deepEqual(expected, fixtures);
});

test('processing with plugin beautify should return format js', async t => {
  t.deepEqual(
    (await read('test/expected/output-inline-js.html')),
    (await processing(await read('test/fixtures/input-inline-js.html'), [beautify()])).html
  );
});

