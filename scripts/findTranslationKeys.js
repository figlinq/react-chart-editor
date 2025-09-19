const transformSync = require('@babel/core').transformSync;
const traverse = require('@babel/traverse').default;
const fs = require('fs');
const glob = require('glob');
const path = require('path');

// generalize so we can use this script in other es6 repos
// so you can call:
//   findTranslationKeys <srcPath> <outputPath>
const pathToSrc = process.argv[2] || path.join(__dirname, '../src');
const srcGlob = path.join(pathToSrc, '**/*.js');

const pathToTranslationKeys =
  process.argv[3] || path.join(__dirname, './translationKeys/translation-keys.txt');

findLocaleStrings();

function findLocaleStrings() {
  glob(srcGlob, (err, files) => {
    if (err) {
      throw new Error(err);
    }

    const dict = {};
    let hasTranslation = false;
    let maxLen = 0;

    files.forEach(file => {
      const code = fs.readFileSync(file, 'utf-8');
      const filePartialPath = file.substr(pathToSrc.length);
      const ast = transformSync(code, {
        presets: ['@babel/preset-react', '@babel/preset-env'],
        plugins: [
          '@babel/plugin-transform-object-rest-spread',
          [
            'module-resolver',
            {
              root: ['./'],
              alias: {
                components: './src/components',
                lib: './src/lib',
                styles: './src/styles',
              },
            },
          ],
        ],
        ast: true,
      }).ast;

      traverse(ast, {
        enter(path) {
          if (path.node.type === 'CallExpression' && path.node.callee.name === '_') {
            const strNode = path.node.arguments[0];
            let strNodeValue = strNode.value;

            if (path.node.arguments.length !== 1) {
              logError(file, path.node, 'Localize takes 1 args');
            }

            if (['StringLiteral', 'BinaryExpression'].indexOf(strNode.type) < 0) {
              logError(
                file,
                path.node,
                `The localization function takes a string as argument, instead it received a ${
                  strNode.type
                }`
              );
            }

            if (strNode.type === 'BinaryExpression') {
              strNodeValue = path.get('arguments')[0].evaluate().value;
              if (typeof strNodeValue !== 'string') {
                logError(
                  file,
                  path.node,
                  `The localization function takes a string as argument, instead it received a ${typeof strNodeValue}`
                );
              }
            }

            if (!dict[strNodeValue]) {
              dict[strNodeValue] = filePartialPath + ':' + strNode.loc.start.line;
              maxLen = Math.max(maxLen, strNodeValue.length);
              hasTranslation = true;
            }
          }
        },
      });
    });

    if (!hasTranslation) {
      throw new Error('Found no translations.');
    }

    const strings = Object.keys(dict)
      .sort()
      .map(k => k + spaces(maxLen - k.length) + '  // ' + dict[k])
      .join('\n');

    fs.writeFileSync(pathToTranslationKeys, strings);
    console.log(`translation keys were written to: ${pathToTranslationKeys}`);
  });
}

function logError(file, node, msg) {
  throw new Error(file + ' [line ' + node.loc.start.line + '] ' + msg + '\n   ');
}

function spaces(len) {
  let out = '';
  for (let i = 0; i < len; i++) {
    out += ' ';
  }
  return out;
}

process.on('exit', function(code) {
  if (code === 1) {
    throw new Error('findLocaleStrings failed.');
  }
});
