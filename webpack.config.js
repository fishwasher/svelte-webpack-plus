const path = require("path");
const DirectoryNamedWebpackPlugin = require("directory-named-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const preprocess = require("svelte-preprocess");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const srcDir = path.resolve(__dirname, "src");
const distDir = path.resolve(__dirname, "public");

const IS_DEV = process.env.NODE_ENV === "development";
const MODE = IS_DEV ? "development" : "production";

module.exports = {
  target: "web",
  mode: MODE,
  entry: {
    bundle: ["./src/main.js"],
  },
  resolve: {
    alias: {
      svelte: path.resolve("node_modules", "svelte"),
    },
    extensions: [".mjs", ".js", ".scss", ".svelte"],
    mainFields: ["svelte", "browser", "module", "main"],

    modules: ["node_modules"],
    plugins: [new DirectoryNamedWebpackPlugin(true)],
  },

  output: {
    path: distDir,
    filename: "[name].js",
    chunkFilename: "[id].js",
  },

  module: {
    rules: [
      {
        test: /\.svelte$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "svelte-loader",
            options: {
              emitCss: !IS_DEV,
              hotReload: IS_DEV,
              preprocess: preprocess({
                postcss: true,
              }),
            },
          },
        ],
      },

      {
        test: /\.css$/,
        use: [
          { loader: IS_DEV ? "style-loader" : MiniCssExtractPlugin.loader },
          { loader: "css-loader" },
          { loader: "postcss-loader" },
        ],
      },
      {
        test: /\.s[ac]ss$/,
        use: [
          { loader: IS_DEV ? "style-loader" : MiniCssExtractPlugin.loader },
          { loader: "css-loader" },
          { loader: "postcss-loader" },
          {
            loader: "sass-loader",
            options: {
              sassOptions: {
                outputStyle: IS_DEV ? "expanded" : "compressed",
                precision: 8,
                includePaths: [path.resolve(srcDir, "styles")],
              },
            },
          },
        ],
      },
      {
        test: /\.less$/,
        use: [
          { loader: IS_DEV ? "style-loader" : MiniCssExtractPlugin.loader },
          { loader: "css-loader" },
          { loader: "postcss-loader" },
          {
            loader: "less-loader",
            options: {
              lessOptions: {
                includePath: [path.resolve(srcDir, "styles")],
              },
            },
          },
        ],
      },
    ],
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css",
    }),

    new HtmlWebpackPlugin({
      title: "Svelte App",
      version: Math.random().toString(32).slice(2, 10),
      chunks: ["index"],
      filename: "index.html",
      template: path.resolve(srcDir, "template.html"),
    }),
  ],

  watchOptions: {
    ignored: /node_modules/,
  },
  devtool: IS_DEV ? "cheap-module-eval-source-map" : "source-map",
  //devtool: prod ? false : "source-map",
  devServer: {
    contentBase: distDir,
    compress: true,
    port: 5000,
  },
};
