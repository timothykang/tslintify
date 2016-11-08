import { BrowserifyObject, InputFile } from 'browserify';
import { readFileSync } from 'fs';
import { PassThrough, Transform } from 'stream';
import * as Linter from 'tslint';
import { findConfiguration } from 'tslint/lib/configuration';
import { findConfigFile, getSupportedExtensions, parseConfigFileTextToJson, sys } from 'typescript';

declare module 'typescript' {
    // stub method missing from typescript.d.ts
    // tslint:disable-next-line:no-unused-variable
    function getSupportedExtensions(options): string[];
}

export = function (b: BrowserifyObject, options) {
    const baseDir = options.basedir || process.cwd();
    const tsConfigFile = findConfigFile(baseDir, sys.fileExists);
    const parsed = parseConfigFileTextToJson(tsConfigFile, readFileSync(tsConfigFile, 'UTF-8'));
    const extensions = getSupportedExtensions(parsed.config.compilerOptions) || [];

    b.transform(function (file: InputFile) {
        if (
            typeof file !== 'string' ||
            file.lastIndexOf('.') === -1 ||
            extensions.indexOf(file.slice(file.lastIndexOf('.'))) === -1
        ) {
            return new PassThrough();
        }

        let buffer = new Buffer(0);

        const transform = new Transform({
            transform: (chunk, encoding, callback) => {
                buffer = Buffer.concat([
                    buffer,
                    typeof chunk === 'string' ? new Buffer(chunk, encoding) : chunk,
                ]);

                callback(null, chunk);
            },
        });

        transform.on('finish', () => {
            const linter = new Linter(file, buffer.toString(), {
                configuration: findConfiguration(null, file),
                formatter: options.t || options.format || 'prose',
                formattersDirectory: options.s || options['formatters-dir'],
                rulesDirectory: options.r || options['rules-dir'],
            });
            const result = linter.lint();

            if (result.failureCount) {
                process.stderr.write(result.output);
            }
        });

        return transform;
    });
};
