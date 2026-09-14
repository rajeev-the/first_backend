import { ProfessionalsService } from './professionals.service';
import { CreateProfessionalProfileDto } from './dto/create-professional-profile.dto';
import { UpdateProfessionalProfileDto } from './dto/update-professional-profile.dto';
import { AddProfessionalServiceDto } from './dto/add-professional-service.dto';
import { SubmitKycDto } from './dto/submit-kyc.dto';
import { KycDocumentResponseDto, ProfessionalProfileDetailDto, ProfessionalServiceItemDto } from './dto/professional-response.dto';
import { DiscoverProfessionalsQueryDto } from './dto/discover-professionals-query.dto';
import { ProfessionalCardDto } from './dto/professional-card-response.dto';
export declare class ProfessionalsController {
    private readonly professionalsService;
    constructor(professionalsService: ProfessionalsService);
    findNearby(query: DiscoverProfessionalsQueryDto): Promise<ProfessionalCardDto[]>;
    getPublicProfile(id: string, lat?: number, lng?: number): Promise<ProfessionalProfileDetailDto>;
    createProfile(userId: string, dto: CreateProfessionalProfileDto): Promise<ProfessionalProfileDetailDto>;
    getMyProfile(userId: string): Promise<ProfessionalProfileDetailDto>;
    updateMyProfile(userId: string, dto: UpdateProfessionalProfileDto): Promise<ProfessionalProfileDetailDto>;
    addServices(userId: string, dto: AddProfessionalServiceDto): Promise<ProfessionalServiceItemDto[]>;
    getMyServices(userId: string): Promise<ProfessionalServiceItemDto[]>;
    submitKyc(userId: string, dto: SubmitKycDto): Promise<KycDocumentResponseDto>;
}
