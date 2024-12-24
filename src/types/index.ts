export interface DocumentMetadata {
  nomor_putusan: string | null;
  tanggal_putusan: string | null;
  pasal_disangkakan: string | null;
  hukuman_penjara: string | null;
  hukuman_denda: string | null;
  kronologis_singkat: string | null;
  file_url: string | null;
}

export interface LegalDocument {
  id: string;
  title: string;
  content: string;
  category: 'contract' | 'policy' | 'agreement' | 'regulation';
  dateAdded: string;
  tags: string[];
  file_path: string;
  file_url: string;
  metadata: DocumentMetadata;
}

export interface SearchResult {
  document: LegalDocument;
  relevanceScore: number;
  matchedSegments: string[];
}