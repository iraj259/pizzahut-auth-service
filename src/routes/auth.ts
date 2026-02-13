import express from 'express'
import { AuthController } from '../controllers/AuthController.ts'

const router = express.Router()
const authController = new AuthController

// routes
router.post('/register', authController.register)

export default router
