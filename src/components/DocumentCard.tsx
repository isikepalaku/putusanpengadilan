import React, { useState } from 'react';
import type { LegalDocument } from '../types';
import { Download, Copy, X } from 'lucide-react';

interface DocumentCardProps {
  document: LegalDocument;
  matchedSegments: string[];
  relevanceScore: number;
  onClick?: () => void;
}

export function DocumentCard({ document, matchedSegments, relevanceScore }: DocumentCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Check both metadata.file_url and direct file_url
    const fileUrl = document.metadata?.file_url || document.file_url;
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(document.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const showDownloadButton = document.metadata?.file_url || document.file_url;

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="p-4 md:p-6 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors relative"
      >
        {/* Move badges to the bottom on mobile, top-right on desktop */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
            <h3 className="text-lg md:text-xl font-semibold text-white">
              {document.title || document.metadata?.nomor_putusan || 'Untitled Document'}
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-600 text-sm text-white rounded-full whitespace-nowrap">
                {document.category}
              </span>
              <span 
                className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                  relevanceScore >= 80 
                    ? 'bg-green-600 text-white' 
                    : relevanceScore >= 60 
                      ? 'bg-yellow-600 text-white'
                      : 'bg-red-600 text-white'
                }`}
                title="Relevance Score"
              >
                {relevanceScore}%
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
            {document.metadata && (
              <div className="text-sm text-gray-400 space-y-1">
                {Object.entries(document.metadata).map(([key, value]) => {
                  if (key === 'file_url' || !value || key === 'kronologis_singkat') return null;
                  
                  const formattedKey = key
                    .split('_')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');

                  return (
                    <p key={key}>
                      <span className="font-bold">{formattedKey}:</span>{' '}
                      {typeof value === 'string' ? value : JSON.stringify(value)}
                    </p>
                  );
                })}
                {document.metadata.kronologis_singkat && (
                  <div>
                    <span className="font-bold">Kronologis Singkat:</span>{' '}
                    <span className="text-gray-300">
                      {document.metadata.kronologis_singkat.slice(0, 200)}...
                    </span>
                    <span className="text-blue-400 hover:text-blue-300 cursor-pointer ml-2">
                      Read more
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-start justify-center p-4 sm:items-center">
          <div className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 pr-8 break-words">
                {document.title || document.metadata?.nomor_putusan || 'Untitled Document'}
              </h2>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6">
                {showDownloadButton && (
                  <button
                    onClick={handleDownload}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span className="whitespace-nowrap">Download Document</span>
                  </button>
                )}
                <button
                  onClick={handleCopy}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span className="whitespace-nowrap">{isCopied ? 'Copied!' : 'Copy Content'}</span>
                </button>
              </div>

              <div className="space-y-4">
                {document.metadata && Object.entries(document.metadata).map(([key, value]) => {
                  if (key === 'file_url' || !value) return null;
                  
                  const formattedKey = key
                    .split('_')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');

                  return (
                    <div key={key} className="text-gray-300">
                      <h3 className="font-bold text-white mb-2">{formattedKey}</h3>
                      <div className="bg-gray-900 p-3 sm:p-4 rounded-lg overflow-x-auto">
                        <div className="whitespace-pre-wrap break-words">
                          {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}