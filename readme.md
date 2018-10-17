## 起步
1.创建一个文件夹
2.切换到文件夹路径，执行命令npm init
3.下载express, cnpm install --save express,
下载body-parser解析工具cnpm install --save body-parser
4.创建server.js文件
5.执行命令node server.js


post的四种格式
www-form-urlencoded,
这是http的post请求默认的数据格式，需要body-parser中间件的支持
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended:true
}));
app.post('/urlencoded', function(req, res){
    console.log(req.body);
    res.send(" post successfully!");
});


form-data
这种方式一般用于数据上传，需要中间件connect-multiparty的支持
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
app.post('/formdata',multipartMiddleware, function (req, res) {
  console.log(req.body);
  res.send("post successfully!");
});


application/json
body-parser中间件支持json解析, 添加中间件进行解析即可
app.use(bodyParser.json());


text/xml
body-parser默认不支持这种数据格式
解决方法：把请求体参数按照字符串读取出来,然后使用 xml2json 包把字符串解析成json对象，然后对json对象进行操作，方便得多。
注意：我们还是要使用 body-parse 得到字符串,然后再转化.
利用req上定义的事件 data 来获取http请求流, end 事件结束请求流的处理.
利用 xml2json 把上面得到的请求参数流(我们直接转化为字符串)转化为 json 对象.
demo如下：
var express = require('express');
var bodyParser = require('body-parser');
var xml2json=require('xml2json');
var app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));
app.post('/xml', function (req, res) {
  req.rawBody = '';//添加接收变量
  var json={};
  req.setEncoding('utf8');
  req.on('data', function(chunk) { 
    req.rawBody += chunk;
  });
  req.on('end', function() {
  json=xml2json.toJson(req.rawBody);
  res.send(JSON.stringify(json));
  }); 
});
app.listen(3000);



## 参考链接：
https://www.cnblogs.com/sunflowersjj/p/7897536.html

## 热更新
安装nodemon:
npm install -g nodemon
或者安装到本地
npm install nodemon --save

在项目目录下创建 nodemon.json 文件
···javascript
{
    "restartable": "rs",
    "ignore": [
        ".git",
        ".svn",
        "node_modules/**/node_modules"
    ],
    "verbose": true,
    "execMap": {
        "js": "node --harmony"
    },
    "watch": [
    ],
    "env": {
        "NODE_ENV": "development"
    },
    "ext": "js json"
}
```
restartable-设置重启模式 
ignore-设置忽略文件 
verbose-设置日志输出模式，true 详细模式 
execMap-设置运行服务的后缀名与对应的命令 
{ 
“js”: “node –harmony” 
} 
表示使用 nodemon 代替 node 
watch-监听哪些文件的变化，当变化的时候自动重启 
ext-监控指定的后缀文件名

启动运行
nodemon app.js