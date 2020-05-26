import parser from 'posthtml-parser';
import render from 'posthtml-render';
import rules from './rules.js';
import attrs from './attrs.js';
import tags from './tags.js';
import deepmerge from 'deepmerge';
import {js} from 'js-beautify';

const optionsDefault = {
  rules,
  attrs,
  tags,
  sync: false,
  mini: {
    removeAttribute: false
  },
  jsBeautifyOptions: {
    indent_size: 2, // eslint-disable-line camelcase
    jslint_happy: true // eslint-disable-line camelcase
  }
};

const nodeHasContent = (node, callback) => {
  if (typeof node === 'object' && Object.prototype.hasOwnProperty.call(node, 'content')) {
    node.content = callback(node.content);
  }
};

const nodeHasAttrs = (node, callback) => {
  if (
    typeof node === 'object' && Object.prototype.hasOwnProperty.call(node, 'attrs')
  ) {
    node.attrs = Object.keys(node.attrs).reduce(callback, {}); // eslint-disable-line unicorn/no-fn-reference-in-iterator
  }
};

const getIndent = (level, {indent, eol}) => {
  const indentString = typeof indent === 'number' ? ' '.repeat(indent) : '\t';

  return `${eol}${indentString.repeat(level)}`;
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
    nodeHasContent(node, parseConditional);

    if (typeof node === 'string' && /<!(?:--)?\[[\S\s]*?]>/.test(node)) {
      const conditional = /^((?:<[^>]+>)?<!(?:--)?\[[\S\s]*?]>(?:<!)?(?:-->)?)([\S\s]*?)(<!(?:--<!)?\[[\S\s]*?](?:--)?>)$/
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

const indent = (tree, {rules: {indent, eol, blankLines, maxlen}}) => {
  const setIndent = (tree, level = 0) => tree.reduce((previousValue, node, index) => {
    if (typeof node === 'object' && Object.prototype.hasOwnProperty.call(node, 'content')) {
      node.content = setIndent(node.content, ++level);
      --level;
    }

    if (tree.length === 1 && typeof tree[index] === 'string') {
      if (tree[index].length >= maxlen) {
        return [...previousValue, getIndent(level, {indent, eol}), node, getIndent(--level, {indent, eol})];
      }

      return [...previousValue, node];
    }

    if (level === 0 && (tree.length - 1) === index && tree.length > 1) {
      return [...previousValue, getIndent(level, {indent, eol}), node];
    }

    if (level === 0 && (tree.length - 1) === index && tree.length === 1) {
      return [...previousValue, node];
    }

    if (level === 0 && index === 0) {
      return [...previousValue, node, blankLines];
    }

    if (level === 0) {
      return [...previousValue, getIndent(level, {indent, eol}), node, blankLines];
    }

    if ((tree.length - 1) === index) {
      return [...previousValue, getIndent(level, {indent, eol}), node, getIndent(--level, {indent, eol})];
    }

    if (typeof node === 'string' && /<!(?:--)?\[endif]*?]>/.test(node)) {
      return [...previousValue, getIndent(level, {indent, eol}), node, blankLines];
    }

    if (typeof node === 'string' && /<!(?:--)?\[[\S\s]*?]>/.test(node)) {
      return [...previousValue, getIndent(level, {indent, eol}), node];
    }

    if (node.tag === false) {
      return [...previousValue, ...node.content.slice(0, -1)];
    }

    return [...previousValue, getIndent(level, {indent, eol}), node, blankLines];
  }, []);

  return setIndent(tree);
};

const attributesBoolean = (tree, {attrs: {boolean}}) => {
  const removeAttributeValue = tree => tree.map(node => {
    nodeHasContent(node, removeAttributeValue);

    if (typeof node === 'object' && Object.prototype.hasOwnProperty.call(node, 'attrs')) {
      Object.keys(node.attrs).forEach(key => {
        node.attrs[key] = boolean.includes(key) ||
                    node.attrs[key]
                      .trim()
                      .split(' ')
                      .filter(value => value.length)
                      .join(' ');
      });
    }

    return node;
  });

  return removeAttributeValue(tree);
};

const lowerElementName = (tree, {tags}) => {
  tags = tags.map(({name}) => name);

  const bypass = tree => tree.map(node => {
    nodeHasContent(node, bypass);

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

const lowerAttributeName = tree => {
  const bypass = tree => tree.map(node => {
    nodeHasContent(node, bypass);

    nodeHasAttrs(node, (previousValue, key) => Object.assign(previousValue, {[key.toLowerCase()]: node.attrs[key]}));

    return node;
  });

  return bypass(tree);
};

const eof = (tree, {rules: {eof}}) => eof ? [...tree, eof] : tree;

const mini = (tree, {mini}) => {
  const bypass = tree => tree.map(node => {
    nodeHasContent(node, bypass);

    nodeHasAttrs(node, (previousValue, key) => {
      if (
        mini.removeAttribute &&
        mini.removeAttribute === 'empty' &&
        node.attrs[key].length === 0
      ) {
        return previousValue;
      }

      return Object.assign(previousValue, {[key.toLowerCase()]: node.attrs[key]});
    });

    return node;
  });

  return bypass(tree);
};

const sortLogic = function (key1, key2) {
  if (key1 < key2) {
    return -1;
  }

  if (key1 > key2) {
    return +1;
  }

  return 0;
};

const sortAttr = (tree, {rules: {sortAttr}}) => {
  tree.map(node => {
    if (sortAttr && node.attrs) {
      node.attrs = Object.keys(node.attrs)
        .sort(sortLogic)
        .reduce((current, key) => Object.assign(current, {[key]: node.attrs[key]}), {})
    }

    return node;
  });
  return tree;
};

const jsPrettier = (tree, {rules: {indent, eol}, jsBeautifyOptions}) => {
  let level = 0;
  const prettier = tree => tree.map(node => {
    ++level;
    nodeHasContent(node, prettier);

    if (node.tag === 'script') {
      const content = node.content ?
        ['\n', js(node.content.join(''), {
          ...jsBeautifyOptions,
          indent_level: level // eslint-disable-line camelcase
        }), getIndent(--level, {indent, eol})] :
        [''];
      node.content = content;
    }

    --level;
    return node;
  });

  return prettier(tree);
};

const beautify = (tree, options) => [
  clean,
  parseConditional,
  renderConditional,
  indent,
  jsPrettier,
  lowerElementName,
  lowerAttributeName,
  attributesBoolean,
  sortAttr,
  eof,
  mini
].reduce((previousValue, module) => typeof module === 'function' ? module(previousValue, options) : previousValue, tree);

const normalize = (node, options) => {
  let {tree, api} = Object.keys(node).reduce(
    (scope, key) => {
      scope[Number.isNaN(Number(key)) ? 'api' : 'tree'][key] = node[key];

      return scope;
    },
    {tree: [], api: []}
  );

  tree = beautify(tree, deepmerge(optionsDefault, options));

  for (const [key, value] of Object.entries(api)) {
    tree[key] = value;
  }

  return tree;
};

export default (options = {}) => node => {
  if (!Array.isArray(node)) {
    throw new TypeError('tree is not Array');
  }

  if (node.length === 0) {
    return node;
  }

  return normalize(node, options);
};
