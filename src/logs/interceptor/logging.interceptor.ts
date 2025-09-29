import { Injectable, ExecutionContext, CallHandler, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { LogsService } from '../logs.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    constructor(private readonly logsService: LogsService) { }

    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const action = request.method;
        const entity = request.url;
        const currentUser = request.currentUser;
        const entityId = request.params.id || null;
      
        // Filtrar si es una acción modificadora y no es refresh-token
        if (
          entity !== '/api/v2/users/refresh-token' &&
          (action === 'POST' || action === 'PATCH' || action === 'DELETE')
        ) {
          let changes = { ...request.body };
      
          // Si es el login, no guardar el password
          if (entity === '/api/v2/users/signin' && changes.password) {
            delete changes.password;
          }
      
          this.logsService.logAction({
            action,
            entity,
            entityId,
            changes,
            user: currentUser?.name || 'anonymous',
          });
        }
      
        return next.handle();
      }
}
