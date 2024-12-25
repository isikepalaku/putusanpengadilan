import logo from '../img/logo.png';

export function Logo() {
  return (
    <div className="flex items-center gap-6 mb-4 pt-4">
      <div className="relative w-12 h-12 md:w-14 md:h-14">
        <img 
          src={logo} 
          alt="Mesin pencari putusan pengadilan" 
          className="w-full h-full object-contain drop-shadow-lg" 
        />
      </div>
      <div className="flex flex-col gap-0.5">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            Pencarian
          </span>{' '}
          <span className="text-white">
            Dokumen Hukum
          </span>
        </h1>
        <p className="text-xs md:text-sm font-medium text-gray-400 tracking-wide">
          Vector Search Engine +{' '}
          <span className="text-cyan-400 font-semibold">
            AI
          </span>
        </p>
      </div>
    </div>
  );
}