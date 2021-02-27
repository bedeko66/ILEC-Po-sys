import sys
import PyPDF2
from PIL import Image, ImageOps

def convert_png_signo_to_pdf():
    # storing image path 
    img_path = "/home/bedeko/dev/po-proj/static/templates/signo.png"  
    # storing pdf path 
    pdf_path = "/home/bedeko/dev/po-proj/static/templates/signo.pdf"

    with Image.open(img_path) as im:
        im2 = im.copy()
        im2.putalpha(180)
        im.paste(im2, im)
        im = im.convert('RGB')
        im_invert = ImageOps.invert(im)

        newsize = (150, 60) 
        im_invert = im_invert.resize(newsize) 
        im_invert.save(pdf_path,"PDF")



def add_signo_to_invoice(pageNum):
    if pageNum == 0:
        input_file_src = 'merged.pdf'
        output_file_src = 'output.pdf'
    else:
        input_file_src = 'output.pdf'
        output_file_src = 'output2.pdf'
    
    input_file = f"/home/bedeko/dev/po-proj/static/templates/{input_file_src}"
    watermark = "/home/bedeko/dev/po-proj/static/templates/signo.pdf"
    output_file = f"/home/bedeko/dev/po-proj/static/templates/{output_file_src}"

    with open(input_file, 'rb') as inputfile:
        pdf = PyPDF2.PdfFileReader(inputfile)

        with open(watermark, 'rb') as watermark_file:
            watermarkpdf = PyPDF2.PdfFileReader(watermark_file)

            p = pdf.getPage(pageNum)
            w = watermarkpdf.getPage(0)
            p.mergePage(w)
            pdfwriter = PyPDF2.PdfFileWriter()
            pdfwriter.addPage(p)
   
            for i in range(pdf.getNumPages()):
                if not i == pageNum:
                    pdfwriter.addPage(pdf.getPage(i))

            with open(output_file, 'wb') as output_filecontent:
                pdfwriter.write(output_filecontent)

docs_type = int(sys.argv[1])
convert_png_signo_to_pdf()
add_signo_to_invoice(docs_type)