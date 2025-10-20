// webpack.config.js
const path = require("path");

module.exports = {
  mode: "development",
  entry: "./src/TicTacToe.tsx",
  module: {
    rules: [{ test: /\.tsx?$/, use: "ts-loader", exclude: /node_modules/ }],
  },
  resolve: { extensions: [".tsx", ".ts", ".js"] },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
    publicPath: "/",
    hashFunction: "xxhash64", // avoids OpenSSL error on newer Node
  },
  devServer: {
    static: { directory: path.join(__dirname, "dist"), watch: true }, // was contentBase
    historyApiFallback: true, // if SPA routing
    host: "localhost",
    port: 9876,
    hot: true,
    client: { overlay: true },
    devMiddleware: { publicPath: "/" },
  },
};
