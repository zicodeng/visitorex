var common = require('./webpack.common.js');
var webpack = require('webpack');
var merge = require('webpack-merge');

module.exports = merge(common, {
    devtool: 'inline-source-map',
    devServer: {
        host: 'localhost',
        index: 'index.html',
        contentBase: './dist',
        inline: true,
        open: false,
        historyApiFallback: true,
        compress: true,
    },
});
