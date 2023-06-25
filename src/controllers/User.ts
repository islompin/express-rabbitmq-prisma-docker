import { Request, Response } from 'express';
import { hashed } from '../utils/hashed';
import { sign } from '../utils/jwt';
import { compare } from '../utils/compare';
import { PrismaClient } from '@prisma/client';
import { RabbitMQConfig } from '../config';

const prisma = new PrismaClient()

const Get = async (req: Request, res: Response): Promise<void> => {
    res.json(await prisma.user.findMany());
}

const GetId = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params

    res.json(await prisma.user.findUnique({ where: { id: +id } }));
}

const SignUp = async (req: Request, res: Response) => {
    let { username, email, password } = req.body
    password = await hashed(password);

    const msg = {
        action: 'REGISTER',
        data: { username, email, password },
    }

    const queue = "eventqueue"
    const producerConfig = new RabbitMQConfig();
    await producerConfig.connect()

    await producerConfig.createQueue(queue, { durable: true })
    await producerConfig.publishToQueue(queue, JSON.stringify(msg))
    await producerConfig.close()

    const foundUser = await prisma.user.findUnique({
        where: { email }
    })

    if(foundUser){
        res.json({
            status: 401,
            message: "email already exists",
        })
    }
    
    const user = await prisma.user.create({
        data: {
            username, password, email
        }
    })

    res.json({
        status: 201,
        message: "user created",
        data: user,
        token: sign({ id: user.id })
    })
}

const SignIn = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body

        const foundUser = await prisma.user.findUnique({
            where: { email }
        })
        if (foundUser) {
            if (await compare(password, foundUser.password) == true) {

                const queue = "eventqueue"
                const producerConfig = new RabbitMQConfig();
                await producerConfig.connect()

                const msg = {
                    action: 'LOGIN',
                    data: { email, password },
                }

                await producerConfig.createQueue(queue, { durable: true })
                await producerConfig.publishToQueue(queue, JSON.stringify(msg))
                await producerConfig.close()

                return res.json({
                    status: 200,
                    message: "User login successful",
                    token: sign({ id: foundUser.id }),
                    data: foundUser
                })
            } else {
                res.status(401).json({
                    status: 401,
                    message: "wrong email or password",
                    token: null,
                })
            }
        } else {
            res.status(401).json({
                status: 401,
                message: "wrong email or password",
                token: null,
            })
        }

    } catch (error) {
        console.log(error);
    }
}

export default {
    Get,
    GetId,
    SignUp,
    SignIn
}

