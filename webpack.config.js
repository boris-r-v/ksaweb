/**
 * Конфигурация webpack для сборки ksaweb.
 */
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const VersionFilePlugin = require('webpack-version-file-plugin');
const SemverWebpackPlugin = require('semver-webpack-plugin');

module.exports = {
    entry: {
        's': './src/app.js'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader',
                query: {
                    presets: ['env']
                }
            },
            // CSS: scss, css
            {
                test: /\.s?css$/,
                loaders: ['style-loader', 'css-loader']
            },
            // SVGs: svg, svg?something
            {
                test: /\.svg(\?.*$|$)/,
                loader: 'file-loader?name=/img/[name].[ext]'
            },
            // Images: png, gif, jpg, jpeg
            {
                test: /\.(png|gif|jpe?g)$/,
                loader: 'file-loader?name=/img/[name].[ext]'
            },
            // HTML: htm, html
            {
                test: /\.html?$/,
                loader: "file-loader?name=[name].[ext]"
            },
            // Font files: eot, ttf, woff, woff2
            {
                test: /\.(eot|ttf|woff2?)(\?.*$|$)/,
                loader: 'file-loader?name=/fonts/[name].[ext]'
            }
        ]},
    output: {
        filename: '[name].js',
        path: __dirname + '/dist'
    },
    plugins: [
        new HtmlWebpackPlugin({hash: true, title: 'KSAWEB'}),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery"
        }),
        new VersionFilePlugin({
			packageFile: path.join(__dirname, 'package.json'),
			template:    path.join(__dirname, 'version.ejs'),
			outputFile:  path.join( __dirname, 'dist', 'version.json')
		})
    ]
}