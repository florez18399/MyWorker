var amqp = require('amqplib/callback_api')
const fs = require('fs');
const path = require('path')
const worker = require('./worker')

amqp.connect('amqp://localhost', (err, connection) => {
    if (err) {
        throw err
    }
    connection.createChannel((err, channel) => {
        if (err) {
            throw err
        }
        let queue = 'WorkQueue'
        channel.assertQueue(queue, {
            durable: true
        })
        channel.prefetch(1)
        console.log('En espera..', queue)
        channel.consume(queue, (message) => {
            let data =  JSON.parse(message.content.toString())
            console.log('Mensaje recibido ', data);
            let bufferImage = Buffer.from(data.buffer.data)
            //console.log(bufferImage);
            let pathFile = path.join(__dirname, '/public/videos/', data.filename)
            fs.writeFile(pathFile, bufferImage, 'base64', function(err) {
               if(err) {
                   throw err
               }
               worker.processVideo(data.filename, data.email, (msg) => {
                   console.log(msg);
                   channel.ack(message)
               })
            })
        }, { noAck : false})
    })
})

