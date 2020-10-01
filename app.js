const express = require('express')
const app = express()
const path = require('path')
const fs = require('fs')
const multer = require('multer')
var ffmpeg = require('fluent-ffmpeg');
var jimp = require('jimp')
const { resolve } = require('path');
const { rejects } = require('assert');
const port = 3000
var pdfGenerator = require('./pdfGen')
var mailer = require('./mailer')

//----------------MULTER CONFIG -----------------
app.use(express.json());
app.use(express.urlencoded({extended: false}));
//app.use('/public/images',express.static(path.join(__dirname, 'public/images')));
const storage = multer.diskStorage({
    destination: path.join(__dirname, 'public/videos'),
    filename: (req, file, cb) => {  
        console.log(file);
        return cb(null, new Date().getTime() + path.extname(file.originalname));
    }
});
var upload = multer({storage}).single('file'); 
//--------------------------------
app.get('/upload', upload, (req, res) => {

    /**getColorPixels('thumbnail-at-292.8024-seconds.png').then(async (colorPixels) => {
        let majorColors = await getMajorColors(colorPixels)
        console.log(majorColors);
    })**/
    //test()
    console.log(req.file);
    console.log(req.body.email)
    if(req.file) {
        res.status(200).json({message: 'Guardado', filename: req.file.filename})
    }else {
        res.status(400).json({message: 'No se recibio ningun video' } )
    }
    
})

app.get('/thumbnail', upload, (req, res) => {
    let file, email
    if(req.file) {
        file = req.file.filename
        email = req.body.email
    }else {
        res.status(400).json({message: 'No se recibio ningun video' } )
    }
    generateThumbnail(file, (newFiles) => {
        processFiles = []
        let majorColors = []
        for (let i = 0; i < newFiles.length; i++) {
            processFiles.push(getColorPixels(newFiles[i]))
        }
        Promise.all(processFiles).then(async values => {
            majorColors = await getAllMajor(values)
            console.log(majorColors);
            pdfGenerator.generatePDF(file + '.pdf', majorColors, newFiles, (namePDF) => {
                mailer.sendEmail(namePDF, email)
            })
            res.status(200).json({message: 'El video esta siendo procesado' })
        })
    })

})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

function generateThumbnail(file, cb) {
    console.log('Generando miniaturas')
    let newFiles = []
    var proc = new ffmpeg(path.join(__dirname, '/public/videos/', file))
        .screenshots({
            timestamps: ['20%', '40%', '60%', '80%', '99%'],
            filename: file + '_thumb-at-%s-seconds.png',
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
            '253,252,251', '17,11,11',
            '0,0,15', '253,251,252',
            '0,0,13', '18,12,12',
            '237,236,235', '239,238,237',
            '236,235,233', '16,12,11'
        ],
        [
            '253,252,251', '17,11,11',
            '0,0,15', '253,251,252',
            '0,0,13', '16,12,11',
            '18,12,12', '236,235,233',
            '237,236,235', '238,237,236'
        ],
        [
            '253,252,251', '17,11,11',
            '0,0,15', '0,0,13',
            '253,251,252', '16,12,11',
            '18,12,12', '237,236,235',
            '236,235,233', '239,238,237'
        ],
        [
            '253,252,251', '17,11,11',
            '0,0,15', '253,251,252',
            '0,0,13', '16,12,11',
            '239,238,237', '18,12,12',
            '236,235,233', '255,252,251'
        ],
        [
            '253,252,251', '17,11,11',
            '0,0,15', '0,0,13',
            '253,251,252', '16,12,11',
            '18,12,12', '237,236,235',
            '236,235,233', '239,238,237'
        ]
    ]

    let newFiles = ['thumbnail-at-59.152-seconds.png', 'thumbnail-at-118.304-seconds.png', 'thumbnail-at-177.456-seconds.png', 'thumbnail-at-236.608-seconds.png', 'thumbnail-at-292.8024-seconds.png']
    pdfGenerator.generatePDF('test.pdf', majorColors, newFiles)
}