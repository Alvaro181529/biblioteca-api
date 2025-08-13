import { BadGatewayException } from '@nestjs/common';
import axios from 'axios';
import FormData from 'form-data';
import * as fs from 'fs';
import * as path from 'path';

export async function ExportImport(inventario: string, file: string): Promise<void> {
    const fastApiUrl = process.env.EXPORTS_CONVERT_URL + '/api/upload';
    const fastApiUrlSearch = process.env.EXPORTS_CONVERT_URL + '/api/search';
    let verifyFiles: any
    verifyFiles = await Virify(inventario, fastApiUrlSearch)
    if (!verifyFiles)
        verifyFiles = await FilesCreate(inventario, file, fastApiUrl)
    return verifyFiles
}
async function Virify(inventario: string, fastApiUrlSearch: string) {
    const verify = fastApiUrlSearch + '/' + inventario
    try {
        const response = await axios.get(verify);

        const res_midi = response.data.midi_exists
        const res_mxl = response.data.mxl_exists
        if (res_midi && res_mxl)    
            return response.data
    } catch (error: any) {
        throw new BadGatewayException (
            'Error send file: ' + error.message,
        );
    }
}
async function FilesCreate(inventario: string, file: string, fastApiUrl: string) {
    const uploadsDir = path.join('./uploads/document');
    const pdfPath = path.join(uploadsDir, file);
    if (!fs.existsSync(pdfPath)) {
        console.error('El archivo PDF no existe:', pdfPath);
        return;
    }
    const form = new FormData();
    form.append('title', inventario);
    form.append('file', fs.createReadStream(pdfPath));

    try {
        const response = await axios.post(fastApiUrl, form, {
            headers: form.getHeaders(),
            maxBodyLength: Infinity
        });

        return response.data
    } catch (error: any) {
        console.error('Error al enviar archivo a FastAPI:', error.response?.data || error.message);
    }
}