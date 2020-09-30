const app = require('express')()
const path = require('path')
const fs = require('fs')
var ffmpeg = require('fluent-ffmpeg');
var jimp = require('jimp')
const { resolve } = require('path');
const { rejects } = require('assert');
const port = 3000

app.get('/', (req, res) => {
    res.send('Hello World!')
    getColorPixels().then(async(colorPixels) => {
        let majorColors = await getMajorColors(colorPixels)
        console.log(majorColors); 
    })
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
        .screenshots({
            timestamps: ['20%', '40%', '60%', '80%', '99%'],
            filename: 'thumbnail-at-%s-seconds.png',
            folder: path.join(__dirname, '/public/images'),
            size: '200x140'
        }).on('filenames', function (filenames) {
            console.log('Archivos obtenidos: ' + filenames.join(', '))
        })
        .on('end', function () {
            console.log('Proceso completado');
        })
}

function getColorPixels() {
    let colors = []
    let promise = new Promise((resolve, rejects) => {
        jimp.read(path.join(__dirname, '/public/images/thumbnail-at-25-seconds.png'), (err, image) => {
            for (let i = 0; i < image.getWidth(); i++) {
                for (let j = 0; j < image.getHeight(); j++) {
                    const color = jimp.intToRGBA(image.getPixelColor(i, j))
                    colors.push(`${color.r},${color.g},${color.b}`)
                }
            }
            resolve(colors)
        })
    })
    return promise;
}

function getMajorColors(colorPixels) {
    let promise = new Promise((resolve, reject) => {
        let toCount = function (acc, color) {
            if (!acc[color]) {
                acc[color] = 1
            } else {
                acc[color] = acc[color] + 1
            }
            return acc
        }
        let colorsCount = colorPixels.reduce(toCount, {})
        //console.log(colorsCount);
        let order = Object.keys(colorsCount).sort(function (a, b) {
            return colorsCount[b] - colorsCount[a];
        });
        order = order.slice(0, 10)  
        resolve(order)
    })
    return promise
}