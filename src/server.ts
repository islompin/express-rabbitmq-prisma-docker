import cors from 'cors';
import express, { Application } from 'express';
import bodyParser from 'body-parser';
import router from './routers';
import { RabbitMQConfig } from './config';


const app: Application = express();

const PORT = process.env.PORT || 8080



app.use(express.json());
app.use(bodyParser.json())
app.use(cors())
app.use(router)

const consumer=async()=>{
    const queue = "eventqueue"
    const consumerConfig= new RabbitMQConfig()
    await consumerConfig.connect()
    await consumerConfig.createQueue(queue,{durable:true})
    await consumerConfig.subscribeToQueue(queue,(message)=>{
        console.log("Received message : ", message);
    },{ noAck: true })
}
consumer()



app.listen(PORT, (): void => console.log(`http://localhost:${PORT}`));