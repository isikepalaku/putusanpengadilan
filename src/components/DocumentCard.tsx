import { useState } from 'react';
import type { LegalDocument } from '../types';
import { Modal } from './Modal';

interface DocumentCardProps {
  document: LegalDocument;
  matchedSegments: string[];
  relevanceScore: number;
  onClick?: () => void;
}

export function DocumentCard({ document, matchedSegments, relevanceScore }: DocumentCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="p-4 md:p-6 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors relative"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
            <h3 className="text-lg md:text-xl font-semibold text-white">
              {document.title || document.metadata?.nomor_putusan || 'Untitled Document'}
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-blue-600/80 text-sm text-white rounded-md">
                {document.category}
              </span>
              <span 
                className={`px-2 py-1 text-sm text-white rounded-md ${
                  relevanceScore >= 80 
                    ? 'bg-green-600/80' 
                    : relevanceScore >= 60 
                      ? 'bg-yellow-600/80'
                      : relevanceScore >= 40
                        ? 'bg-orange-600/80'
                        : 'bg-red-600/80'
                }`}
                title="Tingkat Relevansi"
              >
                {relevanceScore.toFixed(1)}%
              </span>
            </div>
          </div>

          {document.metadata?.tanggal_putusan && (
            <p className="text-sm text-gray-400">
              <span className="font-bold">Tanggal Putusan:</span> {document.metadata.tanggal_putusan}
            </p>
          )}
          
          <div className="prose prose-invert max-w-none">
            {matchedSegments.map((segment, index) => (
              <div 
                key={index}
                className="text-gray-300 text-sm mb-4"
                dangerouslySetInnerHTML={{ __html: segment }}
              />
            ))}
            {document.metadata?.kronologis_singkat && (
              <div className="text-sm text-gray-400">
                <span className="font-bold">Kronologis Singkat:</span>{' '}
                <span className="text-gray-300">
                  {isExpanded 
                    ? document.metadata.kronologis_singkat
                    : document.metadata.kronologis_singkat.slice(0, 200) + '...'}
                </span>
                <button
                  onClick={toggleExpand}
                  className="text-blue-400 hover:text-blue-300 ml-2 focus:outline-none"
                >
                  {isExpanded ? 'Show Less' : 'Read More'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && <Modal document={document} onClose={() => setIsModalOpen(false)} />}
    </>
  );
}