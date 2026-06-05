import { Livro } from "../negocios/Livro.js";
import { RepositorioLivros } from "../persistencia/RepositorioLivros.js";
import { ErroLivro, ErroValidacao } from "../excecoes/index.js";
import type { ResultadoOperacao } from "./ControladorUsuarios.js";

export class ControladorLivros {
  private repositorioLivros = new RepositorioLivros();

  async criarLivro(
    titulo: string,
    autor: string,
    genero: string,
    anoPublicacao: number,
    sinopse: string
  ): Promise<ResultadoOperacao<Livro>> {
    try {
      if (!titulo || !autor || !genero || !sinopse) {
        throw new ErroValidacao("Todos os campos de texto sao obrigatorios");
      }

      const livro = new Livro(
        0,
        titulo,
        autor,
        genero,
        anoPublicacao,
        sinopse
      );

      const livroCriado = await this.repositorioLivros.adicionarLivro(livro);
      return { sucesso: true, dados: livroCriado };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao criar livro");
    }
  }

  private tratarErro(erro: any, mensagemDefault: string): ResultadoOperacao {
    if (erro instanceof ErroLivro) {
      return {
        sucesso: false,
        erro: {
          mensagem: erro.message,
          tipo: "ErroLivro",
        },
      };
    }

    if (erro instanceof ErroValidacao) {
      return {
        sucesso: false,
        erro: {
          mensagem: erro.message,
          tipo: "ErroValidacao",
        },
      };
    }

    return {
      sucesso: false,
      erro: {
        mensagem: mensagemDefault,
        tipo: "ErroDesconhecido",
        detalhes: erro?.message || "Erro desconhecido",
      },
    };
  }
}
