import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserProfileResponse } from '../auth/interfaces/auth-response.interface';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserProfileResponse>;
}
