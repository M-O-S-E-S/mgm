var webpack = require('webpack');
var path = require('path');
var fs = require('fs');

// list and enumerate external modules to leave as externals
var nodeModules = {
    fs: 'commonjs fs',
    readline: 'commonjs readline'
};
fs.readdirSync('node_modules')
    .filter(function (x) {
        return ['.bin'].indexOf(x) === -1;
    })
    .forEach(function (mod) {
        nodeModules[mod] = 'commonjs ' + mod;
    });

module.exports = {
    entry: ['../lib/scripts/template-existing-user.ts'],
    context: __dirname,
    node: {
        __filename: true,
        __dirname: true,
    },
    target: 'node',
    output: {
        filename: "./build/scripts/template-existing-user.js",
    },
    devtool: "source-map",
    resolve: {
        extensions: [".ts"]
    },

    plugins: [
        new webpack.DefinePlugin({
            $dirname: '++dirname',
        }),
    ],

    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
            { test: /\.ts$/, loader: "ts-loader" },
            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            //{ enforce: 'pre', test: /\.ts$/, loader: "source-map-loader" }
        ]
    },
    externals: nodeModules
};
