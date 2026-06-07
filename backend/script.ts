// Demonstração - Sistema de Biblioteca com Prisma

import { Aluno } from "./negocios/Aluno.js";
import { Professor } from "./negocios/Professor.js";
import { Admin } from "./negocios/Admin.js";
import { Livro } from "./negocios/Livro.js";
import { Emprestimo } from "./negocios/Emprestimo.js";
import { RepositorioUsuarios } from "./persistencia/RepositorioUsuarios.js";
import { RepositorioLivros } from "./persistencia/RepositorioLivros.js";
import { RepositorioEmprestimos } from "./persistencia/RepositorioEmprestimos.js";
import { prisma } from "./config/prismaClient.js";

async function main() {
  try {
    console.log("SISTEMA DE BIBLIOTECA\n");

    // 1. Usuários e Login
    console.log("1. Criando Usuários");
    const repositorioUsuarios = new RepositorioUsuarios();

    const admin = new Admin(
      1,
      "Ana Silva",
      "ana@biblioteca.com",
      "senha123",
      "Gerente Geral"
    );
    await repositorioUsuarios.adicionarAdmin(admin);
    console.log("Admin criado");

    const professor = new Professor(
      2,
      "Prof. Carlos",
      "carlos@universidade.com",
      "senha456",
      "Engenharia",
      "MAT001"
    );
    await repositorioUsuarios.adicionarProfessor(professor);
    console.log("Professor criado");

    const aluno = new Aluno(
      3,
      "João Silva",
      "joao@aluno.com",
      "senha789",
      2024,
      "Engenharia de Software",
      "ENG2024001"
    );
    await repositorioUsuarios.adicionarAluno(aluno);
    console.log("Aluno criado");

    // 2. Encapsulamento e Setters
    console.log("\n2. Testando Encapsulamento");
    aluno.nome = "João Pedro Silva";
    console.log("Nome atualizado:", aluno.nome);

    try {
      aluno.nome = "ab";
    } catch (error) {
      console.log("Validação funcionando:", (error as Error).message);
    }

    // 3. Login
    console.log("\n3. Autenticação");
    const usuarioLogado = await repositorioUsuarios.autenticar(
      "joao@aluno.com",
      "senha789"
    );
    console.log(usuarioLogado ? "Login bem-sucedido" : "Falha no login");

    // 4. Livros
    console.log("\n4. Criando Livros");
    const repositorioLivros = new RepositorioLivros();

    const livro1 = new Livro(
      1,
      "Clean Code",
      "Robert C. Martin",
      "Programação",
      2008,
      "Guia sobre código limpo e profissional",
      "disponível"
    );
    await repositorioLivros.adicionarLivro(livro1);

    const livro2 = new Livro(
      2,
      "Design Patterns",
      "Gang of Four",
      "Programação",
      1994,
      "Padrões de design essenciais",
      "disponível"
    );
    await repositorioLivros.adicionarLivro(livro2);

    const livro3 = new Livro(
      3,
      "Estruturas de Dados",
      "Loiane Groner",
      "Programação",
      2019,
      "Estruturas de dados em JavaScript",
      "disponível"
    );
    await repositorioLivros.adicionarLivro(livro3);

    console.log("3 livros adicionados");

    // 5. Arrays e Manipulação
    console.log("\n5. Manipulação de Arrays");
    const totalLivros = await repositorioLivros.contar();
    console.log("Total de livros:", totalLivros);

    const livrosPorAutor = await repositorioLivros.buscarPorAutor("Martin");
    console.log("Livros por autor 'Martin':", livrosPorAutor.length);

    const livrosOrdenados = await repositorioLivros.listarOrdenadosPorTitulo();
    livrosOrdenados.forEach((l) => console.log(`  • ${l.titulo}`));

    // 6. Empréstimos
    console.log("\n6. Criando Empréstimos");
    const repositorioEmprestimos = new RepositorioEmprestimos();

    // Criar empréstimos sem exemplar específico (exemplar_id = null)
    const emprestimo1 = new Emprestimo(1, aluno.idUsuario, 0);
    await repositorioEmprestimos.adicionarEmprestimo(emprestimo1);

    const dataVencida = new Date();
    dataVencida.setDate(dataVencida.getDate() - 5);
    const emprestimoAtrasado = new Emprestimo(
      2,
      aluno.idUsuario,
      0,
      new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      dataVencida
    );
    await repositorioEmprestimos.adicionarEmprestimo(emprestimoAtrasado);

    console.log("Empréstimo normal criado");
    console.log(
      "Empréstimo atrasado criado (dias de atraso:",
      emprestimoAtrasado.calcularDiasAtraso() + ")"
    );

    // 7. Estatísticas
    console.log("\n7. Estatísticas Finais");
    const totalUsuarios = await repositorioUsuarios.contar();
    console.log("Usuários no BD:", totalUsuarios);
    console.log("Livros no BD:", totalLivros);

    const totalEmprestimos = await repositorioEmprestimos.contar();
    console.log("Empréstimos no BD:", totalEmprestimos);

    const statsEmprestimos = await repositorioEmprestimos.obterEstatisticas();
    console.log("  - Ativos:", statsEmprestimos.ativos);
    console.log("  - Atrasados:", statsEmprestimos.atrasados);

    console.log("\n Todos os dados foram salvos no banco SQLite!");
  } catch (error) {
    console.error("Erro:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
