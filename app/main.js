require('dotenv').config();
const express = require('express')
const app = express()

app.use(express.static(__dirname + '/testing'))

app.get('Terraria', (req, res) => {
  res.sendFile(__dirname + '/testing/Terraria/index.html')
})

app.get('Amazon', (req, res) => {
  res.sendFile(__dirname + '/testing/Terraria/index.html')
})

app.get('Block_Racer', (req, res) => {
  res.sendFile(__dirname + '/testing/Block_Racer/index.html')
})

const Server = app.listen(process.env.PORT || 1234, () => {
  console.log(`200: Server online on: http://localhost:${Server.address().port} !!`);
})
