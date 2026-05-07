const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Populando banco...');
  // Deleta todos
  await prisma.multa.deleteMany();
  await prisma.emprestimo.deleteMany();
  await prisma.reserva.deleteMany();
  await prisma.livro.deleteMany();
  await prisma.usuario.deleteMany();

  const senhaHash1 = await bcrypt.hash('senha123', 10);
  const senhaHash2 = await bcrypt.hash('senha456', 10);

  const usuarios = await Promise.all([
    prisma.usuario.create({ data: { nome: 'Alice Silva', email: 'alice@example.com', senha: senhaHash1 } }),
    prisma.usuario.create({ data: { nome: 'Bruno Costa', email: 'bruno@example.com', senha: senhaHash2 } })
  ]);

  const livros = await Promise.all([
    prisma.livro.create({ data: { titulo: 'Dom Casmurro', autor: 'Machado de Assis', genero: 'Romance', ano: 1899, sinopse: 'Um clássico da literatura brasileira.' } }),
    prisma.livro.create({ data: { titulo: 'Clean Code', autor: 'Robert C. Martin', genero: 'Tecnologia', ano: 2008, sinopse: 'Práticas para escrever código limpo.' } }),
    prisma.livro.create({ data: { titulo: 'O Senhor dos Anéis', autor: 'J.R.R. Tolkien', genero: 'Fantasia', ano: 1954, sinopse: 'A épica jornada na Terra Média.' } })
  ]);

  // criar um empréstimo
  await prisma.emprestimo.create({ data: { usuarioId: usuarios[0].id, livroId: livros[0].id, dataEmprestimo: new Date(), dataVencimento: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14) } });

  console.log('População finalizada.');
  console.log('Teste: alice@example.com / senha123');
  console.log('Teste: bruno@example.com / senha456');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
