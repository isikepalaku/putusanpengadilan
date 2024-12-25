interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="w-full max-w-3xl mt-4 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
      {message}
    </div>
  );
}