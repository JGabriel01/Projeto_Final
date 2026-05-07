const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const autenticacao = require('./middlewares/autenticacao');

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Validadores
function validarEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Health
app.get('/saude', (req, res) => res.json({ status: 'ok' }));

// === AUTENTICAÇÃO ===
app.post('/registrar', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    
    if (!nome || !email || !senha) {
      return res.status(422).json({ erro: 'Nome, email e senha são obrigatórios' });
    }
    
    if (!validarEmail(email)) {
      return res.status(422).json({ erro: 'Email inválido' });
    }
    
    if (senha.length < 6) {
      return res.status(422).json({ erro: 'Senha deve ter pelo menos 6 caracteres' });
    }
    
    const emailExiste = await prisma.usuario.findUnique({ where: { email } });
    if (emailExiste) {
      return res.status(409).json({ erro: 'Email já cadastrado' });
    }
    
    const senhaHash = await bcrypt.hash(senha, 10);
    const usuario = await prisma.usuario.create({
      data: { nome, email, senha: senhaHash }
    });
    
    const token = jwt.sign({ usuarioId: usuario.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao registrar' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    if (!email || !senha) {
      return res.status(422).json({ erro: 'Email e senha são obrigatórios' });
    }
    
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ erro: 'Email ou senha inválidos' });
    }
    
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Email ou senha inválidos' });
    }
    
    const token = jwt.sign({ usuarioId: usuario.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao fazer login' });
  }
});

// === LIVROS ===
app.get('/livros', async (req, res) => {
  try {
    const livros = await prisma.livro.findMany();
    res.json(livros);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao listar livros' });
  }
});

app.post('/livros', autenticacao, async (req, res) => {
  try {
    const { titulo, autor, genero, ano, sinopse } = req.body;
    
    if (!titulo || !autor || !genero || !ano || !sinopse) {
      return res.status(422).json({ erro: 'Campos obrigatórios: titulo, autor, genero, ano, sinopse' });
    }
    
    if (isNaN(ano) || ano < 0) {
      return res.status(422).json({ erro: 'Ano deve ser um número positivo' });
    }
    
    const livro = await prisma.livro.create({
      data: { titulo, autor, genero, ano: Number(ano), sinopse, disponivel: true }
    });
    res.status(201).json(livro);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao criar livro' });
  }
});

app.get('/livros/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const livro = await prisma.livro.findUnique({ where: { id } });
    if (!livro) return res.status(404).json({ erro: 'Livro não encontrado' });
    res.json(livro);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar livro' });
  }
});

app.put('/livros/:id', autenticacao, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { titulo, autor, genero, ano, sinopse, disponivel } = req.body;
    
    const livro = await prisma.livro.update({
      where: { id },
      data: { 
        titulo: titulo || undefined, 
        autor: autor || undefined, 
        genero: genero || undefined, 
        ano: ano ? Number(ano) : undefined, 
        sinopse: sinopse || undefined, 
        disponivel: disponivel !== undefined ? disponivel : undefined 
      }
    });
    res.json(livro);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao atualizar livro' });
  }
});

app.delete('/livros/:id', autenticacao, async (req, res) => {
  try {
    const id = Number(req.params.id);
    
    // Verifica se há empréstimos ativos
    const emprestimosAtivos = await prisma.emprestimo.findFirst({
      where: { livroId: id, dataDevolucao: null }
    });
    
    if (emprestimosAtivos) {
      return res.status(409).json({ erro: 'Não é possível deletar livro com empréstimos ativos' });
    }
    
    await prisma.livro.delete({ where: { id } });
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao deletar livro' });
  }
});

// === USUÁRIOS (PROTEGIDO) ===
app.get('/usuarios/perfil', autenticacao, async (req, res) => {
  try {
    const usuario = await prisma.usuario.findUnique({ 
      where: { id: req.usuarioId },
      include: { emprestimos: true, reservas: true, multas: true }
    });
    if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });
    
    const { senha, ...usuarioSemSenha } = usuario;
    res.json(usuarioSemSenha);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar perfil' });
  }
});

// === EMPRÉSTIMOS ===
app.get('/emprestimos/:usuarioId', autenticacao, async (req, res) => {
  try {
    const usuarioId = Number(req.params.usuarioId);
    
    // Usuário só pode ver seus próprios empréstimos
    if (req.usuarioId !== usuarioId) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }
    
    const emprestimos = await prisma.emprestimo.findMany({
      where: { usuarioId },
      include: { livro: true, usuario: true }
    });
    res.json(emprestimos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao listar empréstimos' });
  }
});

app.post('/emprestimos', autenticacao, async (req, res) => {
  try {
    const { livroId, dataVencimento } = req.body;
    const usuarioId = req.usuarioId;
    
    if (!livroId || !dataVencimento) {
      return res.status(422).json({ erro: 'livroId e dataVencimento são obrigatórios' });
    }
    
    const livro = await prisma.livro.findUnique({ where: { id: Number(livroId) } });
    if (!livro) return res.status(404).json({ erro: 'Livro não encontrado' });
    if (!livro.disponivel) return res.status(409).json({ erro: 'Livro indisponível' });
    
    const emprestimo = await prisma.emprestimo.create({
      data: {
        usuario: { connect: { id: usuarioId } },
        livro: { connect: { id: Number(livroId) } },
        dataEmprestimo: new Date(),
        dataVencimento: new Date(dataVencimento)
      },
      include: { livro: true }
    });
    
    await prisma.livro.update({ where: { id: Number(livroId) }, data: { disponivel: false } });
    
    res.status(201).json(emprestimo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao criar empréstimo' });
  }
});

app.post('/emprestimos/:id/devolver', autenticacao, async (req, res) => {
  try {
    const id = Number(req.params.id);
    
    const emprestimo = await prisma.emprestimo.findUnique({ where: { id } });
    if (!emprestimo) return res.status(404).json({ erro: 'Empréstimo não encontrado' });
    
    // Verifica se o empréstimo pertence ao usuário autenticado
    if (emprestimo.usuarioId !== req.usuarioId) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }
    
    const emprestimoAtualizado = await prisma.emprestimo.update({
      where: { id },
      data: { dataDevolucao: new Date() }
    });
    
    await prisma.livro.update({ where: { id: emprestimo.livroId }, data: { disponivel: true } });
    
    res.json(emprestimoAtualizado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao devolver livro' });
  }
});

// === RESERVAS ===
app.get('/reservas/:usuarioId', autenticacao, async (req, res) => {
  try {
    const usuarioId = Number(req.params.usuarioId);
    
    if (req.usuarioId !== usuarioId) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }
    
    const reservas = await prisma.reserva.findMany({
      where: { usuarioId },
      include: { livro: true }
    });
    res.json(reservas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao listar reservas' });
  }
});

app.post('/reservas', autenticacao, async (req, res) => {
  try {
    const { livroId } = req.body;
    const usuarioId = req.usuarioId;
    
    if (!livroId) {
      return res.status(422).json({ erro: 'livroId é obrigatório' });
    }
    
    const livro = await prisma.livro.findUnique({ where: { id: Number(livroId) } });
    if (!livro) return res.status(404).json({ erro: 'Livro não encontrado' });
    
    const reservaExiste = await prisma.reserva.findFirst({
      where: { usuarioId, livroId: Number(livroId), status: 'ativa' }
    });
    
    if (reservaExiste) {
      return res.status(409).json({ erro: 'Você já tem uma reserva ativa para este livro' });
    }
    
    const reserva = await prisma.reserva.create({
      data: {
        usuario: { connect: { id: usuarioId } },
        livro: { connect: { id: Number(livroId) } }
      },
      include: { livro: true }
    });
    
    res.status(201).json(reserva);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao criar reserva' });
  }
});

app.delete('/reservas/:id', autenticacao, async (req, res) => {
  try {
    const id = Number(req.params.id);
    
    const reserva = await prisma.reserva.findUnique({ where: { id } });
    if (!reserva) return res.status(404).json({ erro: 'Reserva não encontrada' });
    
    if (reserva.usuarioId !== req.usuarioId) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }
    
    await prisma.reserva.delete({ where: { id } });
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao cancelar reserva' });
  }
});

// === MULTAS ===
app.get('/multas/:usuarioId', autenticacao, async (req, res) => {
  try {
    const usuarioId = Number(req.params.usuarioId);
    
    if (req.usuarioId !== usuarioId) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }
    
    const multas = await prisma.multa.findMany({
      where: { usuarioId },
      include: { emprestimo: { include: { livro: true } } }
    });
    res.json(multas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao listar multas' });
  }
});

app.post('/multas/:emprestimoId', autenticacao, async (req, res) => {
  try {
    const emprestimoId = Number(req.params.emprestimoId);
    const { valorMulta } = req.body;
    
    if (!valorMulta || valorMulta <= 0) {
      return res.status(422).json({ erro: 'valorMulta é obrigatório e deve ser positivo' });
    }
    
    const emprestimo = await prisma.emprestimo.findUnique({ where: { id: emprestimoId } });
    if (!emprestimo) return res.status(404).json({ erro: 'Empréstimo não encontrado' });
    
    const multaExiste = await prisma.multa.findFirst({
      where: { emprestimoId }
    });
    
    if (multaExiste) {
      return res.status(409).json({ erro: 'Já existe multa para este empréstimo' });
    }
    
    const multa = await prisma.multa.create({
      data: {
        usuario: { connect: { id: emprestimo.usuarioId } },
        emprestimo: { connect: { id: emprestimoId } },
        valorMulta: Number(valorMulta)
      }
    });
    
    res.status(201).json(multa);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao criar multa' });
  }
});

app.put('/multas/:id/pagar', autenticacao, async (req, res) => {
  try {
    const id = Number(req.params.id);
    
    const multa = await prisma.multa.findUnique({ where: { id } });
    if (!multa) return res.status(404).json({ erro: 'Multa não encontrada' });
    
    if (multa.usuarioId !== req.usuarioId) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }
    
    const multaPaga = await prisma.multa.update({
      where: { id },
      data: { pago: true }
    });
    
    res.json(multaPaga);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao marcar multa como paga' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
