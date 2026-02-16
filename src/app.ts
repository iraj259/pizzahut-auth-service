import "reflect-metadata"
import express from 'express'
import logger from './config/logger'
import { HttpError } from 'http-errors'
import type { NextFunction, Request, Response } from 'express'; // types only
import authRouter from './routes/auth'
const app = express()
app.use(express.json())
// if we make the function async the global error handler wont be able to catch it, the sol is to use next middleware but in v5 of express it handles this thing too
app.get('/', (req, res,)=>{
    res.send('welcome to the auth service')
})
app.use('/auth', authRouter)

// global error handler and should always be placed at last
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err:HttpError,req:Request,res:Response,next:NextFunction)=>{
    logger.error(err.message)
    const statusCode = err.statusCode || 500
    res.status(statusCode).json({
        errors:[
            {
                type:err.name,
                msg:err.message,
                path:'',
                location:'',
            }
        ]
    })
})

export default app