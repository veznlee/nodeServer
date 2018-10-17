var express = require("express");
var bodyParser = require("body-parser");
var app = express(); 

//文件读取依赖
var fs = require('fs');
var marked = require( "marked" );

//文件上传依赖
var multer = require('multer');
const UPLOAD_PATH = './uploads';
var upload = multer({ dest: UPLOAD_PATH });

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
    console.log("请求来啦，在处理之前刷一下存在感");
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

//读取文件返回txt
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

//读取文件返回json
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

/* 
//单个文件上传
app.post('/upload', upload.single('fileUpload'), function (req, res, next) {
    const { file } = req;
    fs.readFile(file.path, function(err, data) {
        fs.writeFile(`${UPLOAD_PATH}/${file.originalname}`, data, function (err) {
            if (err){
                res.json({ 
                    code:0,
                    file:file,
                    msg:err 
                })
            }else{
                res.json({
                    code:0,
                    file:file,
                    msg: '上传成功'
                });
            }
        });
    })
})
*/

//多文件上传
app.post('/multipartUpload', upload.array('fileUpload'), function (req, res, next) {
    const files  = req.files;
    console.log(files);
    const success = [];
    const fail = [];
    const result = new Promise((resolve, reject) => {
        files.map((v) => {
            fs.readFile(v.path, function(err, data) {
                fs.writeFile(`${UPLOAD_PATH}/${v.originalname}`, data, function(err, data) {
                    if (err){
                        reject(err);
                        fail.push({file:v});
                    }else{
                        success.push({file:v});
                        resolve('成功');
                    }
                })
            })
        })
    });
    result.then(r => {
        // res.json({
        //     code:0,
        //     success:success,
        //     fail:fail,
        //     msg: '上传成功'
        // });
        console.log(success);
    }).catch(err => {
        // res.json({
        //     code:-1,
        //     success:success,
        //     fail:fail,
        //     msg: err 
        // });
        console.log(fail);
    });
})


//文件上传所需代码
//设置文件上传路径和文件命名
var storage = multer.diskStorage({
    destination: function (req, file, cb){
        //文件上传成功后会放入uploads文件夹
        cb(null, './uploads')
    },
    filename: function (req, file, cb){
        //设置文件的名字为其原本的名字，也可以添加其他字符，来区别相同文件，例如file.originalname+new Date().getTime();利用时间来区分
        cb(null, file.originalname)
    }
});
var upload = multer({storage: storage});

//处理来自页面的ajax请求。single文件上传
app.post('/upload', upload.single('file'), function (req, res, next) {
    //拼接文件上传后的网络路径
	console.log("file:"+req.file.originalname)
    //res.end(req.file.originalname);
    res.json({
        code:0,
        file:req.file.originalname,
        path:'uploads/'+req.file.originalname,
        msg:''
    });
    // fs.readFile(file.path, function(err, data) {
    //     fs.writeFile(`${UPLOAD_PATH}/${file.originalname}`, data, function (err) {
    //         if (err){
    //             res.json({ 
    //                 code:0,
    //                 file:file,
    //                 msg:err 
    //             })
    //         }else{
    //             res.json({
    //                 code:0,
    //                 file:file,
    //                 msg: '上传成功'
    //             });
    //         }
    //     });
    // })
});
 
// 单域多文件上传：input[file]的 multiple=="multiple"
// app.post('/multipartUpload', upload.array('fileupload', 5), function(req, res, next) {
//     // req.files 是前端表单name=="imageFile" 的多个文件信息（数组）,限制数量5，应该打印看一下
//     var fileName = "";
//     console.log(req.file);
//     console.log(req.files);
//     // for (var i = 0; i < req.files.length; i++) {
//     //     // 图片会放在uploads目录并且没有后缀，需要自己转存，用到fs模块
//     //     // 对临时文件转存，fs.rename(oldPath, newPath,callback);
//     //     fileName+=req.files[i].originalname+";"
//     //     fs.rename(req.files[i].path, "uploads/" + req.files[i].originalname, function(err) {
//     //         if (err) {throw err;}
//     //         console.log('done!');
//     //     })
//     // }

//     res.writeHead(200, {"Access-Control-Allow-Origin": "*"});//允许跨域。。。
//     // req.body 将具有文本域数据, 如果存在的话
//     //  res.end(JSON.stringify(req.files)+JSON.stringify(req.body));
// 	console.log("fileName:"+fileName)
// 	res.end(fileName)
// })



app.listen(port,hostName,function(){
   console.log(`服务已开启，访问地址为http://${hostName}:${port}`);
});