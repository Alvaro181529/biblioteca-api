import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class BackupService {
  private readonly dbHost = process.env.DB_HOST || 'localhost';
  private readonly dbPort = process.env.DB_PORT || '5432';
  private readonly dbUser = process.env.DB_USERNAME || 'postgres';
  private readonly dbName = process.env.DB_DATABASE || 'biblioteca';
  private readonly dbPassword = process.env.DB_PASSWORD || '';

  async createBackup(): Promise<string> {
    // Generar nombre de archivo con timestamp
    const backupFileName = `${this.dbName}_backup_${new Date().toISOString()}.bak`;

    // Ruta hacia la carpeta 'bd' (ubicada en la raíz del proyecto)
    const bdDir = path.join(process.cwd(), 'db/backups');
    if (!fs.existsSync(bdDir)) {
      fs.mkdirSync(bdDir, { recursive: true });
    }
    const backupFilePath = path.join(bdDir, backupFileName);

    // Preparar argumentos de pg_dump
    const args = [
      '-h', this.dbHost,
      '-p', this.dbPort,
      '-U', this.dbUser,
      '-F', 'c',
      '-b',
      '-v',
      '-f', backupFilePath,
      this.dbName,
    ];


    return new Promise<string>((resolve, reject) => {
      const child = spawn('pg_dump', args, {
        env: { ...process.env, PGPASSWORD: this.dbPassword },
      });

      // child.stdout.on('data', (data) => console.log(`[pg_dump stdout]: ${data}`));
      // child.stderr.on('data', (data) => console.error(`[pg_dump stderr]: ${data}`));

      child.on('error', (err) => {
        console.error('Error al iniciar pg_dump:', err);
        reject(err);
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve(backupFilePath);
        } else {
          reject(new Error(`pg_dump terminó con código ${code}`));
        }
      });
    });
  }
}
