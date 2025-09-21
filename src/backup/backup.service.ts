import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

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
      '-h',
      this.dbHost,
      '-p',
      this.dbPort,
      '-U',
      this.dbUser,
      '-F',
      'c',
      '-b',
      '-v',
      '-f',
      backupFilePath,
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
  async ListBackupFiles(): Promise<{ fileName: string, date: string }[]> {
    const bdDir = path.join(process.cwd(), 'db/backups');
    try {
      const files = await promisify(fs.readdir)(bdDir);

      // Filtra los archivos .bak y extrae la fecha de cada archivo
      return files
        .filter((file: any) => file.endsWith('.bak')) // Filtra solo los archivos .bak
        .map((file: any) => {
          const dateStringMatch = file.match(/_(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z)/);
          if (dateStringMatch) {
            const fileDate = dateStringMatch[1];
            return { fileName: file, date: fileDate };
          }
          return { fileName: file, date: 'Fecha no disponible' }; // En caso de no poder extraer la fecha
        });
    } catch (err) {
      console.error('Error al listar los archivos de respaldo:', err);
      throw new Error('No se pudieron listar los archivos de respaldo');
    }
  }
  async DownloadBackupFile(fileName: string): Promise<Buffer> {
    const bdDir = path.join(process.cwd(), 'db/backups');
    const filePath = path.join(bdDir, fileName);

    if (fs.existsSync(filePath)) {
      return fs.promises.readFile(filePath);  // Devuelve el archivo como Buffer
    } else {
      throw new Error('El archivo no existe');
    }
  }
}
