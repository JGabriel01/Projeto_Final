import { Aluno } from "./negocios/Aluno.js";
import { Professor } from "./negocios/Professor.js";
import { Admin } from "./negocios/Admin.js";
import { Livro } from "./negocios/Livro.js";
import { Emprestimo } from "./negocios/Emprestimo.js";
import { Exemplar } from "./negocios/Exemplar.js";
import { Reserva } from "./negocios/Reserva.js";
import { Multa } from "./negocios/Multa.js";
import { Notificacao } from "./negocios/Notificacao.js";
import {
  ControladorUsuarios,
  ControladorLivros,
  ControladorEmprestimos,
} from "./controller/index.js";
import {
  ErroEmail,
  ErroSenha,
  ErroValidacao,
  ErroLivro,
  ErroReserva,
} from "./excecoes/index.js";
import { prisma } from "./config/prismaClient.js";

const EMAIL_ALUNO_DEMO = "maria@aluno.com";

async function main() {
  console.log("\n========================================");
  console.log("Sistema de Biblioteca — Entrega 2");
  console.log("Herança, polimorfismo e tratamento de erros.");
  console.log("========================================\n");

 
  console.log("Critério 1 — Herança e polimorfismo.\n");

  demonstrarHerancaPolimorfismo();

  
  console.log("\nCritério 2 — Validações e exceções.\n");

  demonstrarValidacoes();

 
  console.log("\nCritério 3 — Resiliência no fluxo.\n");

  await demonstrarResiliencia();

  console.log("\nDemonstração finalizada com êxito.\n");
}


function demonstrarHerancaPolimorfismo() {
  console.log("1. Criação de instâncias especializadas de usuário:\n");

  try {
    const aluno = new Aluno(
      1,
      1,
      "João Silva",
      "joao@aluno.com",
      "Senha123",
      2024,
      "Engenharia de Software",
      "ENG2024001"
    );
    console.log("Aluno:");
    console.log(`   - Nome: ${aluno.nome}`);
    console.log(`   - Email: ${aluno.email}`);
    console.log(`   - Nível: ${aluno.nivelAcesso}`);
    console.log(`   - Matrícula: ${aluno.matriculaAluno}`);
    console.log(`   - Curso: ${aluno.curso}\n`);

    
    const professor = new Professor(
      1,
      2,
      "Prof. Carlos",
      "carlos@universidade.com",
      "Senha456",
      "Engenharia",
      "PROF001"
    );
    console.log("Professor:");
    console.log(`   - Nome: ${professor.nome}`);
    console.log(`   - Email: ${professor.email}`);
    console.log(`   - Nível: ${professor.nivelAcesso}`);
    console.log(`   - Departamento: ${professor.departamento}`);
    console.log(`   - Matrícula: ${professor.matriculaProfessor}\n`);

    const admin = new Admin(1, 3, "Ana Silva", "ana@biblioteca.com", "Senha789", "Gerente Geral");
    console.log("Administrador:");
    console.log(`   - Nome: ${admin.nome}`);
    console.log(`   - Email: ${admin.email}`);
    console.log(`   - Nível: ${admin.nivelAcesso}`);
    console.log(`   - Cargo: ${admin.cargo}\n`);

    
  console.log("Polimorfismo — todos derivam de Usuário:");
    const usuarios: any[] = [aluno, professor, admin];
    usuarios.forEach((u, i) => {
      console.log(
        `  ${i + 1}. ${u.nome} - Nível: ${u.nivelAcesso} (tipo: ${u.constructor.name})`
      );
    });
  } catch (error: any) {
    console.error("Erro inesperado:", error.message);
  }
}


function demonstrarValidacoes() {
  console.log("2. Validações e exceções:\n");

  
  console.log("Teste 1 — Endereço de e-mail inválido:");
  try {
    const aluno = new Aluno(
      1,
      1,
      "João Silva",
      "email-invalido", 
      "Senha123",
      2024,
      "Engenharia",
      "ENG2024001"
    );
  } catch (error: any) {
    console.log(`Exceção registrada: ${error.message}`);
    console.log(`   Tipo da exceção: ${error.name}\n`);
  }

  
  console.log("Teste 2 — Senha sem número:");
  try {
    const aluno = new Aluno(
      1,
      1,
      "João Silva",
      "joao@aluno.com",
      "senhafraca", 
      2024,
      "Engenharia",
      "ENG2024001"
    );
  } catch (error: any) {
    console.log(`Exceção registrada: ${error.message}`);
    console.log(`   Tipo da exceção: ${error.name}\n`);
  }

  
  console.log("Teste 3 — Nome com menos de 3 caracteres:");
  try {
    const aluno = new Aluno(
      1,
      1,
      "Jo", 
      "joao@aluno.com",
      "Senha123",
      2024,
      "Engenharia",
      "ENG2024001"
    );
  } catch (error: any) {
    console.log(`Exceção registrada: ${error.message}`);
    console.log(`   Tipo da exceção: ${error.name}\n`);
  }

  
  console.log("Teste 4 — Título de livro inválido:");
  try {
    const livro = new Livro(1, "AB", "Robert C. Martin", "Programação", 2008, "Uma sinopse válida");
  } catch (error: any) {
    console.log(`Exceção registrada: ${error.message}`);
    console.log(`   Tipo da exceção: ${error.name}\n`);
  }

 
  console.log("Teste 5 — Empréstimo com data de vencimento anterior:");
  try {
    const dataSaida = new Date("2024-01-15");
    const dataVencimento = new Date("2024-01-10"); 
    const emprestimo = new Emprestimo(1, 1, 1, dataSaida, dataVencimento);
  } catch (error: any) {
    console.log(`Exceção registrada: ${error.message}`);
    console.log(`   Tipo da exceção: ${error.name}\n`);
  }

  
  console.log("Teste 6 — Exemplar com código de tombo inválido:");
  try {
    const exemplar = new Exemplar(1, "AB", "novo", "Prateleira A", 1); 
  } catch (error: any) {
    console.log(`Exceção registrada: ${error.message}`);
    console.log(`   Tipo da exceção: ${error.name}\n`);
  }
}


async function demonstrarResiliencia() {
  const controladorUsuarios = new ControladorUsuarios();
  const controladorLivros = new ControladorLivros();
  const controladorEmprestimos = new ControladorEmprestimos();

  console.log("3. Teste de resiliência com controladores e tratamento de exceções:\n");

  await limparDadosDemonstracao();

  
  console.log("Teste 1 — Criação de aluno com dados válidos:");
  const resultadoAluno = await controladorUsuarios.criarAluno(
    "Maria Silva",
    EMAIL_ALUNO_DEMO,
    "SenhaForte123",
    2024,
    "Engenharia de Software",
    "ENG2024002"
  );

  if (resultadoAluno.sucesso) {
    console.log("Operação concluída: aluno criado.");
    console.log(`   Nome: ${resultadoAluno.dados?.nome}`);
    console.log(`   Email: ${resultadoAluno.dados?.email}\n`);
  } else {
    console.log(`Falha na operação: ${resultadoAluno.erro?.mensagem}\n`);
  }

 
  console.log("Teste 2 — Tentativa de criação com e-mail duplicado:");
  const resultadoDuplicado = await controladorUsuarios.criarAluno(
    "Outro Nome",
    EMAIL_ALUNO_DEMO, 
    "OutraSenha123",
    2023,
    "Outro Curso",
    "ENG2023001"
  );

  if (!resultadoDuplicado.sucesso) {
    console.log(`Falha detectada e tratada:`);
    console.log(`   Mensagem: ${resultadoDuplicado.erro?.mensagem}`);
    console.log(`   Tipo: ${resultadoDuplicado.erro?.tipo}\n`);
  }

  
  console.log("Teste 3 — Criação de livro com dados válidos:");
  const resultadoLivro = await controladorLivros.criarLivro(
    "Clean Code",
    "Robert C. Martin",
    "Programação",
    2008,
    "Um guia essencial para escrever código profissional e mantível"
  );

  if (resultadoLivro.sucesso) {
    console.log("Operação concluída: livro criado.");
    console.log(`   Título: ${resultadoLivro.dados?.titulo}`);
    console.log(`   Autor: ${resultadoLivro.dados?.autor}\n`);
  } else {
    console.log(`Falha na operação: ${resultadoLivro.erro?.mensagem}\n`);
  }

  
  console.log("Teste 4 — Tentativa de criação de livro com sinopse inválida:");
  const resultadoLivroInvalido = await controladorLivros.criarLivro(
    "Livro X",
    "Autor Y",
    "Ficção",
    2024,
    "Curta" 
  );

  if (!resultadoLivroInvalido.sucesso) {
    console.log(`Falha detectada e tratada:`);
    console.log(`   Mensagem: ${resultadoLivroInvalido.erro?.mensagem}`);
    console.log(`   Tipo: ${resultadoLivroInvalido.erro?.tipo}\n`);
  }

  
  console.log("Teste 5 — Criação de empréstimo com dados válidos:");
  const usuarioIdEmprestimo = resultadoAluno.dados?.idUsuario ?? 1;
  const resultadoEmprestimo = await controladorEmprestimos.criarEmprestimo(
    usuarioIdEmprestimo,
    null
  );

  if (resultadoEmprestimo.sucesso) {
    console.log("Operação concluída: empréstimo registrado.");
    console.log(`   Status: ${resultadoEmprestimo.dados?.status}`);
    console.log(`   Atrasado: ${resultadoEmprestimo.dados?.estaAtrasado()}\n`);
  } else {
    console.log(`Falha na operação: ${resultadoEmprestimo.erro?.mensagem}\n`);
  }

  
  console.log("Teste 6 — Tentativa de criação de empréstimo com usuário inválido:");
  const resultadoEmprestimoInvalido = await controladorEmprestimos.criarEmprestimo(
    -1, 
    1
  );

  if (!resultadoEmprestimoInvalido.sucesso) {
    console.log(`Falha detectada e tratada:`);
    console.log(`   Mensagem: ${resultadoEmprestimoInvalido.erro?.mensagem}`);
    console.log(`   Tipo: ${resultadoEmprestimoInvalido.erro?.tipo}\n`);
  }
  await limparDadosDemonstracao();
}

async function limparDadosDemonstracao() {
  const usuarioDemo = await prisma.usuario.findUnique({
    where: {
      email: EMAIL_ALUNO_DEMO,
    },
    select: {
      id_usuario: true,
    },
  });

  if (usuarioDemo) {
    await prisma.emprestimo.deleteMany({
      where: {
        usuario_id: usuarioDemo.id_usuario,
      },
    });
  }

  await prisma.usuario.deleteMany({
    where: {
      email: EMAIL_ALUNO_DEMO,
    },
  });
}

main().catch((erro) => {
  console.error("Erro fatal:", erro);
  process.exitCode = 1;
}).finally(async () => {
  await prisma.$disconnect();
});

