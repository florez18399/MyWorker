const nodemailer = require('nodemailer');
const passwordMainMail = 'wanda18399LP';
const path = require('path');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'andresfflorez1999',
        pass: passwordMainMail
    }
});

module.exports = {
    sendEmail : (fileReport, receiver) => {
        console.log('ENviando email');
        var mailOptions = {
            from: 'andresfflorez1999@gmail.com',
            to: receiver,
            subject: 'Procesamiento de video',
            text: 'PDF con la imagen procesada',
            attachments: [
                {
                    filename: 'Reporte.pdf',
                    path: path.join(__dirname, '/public/reports/', fileReport),
                    contentType: "application/pdf",
                }
            ]
        };

        transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
                console.log(err);
            } else {
                console.log('EMAIL ENVIADO: ' + info.response);
            }
        });
    }
}

