import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class FormDataJsonInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    if (request.is('multipart/form-data')) {
      const rawData = request.body.data; // Asume 'data' es donde tu JSON está almacenado como string
      if (typeof rawData === 'string') {
        try {
          const jsonData = JSON.parse(rawData);
          console.log('rawData:', rawData);
          console.log('jsonData', jsonData);
          // Asigna los datos parseados específicamente al campo 'data' del body
          request.body.data = jsonData;
        } catch (error) {
          // Manejo de error de parseo si es necesario
          console.error('Error parsing JSON data from FormData', error);
        }
      }
    }

    return next.handle().pipe(map((data) => data));
  }
}
