var path = require("path")

module.exports = {
  entry: "./src/index.js",

  output: {
    path: path.join(__dirname, "dist"),
    filename: 'main.js',
    publicPath: 'http://localhost:8080'
  },

  devServer: {
    publicPath: "/",
    contentBase: "./dist",
    hot: true
  },
};
