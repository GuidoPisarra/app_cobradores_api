import { ClientProxy } from '@nestjs/microservices';
export declare class UsersController {
    private client;
    constructor(client: ClientProxy);
    getAll(): Promise<any>;
}
