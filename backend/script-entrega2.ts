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

// Função principal de demonstração
async function main() {
  console.log("\n========================================");
  console.log("SISTEMA DE BIBLIOTECA - Entrega 2");
  console.log("Herança, Polimorfismo e Tratamento de Erros");
  console.log("========================================\n");

  // Demonstração de Herança e Polimorfismo
  console.log("📚 CRITÉRIO 1: HERANÇA E POLIMORFISMO\n");

  demonstrarHerancaPolimorfismo();

  // Demonstração de Validações e Exceções
  console.log("\n🔒 CRITÉRIO 2: VALIDAÇÕES E EXCEÇÕES\n");

  demonstrarValidacoes();

  // Demonstração de Resiliência com Try/Catch
  console.log("\n🛡️ CRITÉRIO 3: RESILIÊNCIA NO FLUXO\n");

  await demonstrarResiliencia();

  console.log("\n✅ Demonstração Concluída!\n");
}

// Demonstração de Herança e Polimorfismo
// Mostra que Usuario é base para Aluno, Professor e Admin
function demonstrarHerancaPolimorfismo() {
  console.log("1️⃣ Criando instâncias especializadas de Usuario:\n");

  try {
    // Aluno - Especialização de Usuario
    const aluno = new Aluno(
      1,
      "João Silva",
      "joao@aluno.com",
      "Senha123",
      2024,
      "Engenharia de Software",
      "ENG2024001"
    );
    console.log("✅ Aluno criado:");
    console.log(`   - Nome: ${aluno.nome}`);
    console.log(`   - Email: ${aluno.email}`);
    console.log(`   - Nível: ${aluno.nivelAcesso}`);
    console.log(`   - Matrícula: ${aluno.matriculaAluno}`);
    console.log(`   - Curso: ${aluno.curso}\n`);

    // Professor - Especialização de Usuario
    const professor = new Professor(
      2,
      "Prof. Carlos",
      "carlos@universidade.com",
      "Senha456",
      "Engenharia",
      "PROF001"
    );
    console.log("✅ Professor criado:");
    console.log(`   - Nome: ${professor.nome}`);
    console.log(`   - Email: ${professor.email}`);
    console.log(`   - Nível: ${professor.nivelAcesso}`);
    console.log(`   - Departamento: ${professor.departamento}`);
    console.log(`   - Matrícula: ${professor.matriculaProfessor}\n`);

    // Admin - Especialização de Usuario
    const admin = new Admin(3, "Ana Silva", "ana@biblioteca.com", "Senha789", "Gerente Geral");
    console.log("✅ Administrador criado:");
    console.log(`   - Nome: ${admin.nome}`);
    console.log(`   - Email: ${admin.email}`);
    console.log(`   - Nível: ${admin.nivelAcesso}`);
    console.log(`   - Cargo: ${admin.cargo}\n`);

    // Demonstrar Polimorfismo
    console.log("Polimorfismo - Todos herdam de Usuario:");
    const usuarios: any[] = [aluno, professor, admin];
    usuarios.forEach((u, i) => {
      console.log(
        `  ${i + 1}. ${u.nome} - Nível: ${u.nivelAcesso} (tipo: ${u.constructor.name})`
      );
    });
  } catch (error: any) {
    console.error("❌ Erro:", error.message);
  }
}

/**
 * Demonstração de Validações e Exceções Customizadas
 * Mostra que validações lançam exceções específicas
 */
function demonstrarValidacoes() {
  console.log("2️⃣ Testando validações rigorosas e exceções customizadas:\n");

  // Teste 1: Email inválido
  console.log("Teste 1 - Email inválido:");
  try {
    const aluno = new Aluno(
      1,
      "João Silva",
      "email-invalido", // Email sem @
      "Senha123",
      2024,
      "Engenharia",
      "ENG2024001"
    );
  } catch (error: any) {
    console.log(`✅ Exceção capturada: ${error.message}`);
    console.log(`   Tipo: ${error.name}\n`);
  }

  // Teste 2: Senha fraca
  console.log("Teste 2 - Senha sem número:");
  try {
    const aluno = new Aluno(
      1,
      "João Silva",
      "joao@aluno.com",
      "senhafraca", // Sem número
      2024,
      "Engenharia",
      "ENG2024001"
    );
  } catch (error: any) {
    console.log(`✅ Exceção capturada: ${error.message}`);
    console.log(`   Tipo: ${error.name}\n`);
  }

  // Teste 3: Nome muito curto
  console.log("Teste 3 - Nome com menos de 3 caracteres:");
  try {
    const aluno = new Aluno(
      1,
      "Jo", // Muito curto
      "joao@aluno.com",
      "Senha123",
      2024,
      "Engenharia",
      "ENG2024001"
    );
  } catch (error: any) {
    console.log(`✅ Exceção capturada: ${error.message}`);
    console.log(`   Tipo: ${error.name}\n`);
  }

  // Teste 4: Livro com título inválido
  console.log("Teste 4 - Livro com título muito curto:");
  try {
    const livro = new Livro(1, "AB", "Robert C. Martin", "Programação", 2008, "Uma sinopse válida");
  } catch (error: any) {
    console.log(`✅ Exceção capturada: ${error.message}`);
    console.log(`   Tipo: ${error.name}\n`);
  }

  // Teste 5: Empréstimo com data inválida
  console.log("Teste 5 - Empréstimo com data de vencimento anterior:");
  try {
    const dataSaida = new Date("2024-01-15");
    const dataVencimento = new Date("2024-01-10"); // Anterior à saída
    const emprestimo = new Emprestimo(1, 1, 1, dataSaida, dataVencimento);
  } catch (error: any) {
    console.log(`✅ Exceção capturada: ${error.message}`);
    console.log(`   Tipo: ${error.name}\n`);
  }

  // Teste 6: Exemplar com código de tombo inválido
  console.log("Teste 6 - Exemplar com código de tombo inválido:");
  try {
    const exemplar = new Exemplar(1, "AB", "novo", "Prateleira A", 1); // Código muito curto
  } catch (error: any) {
    console.log(`✅ Exceção capturada: ${error.message}`);
    console.log(`   Tipo: ${error.name}\n`);
  }
}

/**
 * Demonstração de Resiliência com Try/Catch
 * Usa controladores que capturam e tratam erros
 */
async function demonstrarResiliencia() {
  const controladorUsuarios = new ControladorUsuarios();
  const controladorLivros = new ControladorLivros();
  const controladorEmprestimos = new ControladorEmprestimos();

  console.log("3️⃣ Teste de Resiliência com Controladores e Try/Catch:\n");

  await limparDadosDemonstracao();

  // Teste 1: Criar aluno com dados válidos
  console.log("Teste 1 - Criar aluno com dados válidos:");
  const resultadoAluno = await controladorUsuarios.criarAluno(
    "Maria Silva",
    EMAIL_ALUNO_DEMO,
    "SenhaForte123",
    2024,
    "Engenharia de Software",
    "ENG2024002"
  );

  if (resultadoAluno.sucesso) {
    console.log("✅ Aluno criado com sucesso!");
    console.log(`   Nome: ${resultadoAluno.dados?.nome}`);
    console.log(`   Email: ${resultadoAluno.dados?.email}\n`);
  } else {
    console.log(`❌ Erro: ${resultadoAluno.erro?.mensagem}\n`);
  }

  // Teste 2: Tentar criar aluno com email duplicado
  console.log("Teste 2 - Tentar criar aluno com email duplicado:");
  const resultadoDuplicado = await controladorUsuarios.criarAluno(
    "Outro Nome",
    EMAIL_ALUNO_DEMO, // Email já existe
    "OutraSenha123",
    2023,
    "Outro Curso",
    "ENG2023001"
  );

  if (!resultadoDuplicado.sucesso) {
    console.log(`✅ Erro capturado e tratado:`);
    console.log(`   Mensagem: ${resultadoDuplicado.erro?.mensagem}`);
    console.log(`   Tipo: ${resultadoDuplicado.erro?.tipo}\n`);
  }

  // Teste 3: Criar livro com dados válidos
  console.log("Teste 3 - Criar livro com dados válidos:");
  const resultadoLivro = await controladorLivros.criarLivro(
    "Clean Code",
    "Robert C. Martin",
    "Programação",
    2008,
    "Um guia essencial para escrever código profissional e mantível"
  );

  if (resultadoLivro.sucesso) {
    console.log("✅ Livro criado com sucesso!");
    console.log(`   Título: ${resultadoLivro.dados?.titulo}`);
    console.log(`   Autor: ${resultadoLivro.dados?.autor}\n`);
  } else {
    console.log(`❌ Erro: ${resultadoLivro.erro?.mensagem}\n`);
  }

  // Teste 4: Tentar criar livro com sinopse muito curta
  console.log("Teste 4 - Tentar criar livro com sinopse inválida:");
  const resultadoLivroInvalido = await controladorLivros.criarLivro(
    "Livro X",
    "Autor Y",
    "Ficção",
    2024,
    "Curta" // Sinopse muito curta
  );

  if (!resultadoLivroInvalido.sucesso) {
    console.log(`✅ Erro capturado e tratado:`);
    console.log(`   Mensagem: ${resultadoLivroInvalido.erro?.mensagem}`);
    console.log(`   Tipo: ${resultadoLivroInvalido.erro?.tipo}\n`);
  }

  // Teste 5: Criar empréstimo com dados válidos
  console.log("Teste 5 - Criar empréstimo com dados válidos:");
  const usuarioIdEmprestimo = resultadoAluno.dados?.idUsuario ?? 1;
  const resultadoEmprestimo = await controladorEmprestimos.criarEmprestimo(
    usuarioIdEmprestimo,
    null
  );

  if (resultadoEmprestimo.sucesso) {
    console.log("✅ Empréstimo criado com sucesso!");
    console.log(`   Status: ${resultadoEmprestimo.dados?.status}`);
    console.log(`   Está atrasado: ${resultadoEmprestimo.dados?.estaAtrasado()}\n`);
  } else {
    console.log(`❌ Erro: ${resultadoEmprestimo.erro?.mensagem}\n`);
  }

  // Teste 6: Tentar criar empréstimo com usuário inválido
  console.log("Teste 6 - Tentar criar empréstimo com usuário inválido:");
  const resultadoEmprestimoInvalido = await controladorEmprestimos.criarEmprestimo(
    -1, // ID inválido
    1
  );

  if (!resultadoEmprestimoInvalido.sucesso) {
    console.log(`✅ Erro capturado e tratado:`);
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

// Executar demonstração
main().catch((erro) => {
  console.error("Erro fatal:", erro);
  process.exitCode = 1;
}).finally(async () => {
  await prisma.$disconnect();
});
