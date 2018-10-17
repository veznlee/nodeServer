var express = require("express");
var bodyParser = require("body-parser"); 
var app = express(); 

//文件读取依赖
var fs = require('fs');
var marked = require( "marked" );

var hostName = '127.0.0.1';
var port = 1024;

app.use(bodyParser.json()); // 解析json application/json
/* 
bodyParser.urlencoded 用来解析 request 中 body的 urlencoded字符， 只支持utf-8的编码的字符,也支持自动的解析gzip和 zlib
当extended为false的时候，键值对中的值就为'String'或'Array'形式，为true的时候，则可为任何数据类型。 
*/
app.use(bodyParser.urlencoded({ extended: true }));// 解析表单 application/x-www-form-urlencoded

// app.use()用于在访问到最终目标之前做一些事情
app.use(function (req,res,next) {//不调用next就不继续往下走
    console.log("做点啥");
    next();
});


//all表示所有的方法，*表示所有的路径，一般放到最后
app.all('*', function(req, res, next) {  
    res.header("Access-Control-Allow-Origin", "*");  
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");  
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");  
    res.header("X-Powered-By",' 3.2.1')  
    res.header("Content-Type", "application/json;charset=utf-8");  
    next();  
});

//http://127.0.0.1:1024/get?hehe=1123
app.get("/get",function(req,res){
    console.log("请求url：",req.path)
    console.log("请求参数：",req.query)
    res.send("这是get请求");
})

//http://127.0.0.1:1024/post
app.post("/post",function(req,res){
    // 单独配置
    //res.setHeader("Content-Type", "application/json;charset=utf-8");
    console.log("请求参数：",req.path);
    console.log("请求参数：",req.body);
    var result = {code:200,msg:"post请求成功"};
    res.send(result);
});


app.post('/file', function(req, res) {
    var path="./file/test.txt";
    fs.readFile(path, function(err, data){
        if(err){
            console.log(err);
            res.send("文件不存在！");
        }else{
            //console.log(data);
            str = marked(data.toString());
            //console.log(str);
            res.json(str) ;
        } 
    });
});


app.post('/json', function(req, res) {
    //文件路径，__dirname为当前运行js文件的目录
    //var path = path.join(__dirname, 'file/test.json');
    var path="./file/data.json";

    var params = req.body;
    var page = params.pageNo || 1;
    var pageSize = params.pageSize || 10;
    if(page > 3){
        pageSize = 6;
    }
    if(page > 4){
        pageSize = 0;
    }

    fs.readFile(path,'utf8',function(err, data){
        if(err){
            console.log(err);
            res.send("文件不存在！");
        }else{
            //以文本文件的方式处理处理
            //str = marked(data.toString());
            //console.log(str);
            //res.json(str);

            var dataObj = JSON.parse(data);
            // console.log(dataObj);
            // console.log(dataObj.data);
            var data = dataObj.data.slice(0,pageSize);
            res.send({
                code:0,
                data:data,
                count:101,
                msg:''
            });
            // console.log(data);
            // res.send('请求成功');
        } 
    });
});




app.listen(port,hostName,function(){

   console.log(`服务器运行在http://${hostName}:${port}`);
});