const express=require('express');
const app=express();
const expressWs = require('express-ws')
expressWs(app) 
app.use(require('cors')());
app.use('/home',require('./routers/home'))
app.get('/',(req,res)=>{
    res.send('hello world')
})
app.use(function(err, req, res, next) {
    console.log(err);
    res.status(err.status || 500);
    res.send('error');
  });

app.listen(3000);

process.on('uncaughtException',(err)=>{
    console.log(err);
    console.log("发生了未知异常");
})