import logo from '../img/logo.png';

export function Logo() {
  return (
    <div className="flex items-center gap-6 mb-8">
      <div className="relative w-16 h-16">
        <img 
          src={logo} 
          alt="Mesin pencari putusan pengadilan" 
          className="w-full h-full object-contain drop-shadow-lg" 
        />
      </div>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            Pencarian
          </span>{' '}
          <span className="text-white">
            Dokumen Hukum
          </span>
        </h1>
        <p className="text-sm md:text-base font-medium text-gray-400 tracking-wide">
          Vector Search Engine +{' '}
          <span className="text-cyan-400 font-semibold">
            AI
          </span>
        </p>
      </div>
    </div>
  );
}