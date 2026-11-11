import sys
import os

pdf_path = r"C:\Users\hp\Downloads\Cahier_des_charge_2025_pfa (5) (1).pdf"
print("File exists:", os.path.exists(pdf_path))
print("File size:", os.path.getsize(pdf_path))

# Check available pdf libraries
libs = []
for lib in ["pypdf", "pypdf2", "pdfminer", "fitz", "pdfplumber"]:
    try:
        __import__(lib)
        libs.append(lib)
    except ImportError:
        pass
print("Available libraries:", libs)

# Try reading text
if "pypdf" in libs:
    import pypdf
    reader = pypdf.PdfReader(pdf_path)
    print("Total pages:", len(reader.pages))
    with open("pdf_extracted_summary.txt", "w", encoding="utf-8") as out:
        for idx, page in enumerate(reader.pages):
            txt = page.extract_text() or ""
            out.write(f"\n=== PAGE {idx + 1} ===\n{txt}\n")
    print("Extracted to pdf_extracted_summary.txt")
elif "pypdf2" in libs:
    import PyPDF2
    reader = PyPDF2.PdfReader(pdf_path)
    print("Total pages:", len(reader.pages))
    with open("pdf_extracted_summary.txt", "w", encoding="utf-8") as out:
        for idx, page in enumerate(reader.pages):
            txt = page.extract_text() or ""
            out.write(f"\n=== PAGE {idx + 1} ===\n{txt}\n")
    print("Extracted to pdf_extracted_summary.txt")
elif "fitz" in libs:
    import fitz
    doc = fitz.open(pdf_path)
    print("Total pages:", len(doc))
    with open("pdf_extracted_summary.txt", "w", encoding="utf-8") as out:
        for idx in range(len(doc)):
            txt = doc[idx].get_text()
            out.write(f"\n=== PAGE {idx + 1} ===\n{txt}\n")
    print("Extracted to pdf_extracted_summary.txt")
else:
    # Try installing pypdf or reading directly
    print("No pdf reader installed, checking python packages...")
