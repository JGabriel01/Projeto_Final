import minioClient from '../../utilitarios/minio-cliente';
import { Readable } from 'stream';

const BUCKET_CAPAS = 'capas-livros';
const BUCKET_LIVROS = 'livros-pdfs';

export class ServicoArmazenamento {
  async garantirBucket(nomeBucket: string): Promise<void> {
    const existe = await minioClient.bucketExists(nomeBucket);
    if (!existe) {
      await minioClient.makeBucket(nomeBucket, 'us-east-1');
    }
  }

  async enviarArquivo(
    nomeBucket: string,
    nomeArquivo: string,
    dados: Buffer | Readable,
    tamanho?: number
  ): Promise<string> {
    await this.garantirBucket(nomeBucket);

    // Se for Buffer, converter para stream
    let stream = dados instanceof Buffer ? Readable.from(dados) : dados;
    const tamanhoFinal = tamanho || (dados instanceof Buffer ? dados.length : undefined);

    await minioClient.putObject(nomeBucket, nomeArquivo, stream, tamanhoFinal);

    // Retornar URL do arquivo
    return `${nomeBucket}/${nomeArquivo}`;
  }

  async obterURLTemporaria(
    nomeBucket: string,
    nomeArquivo: string,
    expiracaoEmHoras: number = 24
  ): Promise<string> {
    const expiracaoEmSegundos = expiracaoEmHoras * 3600;
    return await minioClient.presignedGetObject(nomeBucket, nomeArquivo, expiracaoEmSegundos);
  }

  async deletarArquivo(nomeBucket: string, nomeArquivo: string): Promise<void> {
    await minioClient.removeObject(nomeBucket, nomeArquivo);
  }

  async enviarCapa(nomeArquivo: string, dados: Buffer): Promise<string> {
    return this.enviarArquivo(BUCKET_CAPAS, nomeArquivo, dados, dados.length);
  }

  async obterURLCapaTemporaria(nomeArquivo: string): Promise<string> {
    return this.obterURLTemporaria(BUCKET_CAPAS, nomeArquivo);
  }

  async deletarCapa(nomeArquivo: string): Promise<void> {
    await this.deletarArquivo(BUCKET_CAPAS, nomeArquivo);
  }

  async enviarLivroPDF(nomeArquivo: string, dados: Buffer): Promise<string> {
    return this.enviarArquivo(BUCKET_LIVROS, nomeArquivo, dados, dados.length);
  }

  async obterURLLivroPDFTemporaria(nomeArquivo: string, expiracaoEmHoras: number = 24): Promise<string> {
    return this.obterURLTemporaria(BUCKET_LIVROS, nomeArquivo, expiracaoEmHoras);
  }

  async deletarLivroPDF(nomeArquivo: string): Promise<void> {
    await this.deletarArquivo(BUCKET_LIVROS, nomeArquivo);
  }
}

export default new ServicoArmazenamento();
