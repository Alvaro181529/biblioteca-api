import { BadRequestException, Injectable } from '@nestjs/common';
// const Memcached = require('memcached');
import Memcached from 'memcached';

@Injectable()
export class MemcachedService {
  private memcachedClient: any;

  constructor() {
    const host: string = process.env.MEMCACHED_HOST || 'localhost';
    const port: string = process.env.MEMCACHED_PORT || '11211';

    try {
      this.memcachedClient = new Memcached(`${host}:${port}`);
      // Verifica la conexión
      this.memcachedClient.get('ping', (err, data) => {
        if (err) {
          throw new BadRequestException('Error al conectar a Memcached:', err);
        } else {
          console.log('Memcached está inicializado correctamente:', data);
        }
      });
    } catch (error) {
      throw new BadRequestException('Error al inicializar Memcached:', error);
    }
  }

  // Almacenar un valor en Memcached
  setCache(key: string, value: any, ttl: number = 3600): void {
    if (!this.memcachedClient) {
      throw new BadRequestException('Memcached no está inicializado correctamente');
      return;
    }
    this.memcachedClient.set(key, value, ttl, (err) => {
      if (err) {
        throw new BadRequestException('Error al almacenar en Memcached:', err);
      }
    });
  }

  // Obtener un valor de Memcached
  getCache(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.memcachedClient) {
        reject('Memcached no está inicializado correctamente');
      }
      this.memcachedClient.get(key, (err: any, data: any) => {
        if (err) {
          reject('Error al obtener de Memcached');
        } else {
          resolve(data);
        }
      });
    });
  }

  // Eliminar un valor de Memcached
  deleteCache(key: string): void {
    if (!this.memcachedClient) {
      throw new BadRequestException('Memcached no está inicializado correctamente');
      return;
    }
    this.memcachedClient.del(key, (err) => {
      if (err) {
        throw new BadRequestException('Error al eliminar de Memcached:', err);
      }
    });
  }

  // Limpiar toda la caché
  flushCache(): void {
    if (!this.memcachedClient) {
      throw new BadRequestException('Memcached no está inicializado correctamente');
      return;
    }
    this.memcachedClient.flush((err) => {
      if (err) {
        throw new BadRequestException('Error al limpiar la caché de Memcached:', err);
      }
    });
  }
}
