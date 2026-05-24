"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicoArmazenamento = void 0;
const minio_cliente_1 = __importDefault(require("../../utilitarios/minio-cliente"));
const stream_1 = require("stream");
const BUCKET_CAPAS = 'capas-livros';
const BUCKET_LIVROS = 'livros-pdfs';
class ServicoArmazenamento {
    async garantirBucket(nomeBucket) {
        const existe = await minio_cliente_1.default.bucketExists(nomeBucket);
        if (!existe) {
            await minio_cliente_1.default.makeBucket(nomeBucket, 'us-east-1');
        }
    }
    async enviarArquivo(nomeBucket, nomeArquivo, dados, tamanho) {
        await this.garantirBucket(nomeBucket);
        // Se for Buffer, converter para stream
        let stream = dados instanceof Buffer ? stream_1.Readable.from(dados) : dados;
        const tamanhoFinal = tamanho || (dados instanceof Buffer ? dados.length : undefined);
        await minio_cliente_1.default.putObject(nomeBucket, nomeArquivo, stream, tamanhoFinal);
        // Retornar URL do arquivo
        return `${nomeBucket}/${nomeArquivo}`;
    }
    async obterURLTemporaria(nomeBucket, nomeArquivo, expiracaoEmHoras = 24) {
        const expiracaoEmSegundos = expiracaoEmHoras * 3600;
        return await minio_cliente_1.default.presignedGetObject(nomeBucket, nomeArquivo, expiracaoEmSegundos);
    }
    async deletarArquivo(nomeBucket, nomeArquivo) {
        await minio_cliente_1.default.removeObject(nomeBucket, nomeArquivo);
    }
    async enviarCapa(nomeArquivo, dados) {
        return this.enviarArquivo(BUCKET_CAPAS, nomeArquivo, dados, dados.length);
    }
    async obterURLCapaTemporaria(nomeArquivo) {
        return this.obterURLTemporaria(BUCKET_CAPAS, nomeArquivo);
    }
    async deletarCapa(nomeArquivo) {
        await this.deletarArquivo(BUCKET_CAPAS, nomeArquivo);
    }
    async enviarLivroPDF(nomeArquivo, dados) {
        return this.enviarArquivo(BUCKET_LIVROS, nomeArquivo, dados, dados.length);
    }
    async obterURLLivroPDFTemporaria(nomeArquivo, expiracaoEmHoras = 24) {
        return this.obterURLTemporaria(BUCKET_LIVROS, nomeArquivo, expiracaoEmHoras);
    }
    async deletarLivroPDF(nomeArquivo) {
        await this.deletarArquivo(BUCKET_LIVROS, nomeArquivo);
    }
}
exports.ServicoArmazenamento = ServicoArmazenamento;
exports.default = new ServicoArmazenamento();
