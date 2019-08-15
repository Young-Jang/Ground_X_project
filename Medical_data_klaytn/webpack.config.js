const webpack = require('webpack')
const path = require('path')
const fs = require('fs')
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./index.js",
  mode: 'development',
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, 'dist')   
  },
  plugins: [   
    new webpack.DefinePlugin({
      DEPLOYED_ADDRESS: JSON.stringify(fs.readFileSync('deployedAddress', 'utf8').replace(/\n|\r/g, "")),
      DEPLOYED_ABI: fs.existsSync('deployedABI') && fs.readFileSync('deployedABI', 'utf8'),
    }),
    new CopyWebpackPlugin([{ from: "./src/index.html", to: "index.html"}])
  ],
  devServer: { 
    contentBase: path.join(__dirname, "dist"), 
    compress: true,
    disableHostCheck: true,
    host: "0.0.0.0",
    proxy: {
      // /oauth URL 경로는 아래 proxy 서버를 이용한다.
      '/oauth/' : {
        target: 'http://[::1]:8081',
        changeOrigin : true,
        pathRewrite: { // URL 경로를 변경하는 경우
          '/api': ''
        }
      },
      // /api URL 경로는 아래 proxy 서버를 이용한다.
      '/api/' : {
        target: 'http://[::1]:8081',
        changeOrigin : true
      }
    } 
  }
}
