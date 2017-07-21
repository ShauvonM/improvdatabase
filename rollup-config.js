import rollup       from 'rollup';
import nodeResolve  from 'rollup-plugin-node-resolve'
import commonjs     from 'rollup-plugin-commonjs';
import uglify       from 'rollup-plugin-uglify';

export default {
    entry: 'aot-compile/src/main-aot.js',
    dest: 'public/dist.js',
    sourceMap: true,
    format: 'iife',
    onwarn: function(warning) {
        if (warning.code === 'THIS_IS_UNDEFINED') { return; }

        console.warn(warning.message);
    },
    plugins: [
        nodeResolve({jsnext: true, module: true}),
        commonjs({
            include: ['node_modules/rxjs/**', 'node_modules/showdown/dist/showdown.js', 'node_modules/ngx-color-picker/dist/**'],
            namedExports: {
                'node_modules/showdown/dist/showdown.js': [ 'Converter' ],
                'node_modules/ngx-color-picker/dist/index.js': [ 'ColorPickerModule' ]
            }
        }),
        uglify()
    ]
}