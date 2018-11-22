import webpack from 'webpack';
import DashboardPlugin from 'webpack-dashboard/plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';

export default {
    mode: 'development',
    target: 'web',
    devtool: 'eval-source-map',
    context: path.resolve(__dirname + '/src/docs/'),
    entry: {
        app: ['babel-polyfill','./app.js']
    },
    output: {
        path: path.resolve(__dirname + '/docs/'),
        filename: '[name].js'
    },
    plugins: [
        new DashboardPlugin(),
        new HtmlWebpackPlugin({
            title: 'posthtml-beautify',
            minify: {
                collapseWhitespace: true
            },
            template: path.resolve(__dirname + '/src/docs/template.hbl'),
            filename: 'index.html',
            hash: true,
            appMountId: 'app'
        })
    ],
    resolveLoader: {
        modules: [path.resolve(__dirname, "src"), 'node_modules'],
        extensions: ['.js']
    },
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.esm.js'
        }
    },
    module: {
        rules: [
            {
                test: /\.hbs$/,
                loader: 'handlebars'
            },
            {
                test: /\.js?$/,
                loader: 'babel-loader'
            }
        ]
    }
};
