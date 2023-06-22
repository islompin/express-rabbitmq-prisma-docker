// import cors from 'cors';
import express, { Application } from 'express';
import bodyParser from 'body-parser';
import router from './routers';
import createMQConsumer from './cunsomer';


const app: Application = express();

const PORT = process.env.PORT || 8080



app.use(express.json());
app.use(bodyParser.json())
// app.use(cors())
app.use(router)
const AMQP_URL = "amqp://localhost"
const QUEUE_NAME = "eventqueue"
const consumer = createMQConsumer(AMQP_URL, QUEUE_NAME)
consumer()

app.listen(PORT, (): void => console.log(`http://localhost:${PORT}`));