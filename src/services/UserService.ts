import { Repository } from "typeorm"
import { User } from "../entity/User"
import { UserData } from "../types"
import createHttpError from "http-errors";
import { Roles } from "../contants";
import bcrypt from 'bcrypt'
export class UserService {
    constructor(private userRepository:Repository<User>){

    }
    async create({firstName,lastName,email,password }:UserData){
        const user = await this.userRepository.findOne({where: {email:email}})
        if(user){
            const err = createHttpError(400, 'email alr exists')
            throw err;
        }
        // hash the password
        const saltRounds = 10
        const hashedPassword = await bcrypt.hash(password, saltRounds)
        try {
            const user = await this.userRepository.save({
            firstName,
            lastName,
            email,
            password:hashedPassword,
            role:Roles.CUSTOMER
        })
            return await this.userRepository.save(user);
        } catch (err) {
            const error = createHttpError(500, 'failed to store the data')
            throw error
            console.log(err);
            
        }


       

    }
}