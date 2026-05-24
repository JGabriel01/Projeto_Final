import type { Livro } from '../types';
import { BookOpen, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CardLivroProps {
  livro: Livro;
  onEmprestimo?: () => void;
  onReserva?: () => void;
}

export default function CardLivro({ livro, onEmprestimo, onReserva }: CardLivroProps) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden flex flex-col">
      {/* Capa do Livro */}
      <div className="bg-gradient-to-br from-blue-100 to-blue-200 h-64 flex items-center justify-center relative overflow-hidden">
        {livro.capa ? (
          <img src={livro.capa} alt={livro.titulo} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center text-blue-600">
            <BookOpen size={48} />
            <p className="text-xs mt-2 text-center px-2">Sem capa</p>
          </div>
        )}
        {livro.disponivel && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
            Disponível
          </div>
        )}
        {!livro.disponivel && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
            Indisponível
          </div>
        )}
      </div>

      {/* Informações */}
      <div className="p-4 flex-1 flex flex-col">
        <Link to={`/livro/${livro.id}`} className="hover:text-blue-600 transition">
          <h3 className="font-bold text-lg mb-1 truncate">{livro.titulo}</h3>
        </Link>
        <p className="text-gray-600 text-sm mb-2">{livro.autor}</p>
        <div className="flex justify-between text-xs text-gray-500 mb-3">
          <span>{livro.genero}</span>
          <span>{livro.ano}</span>
        </div>
        <p className="text-sm text-gray-700 line-clamp-2 flex-1 mb-4">{livro.sinopse}</p>

        {/* Ações */}
        <div className="flex gap-2">
          <Link
            to={`/livro/${livro.id}`}
            className="flex-1 bg-blue-600 text-white py-2 rounded text-center text-sm font-semibold hover:bg-blue-700 transition"
          >
            Ver Detalhes
          </Link>
          {livro.disponivel && onEmprestimo && (
            <button
              onClick={onEmprestimo}
              className="flex-1 bg-green-600 text-white py-2 rounded text-sm font-semibold hover:bg-green-700 transition"
            >
              Emprestar
            </button>
          )}
          {!livro.disponivel && onReserva && (
            <button
              onClick={onReserva}
              className="flex-1 bg-amber-600 text-white py-2 rounded text-sm font-semibold hover:bg-amber-700 transition"
            >
              Reservar
            </button>
          )}
        </div>

        {/* Link para PDF */}
        {livro.arquivo && (
          <a
            href={livro.arquivo}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
          >
            <Download size={16} />
            Ler PDF
          </a>
        )}
      </div>
    </div>
  );
}
