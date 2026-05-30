// Consultar dados do banco persistido

import { RepositorioUsuarios } from "./persistencia/RepositorioUsuarios.js";
import { RepositorioLivros } from "./persistencia/RepositorioLivros.js";
import { RepositorioEmprestimos } from "./persistencia/RepositorioEmprestimos.js";
import { prisma } from "./config/prismaClient.js";

async function consultar() {
  try {
    console.log("CONSULTANDO DADOS SALVOS NO BANCO\n");

    const repositorioUsuarios = new RepositorioUsuarios();
    const repositorioLivros = new RepositorioLivros();
    const repositorioEmprestimos = new RepositorioEmprestimos();

    // 1. Usuários
    console.log("1. Usuários no Banco:");
    const usuarios = await repositorioUsuarios.listarTodos();
    console.log(`Total: ${usuarios.length}`);
    usuarios.forEach((u) => console.log(`  • ${u.nome} (${u.email})`));

    // 2. Livros
    console.log("\n2. Livros no Banco:");
    const livros = await repositorioLivros.listarTodos();
    console.log(`Total: ${livros.length}`);
    livros.forEach((l) => console.log(`  • ${l.titulo} - ${l.autor}`));

    // 3. Empréstimos
    console.log("\n3. Empréstimos no Banco:");
    const emprestimos = await repositorioEmprestimos.listarTodos();
    console.log(`Total: ${emprestimos.length}`);

    const ativos = await repositorioEmprestimos.listarAtivos();
    console.log(`Ativos: ${ativos.length}`);

    const atrasados = await repositorioEmprestimos.listarAtrasados();
    console.log(`Atrasados: ${atrasados.length}`);

    console.log("\n Dados persistidos com sucesso no SQLite!");
  } catch (error) {
    console.error(" Erro:", error);
  } finally {
    await prisma.$disconnect();
  }
}

consultar();
