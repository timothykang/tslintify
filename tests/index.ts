import * as browserify from 'browserify';
import { fork } from 'child_process';
import * as test from 'tape';

import tslintify = require('../src/tslintify');

test('lint clean', function (t) {
    browserify()
        .plugin(tslintify)
        .add('./tests/lint/clean.ts')
        .on('error', () => t.fail('unexpected error'))
        .bundle()
        .on('end', () => t.end())
        .resume();
});

test('lint dirty', function (t) {
    t.plan(1);

    browserify()
        .plugin(tslintify)
        .add('./tests/lint/dirty.ts')
        .on('error', error => {
            if (error.indexOf('[1, 1]: " should be \'') !== -1) {
                t.pass('quotemark');
            }
        })
        .bundle()
        .on('end', () => t.end())
        .resume();
});

test('resolve tslint.json', function (t) {
    t.plan(1);

    browserify()
        .plugin(tslintify)
        .add('./tests/tslint-json/dirty.ts')
        .on('error', error => {
            if (error.indexOf('[1, 1]: \' should be "') !== -1) {
                t.pass('quotemark');
            }
        })
        .bundle()
        .on('end', () => t.end())
        .resume();
});

test('project', function (t) {
    browserify()
        .plugin(tslintify, { project: '.' })
        .add('./tests/tslint-json/dirty.ts')
        .on('error', () => t.fail('unexpected error'))
        .bundle()
        .on('end', () => t.end())
        .resume();
});

test('warn API', function (t) {
    t.plan(1);

    browserify()
        .plugin(tslintify, { warn: true })
        .add('./tests/lint/dirty.ts')
        .on('warning', warning => {
            if (warning.indexOf('[1, 1]: " should be \'') !== -1) {
                t.pass('quotemark');
            }
        })
        .on('error', () => t.fail('unexpected error'))
        .bundle()
        .on('end', () => t.end())
        .resume();
});

test('warn CLI', function (t) {
    t.plan(1);

    const b = fork('node_modules/browserify/bin/cmd', [
        '-p',
        '[',
        './src/tslintify.ts',
        '--warn',
        ']',
        './tests/lint/dirty.ts',
    ], { silent: true });

    b.on('exit', code => {
        t[code === 0 ? 'pass' : 'fail'](`exit code: ${code}`);
        t.end();
    });
});
