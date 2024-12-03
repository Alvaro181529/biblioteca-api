import { Controller, Get, Body, Patch, UseGuards } from '@nestjs/common';
import { RegistersService } from './registers.service';
import { UpdateRegisterDto } from './dto/update-register.dto';
import { RegisterEntity } from './entities/register.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { CurrentUser } from 'src/users/utilities/decorators/current-user.decorator';
import { AuthenticationGuard } from 'src/users/utilities/guards/authentication.guards';
import { AuthorizeGuard } from 'src/users/utilities/guards/authorization.guards';
import { Roles } from 'src/users/utilities/common/user-role.enum';

@Controller('registers')
export class RegistersController {
  constructor(private readonly registersService: RegistersService) {}

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN, Roles.ROOT]))
  @Get()
  async findOne(
    @CurrentUser() currentUser: UserEntity,
  ): Promise<RegisterEntity> {
    return await this.registersService.findOne(currentUser);
  }
  @UseGuards(AuthenticationGuard)
  @Patch()
  async update(
    @Body() updateRegisterDto: UpdateRegisterDto,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return await this.registersService.update(updateRegisterDto, currentUser);
  }
}
