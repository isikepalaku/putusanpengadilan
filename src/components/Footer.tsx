export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 py-4 px-4">
      <div className="container mx-auto">
        <p className="text-center text-gray-400 text-sm">
          © {new Date().getFullYear()} Developed by{' '}
          <span className="font-semibold text-gray-300">
            Ibrahim Sandre - Ditreskrimsus Polda Sulsel
          </span>
        </p>
      </div>
    </footer>
  );
}
