const app = require('express')()
const path = require('path')
const fs = require('fs')
var ffmpeg = require('fluent-ffmpeg');
var jimp = require('jimp')
const { resolve } = require('path');
const { rejects } = require('assert');
const port = 3000
var pdfGenerator = require('./pdfGen')

app.get('/', (req, res) => {
    
    /**getColorPixels('thumbnail-at-292.8024-seconds.png').then(async (colorPixels) => {
        let majorColors = await getMajorColors(colorPixels)
        console.log(majorColors);
    })**/
    test()
    res.send('Hello World!')
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
            pdfGenerator.generatePDF('test.pdf', majorColors, newFiles)
            res.send('Tu pdf se esta creando ')
        })
    })

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

function test() {
    majorColors = [
        [
            '23,19,4', '18,17,4',
            '5,6,0', '0,0,0',
            '6,5,0', '22,18,3',
            '9,8,0', '24,20,5',
            '8,6,0', '10,9,0'
        ],
        [
            '0,0,0', '1,1,0',
            '2,2,0', '3,1,0',
            '31,28,10', '17,16,3',
            '32,30,11', '2,0,0',
            '32,30,9', '8,6,0'
        ],
        [
            '8,13,12', '6,12,11',
            '9,15,13', '4,10,9',
            '5,11,10', '1,3,1',
            '3,5,3', '6,10,2',
            '10,16,15', '2,4,2'
        ],
        [
            '33,46,33', '34,47,34',
            '8,11,0', '35,48,35',
            '6,12,13', '34,47,33',
            '31,44,33', '6,13,1',
            '8,13,15', '9,15,16'
        ],
        [
            '1,0,0', '5,1,0',
            '0,0,0', '41,24,5',
            '4,0,0', '2,0,0',
            '42,25,6', '44,32,8',
            '6,2,0', '40,23,4'
        ]
    ]
    let newFiles = ['thumbnail-at-59.152-seconds.png','thumbnail-at-118.304-seconds.png','thumbnail-at-177.456-seconds.png','thumbnail-at-236.608-seconds.png', 'thumbnail-at-292.8024-seconds.png']
    pdfGenerator.generatePDF('test.pdf', majorColors, newFiles)
}