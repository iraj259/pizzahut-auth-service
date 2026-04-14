import "reflect-metadata"
import express from 'express'
import cookieParser from 'cookie-parser'
import authRouter from './routes/auth'
import tenantRouter from './routes/tenant'
import userRouter from './routes/user'
import cors from 'cors'
import fs from 'fs'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import rsaPemToJwk from 'rsa-pem-to-jwk'

import { globalErrorHandler } from './middlewares/globalErrorHandler'

const app = express()
app.use(cors({
    origin:process.env.FRONTEND_URL,
    credentials:true
}))
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
app.use('/user', userRouter)

// global error handler and should always be placed at last
app.use(globalErrorHandler)

export default app