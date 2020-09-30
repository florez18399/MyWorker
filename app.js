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
    getColorPixels('thumbnail-at-292.8024-seconds.png').then(async (colorPixels) => {
        let majorColors = await getMajorColors(colorPixels)
        console.log(majorColors);
    })
})

app.get('/thumbnail', (req, res) => {
    generateThumbnail((newFiles) => {
        processFiles = []
        let majorColors = []
        for (let i = 0; i < newFiles.length; i++) {
            processFiles.push(getColorPixels(newFiles[i]))
        }
        Promise.all(processFiles).then(async values => {
            majorColors = await getAllMajor(values)
            console.log(majorColors);
        })
        console.log(':)' + majorColors);
    })
    res.send('Thumbnail obtenido')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

function generateThumbnail(cb) {
    console.log('Generando miniaturas')
    let newFiles = []
    var proc = new ffmpeg(path.join(__dirname, '/public/videos/1_1080.mp4'))
        .screenshots({
            timestamps: ['20%', '40%', '60%', '80%', '99%'],
            filename: 'thumbnail-at-%s-seconds.png',
            folder: path.join(__dirname, '/public/images'),
            size: '200x140'
        }).on('filenames', function (filenames) {
            newFiles = filenames
            console.log('Archivos obtenidos: ' + newFiles)
        })
        .on('end', function () {
            console.log('Proceso completado');
            cb(newFiles)
        })
}

function getColorPixels(file) {
    console.log('Obteniendo el color rgb de cada pixel');
    let colors = []
    let promise = new Promise((resolve, rejects) => {
        jimp.read(path.join(__dirname, '/public/images/', file), (err, image) => {
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
    console.log('Obteniendo los 10 colores que mas se encuentran en la imagen');
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
        console.log('Lista ordenada: ', order)
        resolve(order)
    })
    return promise
}

function getAllMajor(listImagesPixels) {
    getMajorsPromises = []
    listImagesPixels.forEach(element => {
        getMajorsPromises.push(getMajorColors(element))
    });
    return Promise.all(getMajorsPromises)
}