const clean = tree => tree
	.filter(node => {
		console.log(node);
		return typeof node === 'object' || (typeof node === 'string' && (node.trim().length !== 0 || /doctype/gi.test(node)))
	})
	.map(node => {
		if (Object.prototype.hasOwnProperty.call(node, 'content')) {
			node.content = clean(node.content);
		}
		return typeof node === 'string' ? node.trim() : node;
	});

function indent(tree) {
	return tree;
}

const lineBreak = tree => tree.reduce((previousValue, node) => {
	if (!Object.prototype.hasOwnProperty.call(node, 'content') && !Object.prototype.hasOwnProperty.call(node, 'tag')) {
		return previousValue.concat([node]);
	}

	if (Object.prototype.hasOwnProperty.call(node, 'content') && Object.prototype.hasOwnProperty.call(node, 'tag')) {
		node.content = [`\n`, ...lineBreak(node.content), `\n`];
		return previousValue.concat(node);
	}

	// if (typeof node === 'string') {
	//	return level ? node.replace(/\n(?!\n)\s*/g, `\n${new Array(5 * (level++)).join(' ')}`) : '';
	// }

	// return node; /* typeof node === 'object' || (typeof node === 'string' && /doctype/gi.test(node)); */

	return previousValue.concat([`\n`, node, `\n`]);
}, []);

function beautify(tree) {
	return new Promise(resolve => resolve(tree))
		.then(tree => {
			// console.log(tree[1].content[5].content);
			return clean(tree);
		})
		.then(tree => {
			return lineBreak(tree);
		})
		.then(tree => {
			return indent(tree);
		})
		.then(tree => {
			/* console.log('---------|end|-----------');
			console.log(tree);
			console.log('---------|content|-----------');
			console.log(tree[0].content); */
			return tree;
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
  },
  options: {},
  walk: [Function],
  match: [Function]
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
