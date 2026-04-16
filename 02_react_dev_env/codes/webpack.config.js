const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
module.exports = {
    mode: "development",
    entry: "./src/index.jsx",
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "build"),
        clean: true,
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: "babel-loader",
            },
        ],
    },
    resolve: {
        extensions: [".js", ".jsx"],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./index.html",
            favicon: "./favicon.ico",
        }),
    ],
    devServer: {
        static: "./build",
        open: true,
        port: 3000,
    },
    optimization: {
        minimize: false,
    },
};
