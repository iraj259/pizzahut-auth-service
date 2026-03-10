import { DataSource } from 'typeorm'
import request from 'supertest'
import createJWKSMock from 'mock-jwks'

import app from '../../src/app'
import { User } from '../../src/entity/User'
import { Tenant } from '../../src/entity/Tenant'
import { AppDataSource } from '../../src/config/data-source'
import { Roles } from '../../src/contants'

describe('User CRUD operations', () => {
    let connection: DataSource
    let jwks: ReturnType<typeof createJWKSMock>
    let adminToken: string

    beforeAll(async () => {
        jwks = createJWKSMock('http://localhost:5555')
        connection = await AppDataSource.initialize()
    })

    beforeEach(async () => {
        jwks.start()
        await connection.dropDatabase()
        await connection.synchronize()

        adminToken = jwks.token({
            sub: '1',
            role: Roles.ADMIN,
        })
    })

    afterEach(() => {
        jwks.stop()
    })

    afterAll(async () => {
        if (connection && connection.isInitialized) {
            await connection.destroy()
        }
    })

    describe('POST /user', () => {
        it('should create a new user', async () => {
            const tenantRepository = connection.getRepository(Tenant)
            const tenant = await tenantRepository.save({
                name: 'Test Tenant',
                address: 'Test Address',
            })

            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                password: 'password123',
                role: Roles.MANAGER,
                tenantId: tenant.id,
            }

            const response = await request(app)
                .post('/user')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(userData)

            expect(response.statusCode).toBe(201)

            const userRepository = connection.getRepository(User)
            const user = await userRepository.findOne({
                where: { email: userData.email },
            })
            expect(user).toBeDefined()
            expect(user?.firstName).toBe(userData.firstName)
        })

        it('should return 403 if non-admin tries to create a user', async () => {
            const customerToken = jwks.token({
                sub: '2',
                role: Roles.CUSTOMER,
            })

            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                password: 'password123',
                role: Roles.MANAGER,
            }

            const response = await request(app)
                .post('/user')
                .set('Cookie', [`accessToken=${customerToken}`])
                .send(userData)

            expect(response.statusCode).toBe(403)
        })
    })
})