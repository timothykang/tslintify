# tslintify

Browserify plugin for linting TypeScript.

* [Options](#options)
* [Usage](#usage)
* [Why a plugin?](#why-a-plugin)
* [License](#license)

## Options

Three TSLint options are supported (passed through to TSLint):

* `-r, --rules-dir`
* `-s, --formatters-dir`
* `-t, --format`

See [TSLint docs](https://github.com/palantir/tslint#cli-1) for more info.

Linter rules go into `tslint.json` at the project root.

## Usage

**Note:** If using plugin to transform TypeScript (e.g. `tsify`), `tslintify` must be specified/added first. 

CLI:
```sh
$ browserify -p [ tslintify -t stylish ] -p tsify app.ts
```

API:
```js
var browserify = require('browserify');
var tsify = require('tsify');
var tslintify = require('tslintify');

browserify()
    .plugin(tslintify, { format: 'stylish' })
    .add('app.ts')
    .bundle()
    ...
```

## Why a plugin?

`tslintify` was originally conceived as a transform, but became a plugin so that it could run before transform plugins like `tsify` (`browserify` loads all plugins before transforms).

## License

MIT
