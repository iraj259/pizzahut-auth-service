import { Repository } from "typeorm"
import { User } from "../entity/User"
import { LimitedUserData, UserData } from "../types"
import createHttpError from "http-errors";
import bcrypt from 'bcrypt'
export class UserService {
    constructor(private userRepository:Repository<User>){

    }
    async create({firstName,lastName,email,password, role, tenantId }:UserData){
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
            role,
            tenantId:tenantId?{id:tenantId} :undefined
        })
            return await this.userRepository.save(user);
        } catch (err) {
            const error = createHttpError(500, 'failed to store the data')
            throw error
            console.log(err);
            
        }


       

    }

    async findByEmailWithPassword(email:string){
        return await this.userRepository.findOne({where:{
            email
        },
        select:[
            "id",
            "firstName",
            "lastName",
            "email",
            "role",
            "password"
        ]
    })
    }

    
    async findById(id:number){
        return await this.userRepository.findOne({
            where:{
                id
            }
        })
    }
    async getAll(){
        return await this.userRepository.find()
    }
    async deleteById(userId:number){
        return await this.userRepository.delete(userId)
    }
    async update(
        userId: number,
        { firstName, lastName, role}: LimitedUserData,
    ) {
        try {
            return await this.userRepository.update(userId, {
                firstName,
                lastName,
                role,
                // email,
                // tenant: tenantId ? { id: tenantId } : null,
            });
        } catch (err) {
            const error = createHttpError(
                500,
                "Failed to update the user in the database",
            );
            throw error;
            console.log(err);
            
        }
    }
}