var amqp = require('amqplib/callback_api')

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
            durable: false
        })

        console.log('En espera..', queue)
        channel.consume(queue, (message) => {
            console.log('Mensaje recibido ', JSON.parse(message.content.toString()));
        }, { noAck : true})
    })
})

