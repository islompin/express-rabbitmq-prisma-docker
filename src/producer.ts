import amqp, { Connection } from 'amqplib/callback_api'

const createMQProducer = (amqpUrl: string, queueName: string,msg:string) => {
    console.log('Connecting to RabbitMQ...')
    let ch: any
    amqp.connect(amqpUrl, (errorConnect: Error, connection: Connection) => {
        if (errorConnect) {
            console.log('Error connecting to RabbitMQ: ', errorConnect)
            return
        }

        connection.createChannel((errorChannel, channel) => {
            if (errorChannel) {
                console.log('Error creating channel: ', errorChannel)
                return
            }

            ch = channel
            ch?.assertQueue(queueName)
            console.log('Created chanel')
        })
    })
    return ch?.sendToQueue(queueName, Buffer.from(msg))
        
    
}

export default createMQProducer