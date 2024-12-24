import os
from dotenv import load_dotenv
from supabase import Client, create_client
import openai
from PyPDF2 import PdfReader
import uuid
from datetime import datetime, timezone as tz
from pathlib import Path
import json
from typing import List, Dict, Any

# Load environment variables
load_dotenv()

# Initialize Supabase
supabase_url = os.getenv("VITE_SUPABASE_URL")
supabase_key = os.getenv("VITE_SUPABASE_SERVICE_KEY")  # Use service key instead of anon key

if not supabase_url or not supabase_key:
    raise ValueError("Missing Supabase environment variables")

# Create Supabase client with service role key
supabase: Client = create_client(supabase_url, supabase_key)

# Initialize OpenAI
openai.api_key = os.getenv("VITE_OPENAI_API_KEY")

def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract text from PDF file"""
    try:
        reader = PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        print(f"Error extracting text from {pdf_path}: {str(e)}")
        return None

def create_text_chunks(text: str, chunk_size: int = 1000, chunk_overlap: int = 500) -> List[str]:
    """Split text into overlapping chunks"""
    chunks = []
    start = 0
    text_length = len(text)

    while start < text_length:
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        start += chunk_size - chunk_overlap

    return chunks

def extract_metadata_with_gpt4(text: str) -> Dict[str, Any]:
    """Extract metadata from text using GPT-4"""
    try:
        system_prompt = """
        You are a legal document analyzer. Extract the following information from the text in a structured format.
        You MUST return a valid JSON object with the following keys (use null if information is not found):

        {
            "nomor_putusan": "string or null",
            "tanggal_putusan": "string or null",
            "pasal_disangkakan": "string or null",
            "hukuman_penjara": "string or null",
            "hukuman_denda": "string or null",
            "kronologis_singkat": "string or null"
        }

        Instructions:
        1. nomor_putusan: Extract the complete decision number
        2. tanggal_putusan: Extract the decision date in DD-MM-YYYY format
        3. pasal_disangkakan: List all alleged criminal code articles
        4. hukuman_penjara: Extract prison sentence duration
        5. hukuman_denda: Extract fine amount in Rupiah
        6. kronologis_singkat: Write a brief 2-3 sentence summary of the case

        Return ONLY the JSON object, no additional text or explanation.
        """

        user_prompt = f"""
        Please analyze this legal document and extract the required information. 
        Remember to return ONLY a valid JSON object with the specified keys.
        
        Document text:
        {text[:4000]}
        """

        print("Sending request to GPT-4o-mini...")
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0
        )

        response_text = response.choices[0].message.content.strip()
        print(f"GPT-4 Response:\n{response_text}")
        
        try:
            metadata = json.loads(response_text)
            # Validate required keys
            required_keys = ["nomor_putusan", "tanggal_putusan", "pasal_disangkakan", 
                           "hukuman_penjara", "hukuman_denda", "kronologis_singkat"]
            for key in required_keys:
                if key not in metadata:
                    metadata[key] = None
            return metadata
        except json.JSONDecodeError as je:
            print(f"JSON Decode Error: {str(je)}")
            print(f"Invalid JSON response: {response_text}")
            return None

    except Exception as e:
        print(f"Error extracting metadata: {str(e)}")
        return None

def truncate_text(text: str, max_length: int = 6000) -> str:
    """Truncate text to a maximum length while trying to keep complete sentences"""
    if len(text) <= max_length:
        return text
        
    # Try to find a sentence end within 100 characters of max_length
    truncated = text[:max_length]
    last_period = truncated.rfind('.')
    if last_period > max_length - 100:
        return text[:last_period + 1]
    return truncated

def get_embedding(text: str) -> List[float]:
    """Get embedding from OpenAI API using text-embedding-3-small model"""
    try:
        response = openai.embeddings.create(
            model="text-embedding-3-small",
            input=text,
            encoding_format="float"
        )
        return response.data[0].embedding
    except Exception as e:
        print(f"Error getting embedding: {str(e)}")
        return None

def upload_document(pdf_path: str) -> Dict[str, Any]:
    """Upload document with metadata to Supabase"""
    try:
        # Extract text from PDF
        text_content = extract_text_from_pdf(pdf_path)
        if not text_content:
            return {"success": False, "error": f"Could not extract text from {pdf_path}"}
        
        # Extract metadata using GPT-4
        metadata = extract_metadata_with_gpt4(text_content)
        if not metadata:
            return {"success": False, "error": f"Could not extract metadata from {pdf_path}"}
        
        # Upload file to Supabase Storage
        file_name = Path(pdf_path).name
        timestamp = datetime.now(tz.utc).strftime("%Y%m%d_%H%M%S")
        storage_path = f"documents/{timestamp}_{file_name}"
        
        try:
            with open(pdf_path, 'rb') as pdf_file:
                # Upload to storage bucket
                result = supabase.storage.from_('documents').upload(
                    path=storage_path,
                    file=pdf_file
                )
                
                # Get public URL for download
                file_url = supabase.storage.from_('documents').get_public_url(storage_path)
                
                # Add file_url to metadata
                metadata['file_url'] = file_url
        
        except Exception as e:
            return {"success": False, "error": f"Error uploading file to storage: {str(e)}"}
        
        # Create document record
        document_data = {
            "title": metadata.get("nomor_putusan", "Untitled Document"),
            "content": text_content,
            "category": "regulation",
            "tags": ["putusan", "tpk"],
            "file_path": storage_path,
            "file_url": file_url,  # Add file_url at top level
            "metadata": metadata,  # Contains file_url in metadata
            "nomor_putusan": metadata.get("nomor_putusan"),
            "tanggal_putusan": metadata.get("tanggal_putusan"),
            "pasal_disangkakan": metadata.get("pasal_disangkakan"),
            "hukuman_penjara": metadata.get("hukuman_penjara"),
            "hukuman_denda": metadata.get("hukuman_denda"),
            "kronologis_singkat": metadata.get("kronologis_singkat")
        }
        
        # Insert document and get its ID
        doc_result = supabase.table('documents').insert(document_data).execute()
        document_id = doc_result.data[0]['id']
        
        # Create text chunks and get embeddings
        chunks = create_text_chunks(text_content)
        for i, chunk in enumerate(chunks):
            try:
                embedding = get_embedding(chunk)
                if embedding:
                    chunk_data = {
                        "document_id": document_id,
                        "content": chunk,
                        "embedding": embedding,
                        "chunk_index": i
                    }
                    supabase.table('document_chunks').insert(chunk_data).execute()
            except Exception as e:
                print(f"Warning: Error getting embedding for chunk {i}: {str(e)}")
                print("Continuing with document upload without embedding...")
        
        return {
            "success": True,
            "metadata": document_data,
            "file_url": file_url
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Error processing {pdf_path}: {str(e)}"
        }

def upload_json_metadata(json_path: str) -> bool:
    """Upload metadata from JSON file to Supabase"""
    try:
        # Read JSON file
        with open(json_path, 'r', encoding='utf-8') as f:
            metadata = json.load(f)

        current_time = datetime.now(tz.utc)

        # Get the full kronologis text
        full_kronologis = metadata.get('kronologis_singkat', '')
        
        # Truncate text for embedding to avoid token limit
        truncated_kronologis = truncate_text(full_kronologis)

        # Prepare data for documents table
        document_data = {
            'title': metadata.get('nomor_putusan'),
            'content': full_kronologis,  # Store full text in content
            'category': 'regulation',
            'date_added': current_time.isoformat(),
            'tags': ['putusan', 'pidana'],
            'file_path': metadata.get('file_pdf', ''),
            'file_url': metadata.get('link_gdrive', ''),
            'metadata': json.dumps({
                'nomor_putusan': metadata.get('nomor_putusan'),
                'tanggal_putusan': metadata.get('tanggal_putusan'),
                'pasal_disangkakan': metadata.get('pasal_disangkakan'),
                'hukuman_penjara': metadata.get('hukuman_penjara'),
                'hukuman_denda': metadata.get('hukuman_denda'),
                'file_pdf': metadata.get('file_pdf'),
                'link_gdrive': metadata.get('link_gdrive')
            }),
            'nomor_putusan': metadata.get('nomor_putusan'),
            'tanggal_putusan': metadata.get('tanggal_putusan'),
            'pasal_disangkakan': metadata.get('pasal_disangkakan'),
            'hukuman_penjara': metadata.get('hukuman_penjara'),
            'hukuman_denda': metadata.get('hukuman_denda'),
            'kronologis_singkat': full_kronologis
        }

        # Upload to Supabase documents table
        doc_result = supabase.table('documents').insert(document_data).execute()
        
        if not doc_result.data:
            print(f"Error uploading document metadata for {json_path}")
            return False

        document_id = doc_result.data[0]['id']

        try:
            # Get embedding for truncated kronologis
            kronologis_embedding = get_embedding(truncated_kronologis)
            
            # Prepare data for document_chunks table
            chunk_data = {
                'document_id': document_id,
                'content': truncated_kronologis,  # Store truncated text in chunks
                'embedding': kronologis_embedding,
                'chunk_index': 0
            }

            # Upload to Supabase document_chunks table
            chunk_result = supabase.table('document_chunks').insert(chunk_data).execute()
            
            if not chunk_result.data:
                print(f"Error uploading document chunks for {json_path}")
                return False

        except Exception as e:
            print(f"Warning: Error getting embedding for {json_path}: {str(e)}")
            print("Continuing with document upload without embedding...")
            # Continue execution even if embedding fails

        print(f"Successfully uploaded metadata and embedding for {json_path}")
        return True

    except Exception as e:
        print(f"Error processing {json_path}: {str(e)}")
        return False

def clear_supabase_tables() -> bool:
    """Clear all data from Supabase tables"""
    try:
        # Delete from document_chunks first due to foreign key constraint
        print("Clearing document_chunks table...")
        supabase.table('document_chunks').delete().neq('id', 0).execute()
        
        print("Clearing documents table...")
        supabase.table('documents').delete().neq('id', 0).execute()
        
        print("Successfully cleared all tables")
        return True
    except Exception as e:
        print(f"Error clearing tables: {str(e)}")
        return False

def process_json_folder(folder_path: str) -> None:
    """Process all JSON files in the specified folder"""
    try:
        # Get all JSON files in the folder
        json_files = [f for f in Path(folder_path).glob("*.json")]
        total_files = len(json_files)
        
        print(f"Found {total_files} JSON files to process")
        
        success_count = 0
        for i, json_path in enumerate(json_files, 1):
            print(f"\nProcessing file {i}/{total_files}: {json_path}")
            if upload_json_metadata(str(json_path)):
                success_count += 1
        
        print(f"\nProcessing complete. Successfully uploaded {success_count}/{total_files} files")

    except Exception as e:
        print(f"Error processing folder {folder_path}: {str(e)}")

def process_document_folder(folder_path: str):
    """Process all PDF files in the specified folder"""
    # Create folder if it doesn't exist
    os.makedirs(folder_path, exist_ok=True)
    
    # Get all PDF files in the folder
    pdf_files = [f for f in os.listdir(folder_path) if f.lower().endswith('.pdf')]
    
    print(f"Starting document upload process...")
    print(f"Documents folder: {folder_path}")
    print(f"Found {len(pdf_files)} PDF files to process\n")
    
    for pdf_file in pdf_files:
        print(f"\nProcessing: {pdf_file}")
        pdf_path = os.path.join(folder_path, pdf_file)
        result = upload_document(pdf_path)
        
        if result["success"]:
            print("✓ Successfully uploaded document")
            print(f"Nomor Putusan: {result['metadata']['nomor_putusan']}")
            print(f"Tanggal Putusan: {result['metadata']['tanggal_putusan']}")
            print(f"Pasal yang Disangkakan: {result['metadata']['pasal_disangkakan']}")
            print("Hukuman:")
            print(f"  - Penjara: {result['metadata']['hukuman_penjara']}")
            print(f"  - Denda: {result['metadata']['hukuman_denda']}")
            print(f"Download URL: {result['file_url']}")
        else:
            print(f"✗ Failed to upload {pdf_file}: {result['error']}")

if __name__ == "__main__":
    import sys
    import argparse
    
    parser = argparse.ArgumentParser(description='Upload documents to Supabase')
    parser.add_argument('--json-folder', type=str, help='Folder containing JSON files to upload')
    parser.add_argument('--folder', type=str, help='Folder containing PDF files to upload')
    
    args = parser.parse_args()
    
    if args.json_folder:
        process_json_folder(args.json_folder)
    elif args.folder:
        process_document_folder(args.folder)
    else:
        parser.print_help()
        sys.exit(1)
