import { NextFunction, Response } from "express";

import { RegisterUserRequest } from "../types";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { validationResult } from "express-validator";
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
            res.status(201).json({ id: user.id });
            res.status(201).json();
        } catch (error) {
            next(error);
        }
    }
}
