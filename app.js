const app = require('express')()
const path = require('path')
const fs = require('fs')
var ffmpeg = require('fluent-ffmpeg');
const port = 3000

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/thumbnail', (req, res) => {
    generateThumbnail()
    res.send('Thumbnail obtenido')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

function generateThumbnail() {
    console.log('Generando miniaturas')
    var proc = new ffmpeg(path.join(__dirname, '/public/videos/1_1080.mp4'))
    .takeScreenshots({
        count: 3,
        timemarks: [ '15', '30', '60'  ] // number of seconds
      }, path.join(__dirname, '/public/images'), function(err) {
      console.log('screenshots were saved')
    }) 
}