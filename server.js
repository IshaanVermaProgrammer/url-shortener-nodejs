const express = require('express')
const mongoose = require('mongoose')
const ShortUrl = require('./models/shortUrl')
const app = express();
const NodeCache = require('node-cache')
const cacheData = new NodeCache({ stdTTL: 120, checkperiod: 1440, useClones: false })
mongoose.connect('mongodb+srv://<username>:<password>@cluster0.ck1c2.mongodb.net/<dbname>?retryWrites=true&w=majority', {
  useNewUrlParser: true, useUnifiedTopology: true
})
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(express.static("bootstrap"))
app.get('/', async (req, res) => {
  const responseData={shortUrls:cacheData.get("allUrls")};
  if (!responseData.shortUrls){
     responseData.shortUrls = await ShortUrl.find();
  }
  res.render('index', responseData);
})
app.post('/shortUrls', async (req, res) => {
  if (cacheData.get("allUrls").length+1>5){
          res.status(403).send("Maximum limit reached")
   }
  else {
  await ShortUrl.create({ full: req.body.fullUrl })
  res.redirect('/')
  }
})
app.get('/:shortUrl', async (req, res) => {
  const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl })
  if (shortUrl == null) return res.sendStatus(404)
  shortUrl.clicks++
  shortUrl.save()
  res.redirect(shortUrl.full)
})
app.listen(process.env.PORT || 5000);