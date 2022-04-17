var express = require('express');
var { generateHash } = require('./helpers/utilities') 
var cors = require('cors')
var path = require('path');
var app = express();
const port = 5050

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const memory = []


app.use('/shortner',(req,res,next)=>{
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
  let index
  if(req.body.newUrl){
    index = memory.length-1
  }else{
    index = memory.findIndex(element => element.original === req.body.url)
  }
  res.status(200).json(memory[index])
});

app.get('/redirect/:hash',(req,res,next)=>{
  const hash = req.params.hash
  const getOriginalUrl = memory.find(element => element.id === hash)
  if(getOriginalUrl){
    res.status(200).redirect(getOriginalUrl.original)
  }else{
    res.status(404).json({error:'NotFound',message:'Url was not found'})
  }
});

app.listen(port,()=>{
  console.log(`Server is up and running on port ${port}`)
})