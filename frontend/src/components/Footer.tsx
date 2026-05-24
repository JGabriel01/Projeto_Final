export default function Footer() {
  const ano = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Sobre */}
          <div>
            <h3 className="text-lg font-bold mb-4">BiblioTech</h3>
            <p className="text-gray-400 text-sm">
              A plataforma completa para gerenciamento de biblioteca digital com
              foco em experiência do usuário.
            </p>
          </div>

          {/* Links Rápidos */}
          <div>
            <h4 className="text-lg font-bold mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/catalogo" className="text-gray-400 hover:text-white transition">
                  Catálogo
                </a>
              </li>
              <li>
                <a href="/meus-emprestimos" className="text-gray-400 hover:text-white transition">
                  Meus Empréstimos
                </a>
              </li>
              <li>
                <a href="/minhas-reservas" className="text-gray-400 hover:text-white transition">
                  Minhas Reservas
                </a>
              </li>
              <li>
                <a href="/multas" className="text-gray-400 hover:text-white transition">
                  Multas
                </a>
              </li>
            </ul>
          </div>

          {/* Informações */}
          <div>
            <h4 className="text-lg font-bold mb-4">Informações</h4>
            <p className="text-gray-400 text-sm mb-2">
              📧 suporte@bibliotech.com
            </p>
            <p className="text-gray-400 text-sm mb-2">
              📞 (11) 9999-9999
            </p>
            <p className="text-gray-400 text-sm">
              ⏰ Segunda a Sexta: 09:00 - 18:00
            </p>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {ano} BiblioTech. Todos os direitos reservados.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition">
                Privacidade
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition">
                Termos de Uso
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition">
                Contato
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
