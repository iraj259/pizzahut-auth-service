import "reflect-metadata"
import express from 'express'
import cookieParser from 'cookie-parser'
import logger from './config/logger'
import { HttpError } from 'http-errors'
import type { NextFunction, Request, Response } from 'express'; // types only
import authRouter from './routes/auth'
import tenantRouter from './routes/tenant'

import fs from 'fs'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import rsaPemToJwk from 'rsa-pem-to-jwk'

const app = express()
app.use(express.static("public"))
app.use(cookieParser())
app.use(express.json())


// dynamic JWKS route — add this **before** `app.use('/auth', authRouter)`
app.get('/.well-known/jwks.json', (req, res) => {
  const privateKey = fs.readFileSync('./certs/private.pem')
  const jwk = rsaPemToJwk(privateKey, { use: 'sig' }, 'public')
  res.json({ keys: [jwk] })
})

// if we make the function async the global error handler wont be able to catch it, the sol is to use next middleware but in v5 of express it handles this thing too
app.get('/', (req, res,)=>{
    res.send('welcome to the auth service')
})
app.use('/auth', authRouter)
app.use('/tenant', tenantRouter)

// global error handler and should always be placed at last
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err:HttpError,req:Request,res:Response,next:NextFunction)=>{
    logger.error(err.message)
    const statusCode = err.statusCode || err.status || 500
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