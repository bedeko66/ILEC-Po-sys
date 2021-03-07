import os
import sys
import PyPDF2
from PIL import Image, ImageOps
from pathlib import Path

def get_project_root() -> Path:
    return Path(__file__).parent.parent

proj_path = get_project_root()

def convert_png_signo_to_pdf():
    # storing image path 
    img_path = str(proj_path) + "/static/templates/signo.png"  
    # storing pdf path 
    pdf_path = str(proj_path) + "/static/templates/signo.pdf"

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

    if (po_creation_from == 'po-creator'):
        input_file_src = 'purchase-order.pdf'
        output_file_src = 'output.pdf'
    else:
        if (po_creation_from == 'invoice-validator-existing-po'):
                pageNum = 1
                input_file_src = 'merged.pdf'
                output_file_src = 'output2.pdf'
        else:
            if (pageNum == 0):
                input_file_src = 'merged.pdf'
                output_file_src = 'output.pdf'
            if (pageNum == 1):
                input_file_src = 'output.pdf'
                output_file_src = 'output2.pdf'
      
    
    # input_file = str(proj_path) + f"/static/templates/{input_file_src}"
    # watermark = str(proj_path) + "/static/templates/signo.pdf"
    # output_file = str(proj_path) + f"/static/templates/{output_file_src}"

    input_file = f"/home/bedeko/dev/po-proj/static/templates/{input_file_src}"
    watermark = f"/home/bedeko/dev/po-proj/static/templates/signo.pdf"
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
   
            pages = pdf.getNumPages()
            for i in range(pdf.getNumPages()):
                # if i == pageNum:
                #     pdfwriter.addPage(pdf.getPage(num))

                # pdfwriter.addPage(pdf.getPage(i))
                if not i == pageNum:
                    pdfwriter.addPage(pdf.getPage(i))

            with open(output_file, 'wb') as output_filecontent:
                pdfwriter.write(output_filecontent)


po_creation_from = sys.argv[2]
docs_type = int(sys.argv[1])



# po_creation_from = 'invoice-validator-existing-po'
# docs_type = int(0)

convert_png_signo_to_pdf()
# docs_type = 2
add_signo_to_invoice(docs_type)