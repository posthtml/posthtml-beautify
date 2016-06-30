const clean = tree => tree
	.filter(node => {
		return typeof node === 'object' || (typeof node === 'string' && (node.trim().length !== 0 || /doctype/gi.test(node)))
	})
	.map(node => {
		if (Object.prototype.hasOwnProperty.call(node, 'content')) {
			node.content = clean(node.content);
		}
		return typeof node === 'string' ? node.trim() : node;
	});

const getIndent = level => `\n${new Array(level).join('    ')}`;

const indent = (tree, level = 0) => tree.reduce((previousValue, currentValue, index) => {

	if (typeof currentValue === 'object' && Object.prototype.hasOwnProperty.call(currentValue, 'content')) {
	 currentValue.content = indent(currentValue.content, ++level);
	}

	// console.log(tree);

	/*if (typeof currentValue === 'object' && !Object.prototype.hasOwnProperty.call(currentValue, 'content')) {
		currentValue['content'] = getIndent(level);
	}

	if (level !== 0) {
		return [...previousValue, getIndent(level), currentValue, getIndent(level)];
	}*/

	/*if (level !== 0 && index !== 0 ) {
		return [...previousValue, currentValue, getIndent(level)];
	}*/

	/*if (level === 0 && (tree.length - 1) !== index) {
		return [...previousValue, currentValue, getIndent(level)];
	}*/

	/* if (level !==0 && index === 0) {
		return previousValue.concat([getIndent(level), currentValue, getIndent(level)]);
	}

	if (level !== 0 && (tree.length - 1) === index) {
	   return previousValue.concat([currentValue, getIndent(--level)]);
	}

	if (level !==0) {
		return previousValue.concat([currentValue, getIndent(level)]);
	} */

	/*if (level !== 0) {
		return previousValue.concat([currentValue, getIndent(level)]);
	}

	if (level === 0 && (tree.length - 1) !== index) {
		return previousValue.concat([currentValue, getIndent(level)]);
	}*/

	if (tree.length === 1) {
		return [...previousValue, getIndent(++level), currentValue, getIndent(--level)];
	}

	if ((tree.length - 1) === index && tree.length !== 1) {
		return [...previousValue, getIndent(--level), currentValue];
	}



	return [...previousValue, getIndent(level), currentValue];
}, []);

function beautify(tree) {
	return new Promise(resolve => resolve(tree))
		.then(tree => {
			// console.log(tree);
			return clean(tree);
		})
		.then(tree => {
			// console.log(tree);
			return indent(tree);
		})
		.then(tree => {
			// console.log('---------|end|-----------');
			console.log(tree);
			// console.log('---------|content|-----------');
			return tree;/*[
	'<!DOCTYPE html>',
	'\n',
	{
		tag: 'div',
		content: [
			'\n    ',
			{
				tag: 'div',
				attrs: {
					class: 'first'
				},
				content: [
					'\n        ',
					'first',
					'\n    '
				]
			},
			'\n\n    ',
			{
				tag: 'div',
				attrs: {
					class: 'middle'
				},
				content: ['\n    ']
			},
			'\n\n    ',
			{
				tag: 'div',
				attrs: {
					class: 'last'
				},
				content: [
					'\n        ',
					'last',
					'\n        ',
					{
						tag: 'b',
						content: [
							'\n            ',
							'line',
							'\n        '
						]
					},
					'\n\n        ',
					{
						tag: 'a',
						attrs: {
							href: '#'
						},
						content: [
							'\n            ',
							'test',
							'\n        '
						]
					},
					'\n    '
				]
			},
			'\n'
		]
	}
];*/
		});
}

export default () => tree => new Promise((resolve, reject) => {
	if (!Array.isArray(tree)) {
		reject(new Error(`tree is not Array`));
	}

	if (tree.length === 0) {
		resolve(tree);
	}

	resolve(beautify(tree));
});


/*
[
	'<!DOCTYPE html>',
	'\n'
	{
		tag: 'div',
		content: [
			'\n    ',
			{
				tag: 'div',
				attrs: {
					class:
				},
				content: [
					'\n        ',
					'first',
					'\n    '
				]
			},
			'\n\n    ',
			{
				tag: 'div',
				attrs: {
					class: 'middle'
				}
			},
			'\n\n    ',
			{
				tag: 'div',
				attrs: {
					class: 'last'
				},
				content: [
					'\n        ' ,
					'last',
					{
						tag: 'b',
						content: [
							'\n            ',
							'line',
							'\n        '
						]
					},
					'\n    '
				]
			},
			'\n'
		]
	}
]
*/


/*
var tree = [
	'<!DOCTYPE html>'
	{
		tag: 'div',
		content: [
			{
				tag: 'div',
				attrs: {
					class:
				},
				content: [
					'first'
				]
			},
			{
				tag: 'div',
				attrs: {
					class: 'middle'
				}
			},
			{
				tag: 'div',
				attrs: {
					class: 'last'
				},
				content: [
					'last',
					{
						tag: 'b',
						content: [
							'line'
						]
					}
				]
			}
		]
	},
	options: {},
	walk: [Function],
	match: [Function]
]

function getIndent(level) {
		return `\nnew Array(4 * level).join(' ');
}

var a = function indent(tree, level = 0){
		return tree.reduce((init, curr, index, arr) => {
			 if (typeof curr === 'object' && curr.content) {

			 }

			 if (level === 0 && arr.length !== index) {
					 return [curr, getIndent(level)];
			 }
		});
}(tree);

*/

/*
<!DOCTYPE html>\n
<div>\n
    <div class="first">\n
        first\n
    </div>\n\n
    <div class="middle">\n
    </div>\n\n
    <div class="last">\n
        last\n
        <b>\n
            line\n
        </b>\n
    </div>\n
</div>

...
'\n'
...
    '\n    '
    ...
        '\n        '
        ...
        '\n    '
    '\n\n    '
    ...
        '\n    '
    '\n\n    '
    ...
        '\n        '
        ...
        '\n        '
        ...
            '\n            '
            ...
            '\n        '
        '\n    '
    '\n'
*/
