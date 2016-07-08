import rules from './rules.js';
import attrs from './attrs.js';

const optionsDefault = {
	rules: rules,
	attrs: attrs
};

const clean = tree => tree
	.filter(node => {
		return typeof node === 'object' || (typeof node === 'string' && (node.trim().length !== 0 || /doctype/gi.test(node)));
	})
	.map(node => {
		if (Object.prototype.hasOwnProperty.call(node, 'content')) {
			node.content = clean(node.content);
		}
		return typeof node === 'string' ? node.trim() : node;
	});

const indent = (tree, {rules: {indent, eol}}) => {
	const indentString = typeof indent === 'number' ? ' '.repeat(indent) : '\t';

	const getIndent = level => `${eol}${indentString.repeat(level)}`;

	const setIndent = (tree, level = 0) => tree.reduce((previousValue, currentValue, index) => {
		if (typeof currentValue === 'object' && Object.prototype.hasOwnProperty.call(currentValue, 'content')) {
			currentValue.content = setIndent(currentValue.content, ++level);
			--level;
		}

		if (tree.length === 1 && typeof tree[index] === 'string') {
			return [...previousValue, currentValue];
		}

		if (level === 0 && (tree.length - 1) === index) {
			return [...previousValue, currentValue];
		}

		if (level === 0) {
			return [...previousValue, currentValue, getIndent(level)];
		}

		if ((tree.length - 1) === index) {
			return [...previousValue, getIndent(level), currentValue, getIndent(--level)];
		}

		return [...previousValue, getIndent(level), currentValue, getIndent(0)];
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

function beautify(tree, options) {
	return new Promise(resolve => resolve(tree))
		.then(tree => clean(tree))
		.then(tree => indent(tree, options))
		.then(tree => attrsBoolean(tree, options))
		.then(tree => attrsBoolean(tree, options))
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

		resolve(beautify(tree, Object.assign({}, optionsDefault, options)));
	});
};
