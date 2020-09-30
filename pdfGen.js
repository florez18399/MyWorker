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
    generatePDF: (namePDF, listMajorColors, listFiles) => {
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
                    // lineWidth: 10,
                    lineColor: mycolor,
                })
                myX = myX + 30
            }
            docDefinition.content.push({canvas: canvas})
        }

        var pdfDoc = printer.createPdfKitDocument(docDefinition);
        pdfDoc.pipe(fs.createWriteStream(path.join(__dirname, '/public/reports/', namePDF)));
        pdfDoc.end();
    }

}
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }
  
  function rgbToHex(rgbString) {
    let rgb = rgbString.split(',')
    return "#" + componentToHex(rgb[0]) + componentToHex(rgb[1]) + componentToHex(rgb[2]);
  }