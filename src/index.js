const optionsDefault = {
	indent: {
		type: 'space',
		size: 2
	}
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

const indent = (tree, {indent: {type, size}}) => {
	const indentString = type === 'space' ? ' '.repeat(size) : '\t';

	const getIndent = level => `\n${indentString.repeat(level)}`;

	const setIndent = (tree, level = 0) => tree.reduce((previousValue, currentValue, index) => {
		if (typeof currentValue === 'object' && Object.prototype.hasOwnProperty.call(currentValue, 'content')) {
			currentValue.content = setIndent(currentValue.content, ++level);
			--level;
		}

		if (tree.length === 1 && typeof tree[index] === 'string') {
			console.log(tree);
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

function beautify(tree, options) {
	return new Promise(resolve => resolve(tree))
		.then(tree => clean(tree))
		.then(tree => indent(tree, options))
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
