var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');


var app = express();
const port = 5050

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
/* app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'))); */
const memory = []


const generateHash = (length) => {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.><?/-_+={}[]@!#$%^&*()';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * 
charactersLength));
 }
 return result;
}

app.use('/shortner',(req,res,next)=>{
  console.log('request',req.body)
  const url = req.body.url
  if(memory.length > 0){
    const exist = memory.find(element => element.original === url)
    if(!exist){
      const hash = generateHash(5)
      const localUrl = `http://localhost:5050/redirect/${hash}`
      const elementShortner = {
        id:hash,
        original: url,
        converted: localUrl,
        timesVisited: 0
      }
      memory.push(elementShortner)
      req.body.newUrl = true
    }else{
      req.body.newUrl = false
    }

  }else{
    const hash = generateHash(5)
    const localUrl = `http://localhost:5050/redirect/${hash}`
    let elementShortner = {
      id:hash,
      original: url,
      converted: localUrl,
      timesVisited: 0
    }
    req.body.newUrl = true
    memory.push(elementShortner)
  }
  next()
})
app.post('/shortner', function(req, res, next) {
  console.log(req.body.newUrl)
  let index
  if(req.body.newUrl){
    index = memory.length-1
  }else{
    index = memory.findIndex(element => element.original === req.body.url)
  }
  res.json(memory[index])
});

app.get('/redirect/:hash',(req,res,next)=>{
  const hash = req.params.hash
  const getOriginalUrl = memory.find(element => element.id === hash)
  if(getOriginalUrl){
    res.redirect(getOriginalUrl.original)
  }else{
    res.json({error:'NotFound',message:'Url was not found'})
  }
});

app.listen(port,()=>{
  console.log(`Server is up and running on port ${port}`)
})