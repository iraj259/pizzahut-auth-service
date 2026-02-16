import { Repository } from "typeorm"
import { User } from "../entity/User"
import { UserData } from "../types"
import createHttpError from "http-errors";
import { Roles } from "../contants";

export class UserService {
    constructor(private userRepository:Repository<User>){

    }
    async create({firstName,lastName,email,password }:UserData){
        try {
             const user = await this.userRepository.save({
            firstName,
            lastName,
            email,
            password,
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