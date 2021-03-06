# tslintify

[![Build Status](https://travis-ci.org/timothykang/tslintify.svg?branch=master)](https://travis-ci.org/timothykang/tslintify)

Browserify plugin for linting TypeScript.

* [Options](#options)
* [Usage](#usage)
* [Why a plugin?](#why-a-plugin)
* [License](#license)

## Options

* `--warn`: Instead of emitting `error`, emit `warning` (when using API) or print error (when using CLI)

Some [TSLint options](https://github.com/palantir/tslint#cli-1) are supported:

* `--fix`
* `-p, --project`
* `-r, --rules-dir`
* `-s, --formatters-dir`
* `-t, --format`

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
    .plugin(tsify)
    .add('app.ts')
    .on('error', error => console.error(error))
    .bundle()
    ...
```

## Why a plugin?

`tslintify` was originally conceived as a transform, but became a plugin so that it could run before transform plugins like `tsify` (`browserify` loads all plugins before transforms).

## License

MIT
