import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  // UseGuards,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserSignUpDto } from './dto/user-signup.dto';
import { UserEntity } from './entities/user.entity';
import { UserSignInDto } from './dto/user-signin.dto';
import { CurrentUser } from './utilities/decorators/current-user.decorator';
import { UpdatePasswordDto } from './dto/update-password';
import { AuthenticationGuard } from './utilities/guards/authentication.guards';
import { AuthorizeGuard } from './utilities/guards/authorization.guards';
// import { AuthorizeRoles } from './utilities/decorators/authorize-roles.decorator';
import { Roles } from './utilities/common/user-role.enum';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Post('signup')
  async signup(
    @Body() userSignUpDto: UserSignUpDto,
  ): Promise<{ user: UserEntity }> {
    return { user: await this.usersService.signup(userSignUpDto) };
  }

  @Post('signin')
  async signin(@Body() userSignInDto: UserSignInDto): Promise<{
    accessToken: string;
    refreshToken: string;
    user: UserEntity;
  }> {
    const user = await this.usersService.signin(userSignInDto);
    const accessToken = await this.usersService.accessToken(user);
    const refreshToken = await this.usersService.generateRefreshToken(user);
    return { accessToken, refreshToken, user };
  }

  @Post('refresh-token')
  async refreshAccessToken(@Body() body: { refreshToken: string }) {
    const { refreshToken } = body;
    const accessToken =
      await this.usersService.refreshAccessToken(refreshToken);
    return { accessToken };
  }

  @UseGuards(AuthenticationGuard)
  @Get('me')
  async getMeProfile(@CurrentUser() currentUser: UserEntity) {
    return await this.usersService.me(currentUser);
  }

  @UseGuards(AuthenticationGuard)
  @Get('recomendation')
  async getMeRecomendation(@CurrentUser() currentUser: UserEntity) {
    return await this.usersService.recomendations(currentUser);
  }

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN, Roles.ROOT]))
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserEntity> {
    return await this.usersService.findOne(+id);
  }

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN, Roles.ROOT]))
  @Get()
  async findAll(
    @Query('query') query: string = '',
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('type') type: string = 'true',
  ): Promise<any> {
    const pageNumber = parseInt(page, 10);
    const pageSizeNumber = parseInt(pageSize, 10);
    return await this.usersService.findAll(
      pageNumber,
      pageSizeNumber,
      query,
      type,
    );
  }

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN, Roles.ROOT]))
  @Post()
  async create(
    @Body() userSignUpDto: UserSignUpDto,
  ): Promise<{ user: UserEntity }> {
    return { user: await this.usersService.create(userSignUpDto) };
  }

  @UseGuards(AuthenticationGuard)
  @Post('update-password')
  async updatePassword(
    @Body() updatePasswordDto: UpdatePasswordDto,
    @CurrentUser() currentUser: UserEntity,
  ) {
    const userId = currentUser.id;
    return await this.usersService.updatePassword(userId, updatePasswordDto); // Llamamos al servicio para actualizar la contraseña
  }

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN, Roles.ROOT]))
  @Patch('activate/:id')
  async activate(
    @Param('id') id: string,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return await this.usersService.activate(+id, currentUser);
  }
  @UseGuards(AuthenticationGuard)
  @Patch('desactivate/:id')
  async desactivate(
    @Param('id') id: string,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return await this.usersService.desactivate(+id, currentUser);
  }
  @UseGuards(AuthenticationGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(+id, updateUserDto);
  }

  @UseGuards(AuthenticationGuard)
  @Delete('delete-account')
  async deleteUser(@CurrentUser() currentUser: UserEntity) {
    const id = currentUser.id;
    return await this.usersService.deleteAccount(+id, currentUser);
  }

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN, Roles.ROOT]))
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return await this.usersService.remove(+id, currentUser);
  }
}
