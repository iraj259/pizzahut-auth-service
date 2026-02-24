import fs from 'fs'
import { NextFunction, Response } from "express";
import {JwtPayload, sign} from 'jsonwebtoken'
import { RegisterUserRequest } from "../types";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import path from 'path';
import createHttpError from 'http-errors';
import { Config } from '../config';
// import createHttpError from "http-errors";

export class AuthController {
    constructor(private userService: UserService, private logger:Logger) {
        this.userService = userService;
    }

    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        try {
            // validation
            const result = validationResult(req)
            if(!result.isEmpty()){
                return res.status(400).json({errors: result.array()})
            }
//             if(!email){
// const err = createHttpError(400, 'Email is required!')
// next(err)
// return
//             }
const {firstName, lastName, email, password} = req.body
            this.logger.debug('new request to register a user', {firstName, lastName, email, password:'******'})
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
            });
            this.logger.info('user has been registered', {id:user.id})
let privateKey:Buffer
try {
                privateKey = fs.readFileSync(path.join(__dirname, '../../certs/private.pem'))

} catch (error) {
    const err = createHttpError(500, 'error while reading priv key')
    next(err)
    console.log(error);
    
    return
}

            const payload:JwtPayload={
                sub:String(user.id),
                role:user.role
            }
            const accessToken = sign(payload,privateKey,{
                algorithm:'RS256',
                expiresIn:'1h',
                issuer:'auth-service',
            })
            const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!,{
                algorithm:'HS256',
                expiresIn:'1Y',
                issuer:'auth-service'
            })

            res.cookie('accessToken', accessToken, {
                domain:'localhost',
                sameSite:'strict',
                maxAge:1000*60*60,
                httpOnly:true
            })

              res.cookie('refreshToken', refreshToken, {
                domain:'localhost',
                sameSite:'strict',
                maxAge:1000*60*60*24*365,
                httpOnly:true
            })
            res.status(201).json({ id: user.id });
            res.status(201).json();
        } catch (error) {
            next(error);
        }
    }
}
