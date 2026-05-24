interface LoadingSpinnerProps {
  tamanho?: 'sm' | 'md' | 'lg';
  texto?: string;
}

export default function LoadingSpinner({ tamanho = 'md', texto }: LoadingSpinnerProps) {
  const tamanhos = {
    sm: 'h-6 w-6 border-2',
    md: 'h-12 w-12 border-3',
    lg: 'h-16 w-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div
        className={`animate-spin rounded-full border-b-blue-600 ${tamanhos[tamanho]}`}
      ></div>
      {texto && <p className="text-gray-600">{texto}</p>}
    </div>
  );
}
