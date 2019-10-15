require('dotenv').config();
const express = require('express')
const app = express()

app.use(express.static(__dirname + '/testing'))
// app.use(express.static(__dirname + '/testing/v4'))

app.get('Terraria', (req, res) => {
  res.sendFile(__dirname + '/testing/Terraria/index.html')
})

app.get('Amazon', (req, res) => {
  res.sendFile(__dirname + '/testing/Terraria/index.html')
})

app.get('Block_Racer', (req, res) => {
  res.sendFile(__dirname + '/testing/Block_Racer/index.html')
})

app.get('/v5', (req, res) => {
  res.sendFile(__dirname + '/testing/v5/index.html')
})

app.get('/v5b', (req, res) => {
  res.sendFile(__dirname + '/testing/v5b/index.html')
})

app.get('/v5a', (req, res) => {
  res.sendFile(__dirname + '/testing/v5a/index.html')
})

app.get('/favicon.ico', (req, res) => {
  res.sendFile(__dirname + '/logos/logo_22_v2.png')
})

const Server = app.listen(process.env.PORT || 1234, () => {
  console.log(`200: Server online on: http://localhost:${Server.address().port} !!`);
})
