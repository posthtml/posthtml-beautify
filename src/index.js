import parser from 'posthtml-parser';
import render from 'posthtml-render';
import rules from './rules.js';
import attrs from './attrs.js';
import assign from 'assign-deep';

const optionsDefault = {
	rules: rules,
	attrs: attrs
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

		if (typeof node === 'string' && /<!(?:--)?\[[\s\S]*?\]>/.test(node)) {
			const conditional = /^((?:<[^>]+>)?<!(?:--)?\[[\s\S]*?\]>(?:<!)?(?:-->)?)([\s\S]*?)(<!(?:--<!)?\[[\s\S]*?\](?:--)?>)$/
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

		if (level === 0 && (tree.length - 1) === index) {
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

		if (typeof node === 'string' && /<!(?:--)?\[endif]*?\]>/.test(node)) {
			return [...previousValue, getIndent(level), node, getIndent(0)];
		}

		if (typeof node === 'string' && /<!(?:--)?\[[\s\S]*?\]>/.test(node)) {
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

const eof = (tree, {rules: {eof}}) => eof ? [...tree, eof] : tree;

function beautify(tree, options) {
	return Promise.resolve(tree)
		.then(tree => clean(tree))
		.then(tree => parseConditional(tree, options))
		.then(tree => renderConditional(tree, options))
		.then(tree => indent(tree, options))
		.then(tree => attrsBoolean(tree, options))
		.then(tree => eof(tree, options))
		.then(tree => tree);
}

export default (options = {}) => {
	return tree => new Promise((resolve, reject) => {
		if (!Array.isArray(tree)) {
			reject(new Error(`tree is not Array`));
		}

		if (tree.length === 0) {
			resolve(tree);
		}

		resolve(beautify(tree, assign({}, optionsDefault, options)));
	});
};
