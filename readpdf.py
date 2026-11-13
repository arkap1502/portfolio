from pypdf import PdfReader
for f in [r"assets/Thiranex_Certificate_Arka_Patra_THX-AUG0426-563.pdf", r"assets/cert-cisco-hardware-basics.pdf"]:
    print("FILE:", f)
    r = PdfReader(f)
    for i, p in enumerate(r.pages):
        print(p.extract_text())
    print("---")
