const path = require("path");
const webpack = require("webpack");
const editor = require("babylonjs-editor-webpack-progress");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");


module.exports = (_, argv) => {
  const entryPath = path.join(__dirname, "src/index.ts");
  const package = require("./package.json");

  return {
    mode: argv.mode || "production",
    entry: { "bundle": entryPath },
    output: {
      filename: "bundle.js",
      path: path.join(__dirname, "dist"),
      library: "game",
      libraryTarget: "umd",
    },
    module: {
      rules: [
        {
          test: /\.ts?$/,
          loader: "ts-loader",
          exclude: [
            path.join(__dirname, "node_modules"),
            path.join(__dirname, "dist"),
            path.join(__dirname, "projects"),
            path.join(__dirname, "scenes"),
          ],
        },
      ],
    },
    resolve: {
      extensions: [".ts", ".js"],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "src/index.html",
        inject: "body",
        favicon: "assets/favicon.ico",  
      }),
      new CopyWebpackPlugin({
        patterns: [
          { from: "scenes", to: "scenes" },
          { from: "assets", to: "assets" }, // si tu as aussi un dossier assets
        ],
      }),
      new webpack.BannerPlugin({
        banner: `${package.name} ${package.version} ${new Date().toString()}`,
      }),
      new webpack.WatchIgnorePlugin({
        paths: [/\.js$/, /\.d\.ts$/],
      }),
      editor.createProgressPlugin(new webpack.ProgressPlugin()),
    ],
    optimization: {
      minimize: argv.mode === "production",
      usedExports: true,
    },
    devtool: "source-map",
  };
};
