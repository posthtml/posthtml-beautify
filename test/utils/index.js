import {readFile} from 'fs';
import posthtml from 'posthtml';

export const processing = (html, plugins = [], options = {}) => posthtml(plugins).process(html, options);

export const read = pathFile => new Promise((resolve, reject) => {
  readFile(pathFile, 'utf8', (err, data) => {
    if (err) {
      reject(err);
    }

    return resolve(data);
  });
});
