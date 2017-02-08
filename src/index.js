import parser from 'posthtml-parser';
import render from 'posthtml-render';
import rules from './rules.js';
import attrs from './attrs.js';
import tags from './tags.js';
import deepmerge from 'deepmerge';

const optionsDefault = {
	rules: rules,
	attrs: attrs,
	tags: tags,
	sync: false
};

const clean = tree => parser(render(tree))
	.filter(node => {
		return typeof node === 'object' || (typeof node === 'string' && (node.trim().length !== 0 || /doctype/gi.test(node)));
	})
	.map(node => {
		if (Object.prototype.hasOwnProperty.call(node, 'content')) {
			node.content = clean(node.content);
		}

		return typeof node === 'string' ? node.trim() : node;
	});

const parseConditional = tree => {
	return tree.map(node => {
		if (typeof node === 'object' && Object.prototype.hasOwnProperty.call(node, 'content')) {
			node.content = parseConditional(node.content);
		}

		if (typeof node === 'string' && /<!(?:--)?\[[\s\S]*?]>/.test(node)) {
			const conditional = /^((?:<[^>]+>)?<!(?:--)?\[[\s\S]*?]>(?:<!)?(?:-->)?)([\s\S]*?)(<!(?:--<!)?\[[\s\S]*?](?:--)?>)$/
				.exec(node)
				.slice(1)
				.map((node, index) => index === 1 ? {tag: 'conditional-content', content: clean(parser(node))} : node);

			return {
				tag: 'conditional',
				content: conditional
			};
		}

		return node;
	});
};

const renderConditional = tree => {
	return tree.reduce((previousValue, node) => {
		if (typeof node === 'object' && Object.prototype.hasOwnProperty.call(node, 'content')) {
			node.content = renderConditional(node.content);
		}

		if (typeof node === 'object' && node.tag === 'conditional') {
			return [...previousValue, ...node.content];
		}

		if (typeof node === 'object' && node.tag === 'conditional-content') {
			node.tag = false;
			return [...previousValue, node];
		}

		return [...previousValue, node];
	}, []);
};

const indent = (tree, {rules: {indent, eol}}) => {
	const indentString = typeof indent === 'number' ? ' '.repeat(indent) : '\t';

	const getIndent = level => `${eol}${indentString.repeat(level)}`;

	const setIndent = (tree, level = 0) => tree.reduce((previousValue, node, index) => {
		if (typeof node === 'object' && Object.prototype.hasOwnProperty.call(node, 'content')) {
			node.content = setIndent(node.content, ++level);
			--level;
		}

		if (tree.length === 1 && typeof tree[index] === 'string') {
			return [...previousValue, node];
		}

		if (level === 0 && (tree.length - 1) === index && tree.length > 1) {
			return [...previousValue, getIndent(level), node];
		}

		if (level === 0 && (tree.length - 1) === index && tree.length === 1) {
			return [...previousValue, node];
		}

		if (level === 0 && index === 0) {
			return [...previousValue, node, getIndent(level)];
		}

		if (level === 0) {
			return [...previousValue, getIndent(level), node, getIndent(level)];
		}

		if ((tree.length - 1) === index) {
			return [...previousValue, getIndent(level), node, getIndent(--level)];
		}

		if (typeof node === 'string' && /<!(?:--)?\[endif]*?]>/.test(node)) {
			return [...previousValue, getIndent(level), node, getIndent(0)];
		}

		if (typeof node === 'string' && /<!(?:--)?\[[\s\S]*?]>/.test(node)) {
			return [...previousValue, getIndent(level), node];
		}

		if (node.tag === false) {
			return [...previousValue, ...node.content.slice(0, -1)];
		}

		return [...previousValue, getIndent(level), node, getIndent(0)];
	}, []);

	return setIndent(tree);
};

const attrsBoolean = (tree, {attrs: {boolean}}) => {
	const removeAttrValue = tree => tree.map(node => {
		if (typeof node === 'object' && Object.prototype.hasOwnProperty.call(node, 'content')) {
			node.content = removeAttrValue(node.content);
		}

		if (typeof node === 'object' && Object.prototype.hasOwnProperty.call(node, 'attrs')) {
			Object.keys(node.attrs).forEach(key => {
				node.attrs[key] = boolean.includes(key) ? true : node.attrs[key];
			});
		}

		return node;
	});

	return removeAttrValue(tree);
};

const lowerElementName = (tree, {tags}) => {
	tags = tags.map(({name}) => name);

	const bypass = tree => tree.map(node => {
		if (typeof node === 'object' && Object.prototype.hasOwnProperty.call(node, 'content')) {
			node.content = bypass(node.content);
		}

		if (
			typeof node === 'object' &&
			Object.prototype.hasOwnProperty.call(node, 'tag') &&
			tags.includes(node.tag.toLowerCase())
		) {
			node.tag = node.tag.toLowerCase();
		}

		return node;
	});

	return bypass(tree);
};

const eof = (tree, {rules: {eof}}) => eof ? [...tree, eof] : tree;

const beautify = (tree, options) => [
	clean,
	parseConditional,
	renderConditional,
	indent,
	lowerElementName,
	attrsBoolean,
	eof
].reduce((previousValue, module) => typeof module === 'function' ? module(previousValue, options) : previousValue, tree);

export default (options = {}) => {
	return tree => {
		if (!Array.isArray(tree)) {
			return new Error(`tree is not Array`);
		}

		if (tree.length === 0) {
			return tree;
		}

		if (
			(
				Object.prototype.hasOwnProperty.call(tree, 'options') &&
				Object.prototype.hasOwnProperty.call(tree.options, 'sync') &&
				tree.options.sync
			) ||
			options.sync
		) {
			return beautify(tree, deepmerge(optionsDefault, options));
		}

		return Promise.resolve(beautify(tree, deepmerge(optionsDefault, options)));
	};
};
