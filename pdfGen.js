const pdfmake = require('pdfmake')
const path = require('path')
const fs = require('fs');
const fonts = {
    Roboto: {
        normal: path.join(__dirname, '/public/Roboto/Roboto-Regular.ttf'),
        bold: path.join(__dirname, '/public/Roboto/Roboto-Medium.ttf'),
        italics: path.join(__dirname, '/public/Roboto/Roboto-Italic.ttf'),
        bolditalics: path.join(__dirname, '/public/Roboto/Roboto-MediumItalic.ttf')
    }
};
module.exports = {
    generatePDF: (namePDF, listMajorColors, listFiles, cb) => {
        console.log('Generando PDF');
        var printer = new pdfmake(fonts);
        let docDefinition = {
            content: [
                { text: 'Miniaturas obtenidas', fontSize: 25, style: 'header' }
            ]
        }
        for (let i = 0; i < listFiles.length; i++) {
            const element = listFiles[i];
            const majorColors = listMajorColors[i]
            docDefinition.content.push({ image: path.join(__dirname, '/public/images/', element), margin: [20, 10, 20, 10] })
            canvas = []
            let myX = 10;
            for (let j = 0; j < majorColors.length; j++) { 
                let mycolor = rgbToHex(majorColors[j])
                canvas.push({
                    type: 'rect',
                    x: myX,
                    y: 0,
                    w: 20,
                    h: 20,
                    color: mycolor,
                    lineWidth: 1,
                    lineColor: 'black',
                })
                myX = myX + 30
            }
            docDefinition.content.push({canvas: canvas})
        }

        var pdfDoc = printer.createPdfKitDocument(docDefinition);
        pdfDoc.pipe(fs.createWriteStream(path.join(__dirname, '/public/reports/', namePDF)));
        cb(namePDF)
        pdfDoc.end();
    }

}
function componentToHex(c) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  
  function rgbToHex(rgbString) {
    let rgb = rgbString.split(',')
    //return "#" + componentToHex(rgb[0]) + componentToHex(rgb[1]) + componentToHex(rgb[2]);
    return "#" + ((1 << 24) + (parseInt(rgb[0]) << 16) + (parseInt(rgb[1]) << 8) + parseInt(rgb[2])).toString(16).slice(1);
}