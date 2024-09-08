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
      const result = request?.currentUser?.rols
        .map((role: string) => allowedRoles.includes(role))
        .find((val: boolean) => val === true);
      if (result) return true;
      throw new UnauthorizedException('Lo siento usted no esta autorizado');
    }
  }
  const guard = mixin(RolesGuardMixin);
  return guard;
};
