import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  mixin,
} from '@nestjs/common';

export const AuthorizeGuard = (allowedRoles: string[]) => {
  class RolesGuardMixin implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      const request = context.switchToHttp().getRequest();
      const userRoles = request?.currentUser?.rols;
      const rolesArray = verifyRols(userRoles);
      if (rolesArray.some((role) => allowedRoles.includes(role))) return true;
      throw new UnauthorizedException('Lo siento, usted no está autorizado');
    }
  }
  return mixin(RolesGuardMixin);
};

function verifyRols(userRoles: string | string[]): string[] {
  if (!userRoles)
    throw new UnauthorizedException('Roles no encontrados para el usuario');
  const rolesArray =
    typeof userRoles === 'string'
      ? userRoles.split(',').map((role) => role.trim())
      : Array.isArray(userRoles)
        ? userRoles
        : [];
  return rolesArray;
}
