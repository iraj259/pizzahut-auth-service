"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const bcrypt_1 = __importDefault(require("bcrypt"));
class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    create(_a) {
        return __awaiter(this, arguments, void 0, function* ({ firstName, lastName, email, password, role, tenantId }) {
            const user = yield this.userRepository.findOne({ where: { email: email } });
            if (user) {
                const err = (0, http_errors_1.default)(400, 'email alr exists');
                throw err;
            }
            // hash the password
            const saltRounds = 10;
            const hashedPassword = yield bcrypt_1.default.hash(password, saltRounds);
            try {
                const user = yield this.userRepository.save({
                    firstName,
                    lastName,
                    email,
                    password: hashedPassword,
                    role,
                    tenantId: tenantId ? { id: tenantId } : undefined
                });
                return yield this.userRepository.save(user);
            }
            catch (err) {
                const error = (0, http_errors_1.default)(500, 'failed to store the data');
                throw error;
                console.log(err);
            }
        });
    }
    findByEmailWithPassword(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userRepository.findOne({ where: {
                    email
                },
                select: [
                    "id",
                    "firstName",
                    "lastName",
                    "email",
                    "role",
                    "password"
                ]
            });
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userRepository.findOne({
                where: {
                    id
                }
            });
        });
    }
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userRepository.find();
        });
    }
    deleteById(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.userRepository.delete(userId);
        });
    }
    update(userId_1, _a) {
        return __awaiter(this, arguments, void 0, function* (userId, { firstName, lastName, role }) {
            try {
                return yield this.userRepository.update(userId, {
                    firstName,
                    lastName,
                    role,
                    // email,
                    // tenant: tenantId ? { id: tenantId } : null,
                });
            }
            catch (err) {
                const error = (0, http_errors_1.default)(500, "Failed to update the user in the database");
                throw error;
                console.log(err);
            }
        });
    }
}
exports.UserService = UserService;
