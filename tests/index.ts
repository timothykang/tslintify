import * as browserify from 'browserify';
import { fork } from 'child_process';
import { readFile, writeFile } from 'fs';
import { PassThrough } from 'stream';
import * as test from 'tape';

import tslintify = require('../src/tslintify');

test('passthrough on config error', (t) => {
    t.plan(2);

    browserify()
        .plugin(tslintify)
        .add('./tests/bad-config/empty.ts')
        .on('error', (error) => {
            if (error.indexOf('Failed to find TSLint configuration for ') !== -1) {
                t.pass('error');
            }
        })
        .on('transform', (transform) => {
            if (transform instanceof PassThrough) {
                t.pass('transform');
            }
        })
        .bundle()
        .on('end', () => t.end())
        .resume();
});

test('lint clean', (t) => {
    browserify()
        .plugin(tslintify)
        .add('./tests/lint/clean.ts')
        .on('error', (error) => t.fail(`unexpected error: ${error}`))
        .bundle()
        .on('end', () => t.end())
        .resume();
});

test('lint dirty', (t) => {
    t.plan(1);

    browserify()
        .plugin(tslintify)
        .add('./tests/lint/dirty.ts')
        .on('error', (error) => {
            if (error.indexOf('[1, 1]: " should be \'') !== -1) {
                t.pass('quotemark');
            }
        })
        .bundle()
        .on('end', () => t.end())
        .resume();
});

test('resolve tslint.json', (t) => {
    t.plan(1);

    browserify()
        .plugin(tslintify)
        .add('./tests/tslint-json/dirty.ts')
        .on('error', (error) => {
            if (error.indexOf('[1, 1]: \' should be "') !== -1) {
                t.pass('quotemark');
            }
        })
        .bundle()
        .on('end', () => t.end())
        .resume();
});

test('project', (t) => {
    browserify()
        .plugin(tslintify, { project: '.' })
        .add('./tests/tslint-json/dirty.ts')
        .on('error', () => t.fail('unexpected error'))
        .bundle()
        .on('end', () => t.end())
        .resume();
});

test('warn API', (t) => {
    t.plan(1);

    browserify()
        .plugin(tslintify, { warn: true })
        .add('./tests/lint/dirty.ts')
        .on('warning', (warning) => {
            if (warning.indexOf('[1, 1]: " should be \'') !== -1) {
                t.pass('quotemark');
            }
        })
        .on('error', () => t.fail('unexpected error'))
        .bundle()
        .on('end', () => t.end())
        .resume();
});

test('warn CLI', (t) => {
    t.plan(1);

    const b = fork('node_modules/browserify/bin/cmd', [
        '-p',
        '[',
        './src/tslintify.ts',
        '--warn',
        ']',
        './tests/lint/dirty.ts',
    ], { silent: true });

    b.on('exit', (code) => {
        t[code === 0 ? 'pass' : 'fail'](`exit code: ${code}`);
        t.end();
    });
});

test('fix', (t) => {
    t.plan(2);

    const FILE = './tests/fix/dirty.ts';
    const DIRTY = "'dirty'\n";
    const CLEAN = "'dirty';\n";

    readFile(FILE, (_dirtyError, dirtyContents) => {
        t.equal(dirtyContents.toString(), DIRTY);

        browserify()
            .plugin(tslintify, { fix: true })
            .add(FILE)
            .on('error', (error) => t.fail(`unexpected error: ${error}`))
            .bundle()
            .on('end', () => {
                readFile(FILE, (_cleanError, cleanContents) => {
                    t.equal(cleanContents.toString(), CLEAN);

                    writeFile(FILE, DIRTY, () => t.end());
                });
            })
            .resume();
    });
});
