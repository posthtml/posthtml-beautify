import {readFile} from 'fs';
import test from 'ava';
import isPromise from 'is-promise';
import {processing} from './utils';

test('processing should return promise', t => {
	t.true(isPromise(processing('')));
});

test('processing not should return promise with use option sync', t => {
	t.false(isPromise(processing('<div></div>', [], {sync: true})));
});

test('processing should return object with use option sync', t => {
	t.deepEqual(typeof processing('<div></div>', [], {sync: true}), 'object');
});
