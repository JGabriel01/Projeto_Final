import { Livro } from "../negocios/Livro.js";
import { RepositorioLivros } from "../persistencia/RepositorioLivros.js";
import { ErroLivro, ErroNaoEncontrado, ErroValidacao } from "../excecoes/index.js";
import type { ResultadoOperacao } from "./ControladorUsuarios.js";

export class ControladorLivros {
  private repositorioLivros = new RepositorioLivros();

  async criarLivro(
    titulo: string,
    autor: string,
    genero: string,
    anoPublicacao: number,
    sinopse: string,
    status: string = "disponivel"
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
        sinopse,
        status
      );

      const livroCriado = await this.repositorioLivros.adicionarLivro(livro);
      return { sucesso: true, dados: livroCriado };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao criar livro");
    }
  }

  async listarTodos(): Promise<ResultadoOperacao<Livro[]>> {
    try {
      const livros = await this.repositorioLivros.listarTodos();
      return { sucesso: true, dados: livros };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao listar livros");
    }
  }

  async buscarPorId(id: number): Promise<ResultadoOperacao<Livro>> {
    try {
      if (typeof id !== "number" || id <= 0) {
        throw new ErroValidacao("ID deve ser um numero positivo");
      }

      const livro = await this.repositorioLivros.buscarPorId(id);
      if (!livro) {
        throw new ErroNaoEncontrado(`Livro com ID ${id} nao encontrado`);
      }

      return { sucesso: true, dados: livro };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao buscar livro");
    }
  }

  async atualizarLivro(
    id: number,
    dados: Partial<Livro>
  ): Promise<ResultadoOperacao<Livro>> {
    try {
      if (typeof id !== "number" || id <= 0) {
        throw new ErroValidacao("ID deve ser um numero positivo");
      }

      const livroAtualizado = await this.repositorioLivros.atualizar(id, dados);
      if (!livroAtualizado) {
        throw new ErroNaoEncontrado(`Livro com ID ${id} nao encontrado`);
      }

      return { sucesso: true, dados: livroAtualizado };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao atualizar livro");
    }
  }

  async excluirLivro(
    id: number
  ): Promise<
    ResultadoOperacao<{
      id: number;
      acao: "excluido" | "inativado";
      mensagem: string;
      livro?: Livro;
    }>
  > {
    try {
      if (typeof id !== "number" || id <= 0) {
        throw new ErroValidacao("ID deve ser um numero positivo");
      }

      const resultado = await this.repositorioLivros.removerOuInativar(id);
      if (!resultado) {
        throw new ErroNaoEncontrado(`Livro com ID ${id} nao encontrado`);
      }

      if (resultado.acao === "inativado") {
        return {
          sucesso: true,
          dados: {
            id,
            acao: "inativado",
            mensagem:
              "Livro possui historico vinculado, foi marcado como inativo e teve reservas pendentes canceladas.",
            livro: resultado.livro,
          },
        };
      }

      return {
        sucesso: true,
        dados: {
          id,
          acao: "excluido",
          mensagem: "Livro excluido do acervo.",
        },
      };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao excluir livro");
    }
  }

  async atualizarCapa(
    id: number,
    capaObjeto: string,
    capaUrl: string
  ): Promise<ResultadoOperacao<Livro>> {
    try {
      if (typeof id !== "number" || id <= 0) {
        throw new ErroValidacao("ID deve ser um numero positivo");
      }
      if (!capaObjeto || !capaUrl) {
        throw new ErroValidacao("Dados da capa sao obrigatorios");
      }

      const livroAtualizado = await this.repositorioLivros.atualizarCapa(
        id,
        capaObjeto,
        capaUrl
      );
      if (!livroAtualizado) {
        throw new ErroNaoEncontrado(`Livro com ID ${id} nao encontrado`);
      }

      return { sucesso: true, dados: livroAtualizado };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao atualizar capa do livro");
    }
  }

  async removerCapa(id: number): Promise<ResultadoOperacao<Livro>> {
    try {
      if (typeof id !== "number" || id <= 0) {
        throw new ErroValidacao("ID deve ser um numero positivo");
      }

      const livroAtualizado = await this.repositorioLivros.removerCapa(id);
      if (!livroAtualizado) {
        throw new ErroNaoEncontrado(`Livro com ID ${id} nao encontrado`);
      }

      return { sucesso: true, dados: livroAtualizado };
    } catch (erro: any) {
      return this.tratarErro(erro, "Erro ao remover capa do livro");
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

    if (erro instanceof ErroNaoEncontrado) {
      return {
        sucesso: false,
        erro: {
          mensagem: erro.message,
          tipo: "ErroNaoEncontrado",
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
