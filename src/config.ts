import amqp, { Message } from "amqplib";

const rabbitSettings={
    protocol:"amqp",
    hostname:"localhost",
    port:5672,
    username:"guest",
    password:"guest",
    vhost:"/",
    authMechanism:["PLAIN","AMQPLAIN","EXTERNAL"]
}

export class RabbitMQConfig {
  constructor() {
    this.channel = null;
  }
  channel:any

  async connect() {
    try {
      const conn = await amqp.connect(rabbitSettings);
      this.channel = await conn.createChannel();

      console.log(`Connected  RabbitMQ`);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async createQueue(queueName:string, options:any) {
    await this.channel.assertQueue(queueName, options);
  }

  async publishToQueue(queueName:string, message:string) {
    this.channel.sendToQueue(queueName, Buffer.from(message));
    console.log(`send message to ${queueName}`);
  }

  async subscribeToQueue(queueName:string, callback:any, options:any) {
    await this.channel.consume(
      queueName,
      (msg:Message) => {
        const parsed = JSON.parse(msg.content.toString())
        switch (parsed.action) {
            case 'REGISTER':
              console.log('Consuming REGISTER action', parsed.data)
              callback(parsed.data);
              break
            case 'LOGIN':
              console.log('Consuming LOGIN action', parsed.data)
              callback(parsed.data);
              break
            default:
              break
          }
        // this.channel.ack(msg);
      },
      options
    );
  }

  async close() {
    await this.channel.close();
  }
}
