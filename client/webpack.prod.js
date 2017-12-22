var common = require('./webpack.common.js');
var webpack = require('webpack');
var merge = require('webpack-merge');
var UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = merge(common, {
    devtool: 'source-map',
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production')
            }
        }),
        // Webpack built-in UglifyJsPlugin doesn't work with webpack-dev-server version 2.8.0+
        new UglifyJsPlugin({
            sourceMap: true
        })
    ]
});
