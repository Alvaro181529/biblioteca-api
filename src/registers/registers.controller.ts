import { Controller, Get, Body, Patch } from '@nestjs/common';
import { RegistersService } from './registers.service';
import { UpdateRegisterDto } from './dto/update-register.dto';
import { RegisterEntity } from './entities/register.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { CurrentUser } from 'src/users/utilities/decorators/current-user.decorator';

@Controller('registers')
export class RegistersController {
  constructor(private readonly registersService: RegistersService) {}

  @Get()
  async findOne(
    @CurrentUser() currentUser: UserEntity,
  ): Promise<RegisterEntity> {
    return await this.registersService.findOne(currentUser);
  }

  @Patch()
  async update(
    @Body() updateRegisterDto: UpdateRegisterDto,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return await this.registersService.update(updateRegisterDto, currentUser);
  }
}
