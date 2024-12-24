import { LegalDocument } from '../types';

interface ModalProps {
  document: LegalDocument;
  onClose: () => void;
}

export function Modal({ document, onClose }: ModalProps) {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#111] rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto animate-slideIn border border-[#222]">
        <h2 className="text-2xl font-bold mb-4">{document.title}</h2>
        <p className="whitespace-pre-wrap text-gray-300">{document.content}</p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-blue-900 text-white rounded-lg
                   hover:bg-blue-800 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}