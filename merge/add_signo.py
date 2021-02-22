import PyPDF2
from PIL import Image, ImageOps

def convert_png_signo_to_pdf():
    # storing image path 
    img_path = "/home/bedeko/dev/po-proj/static/uploads/signo.png"  
    # storing pdf path 
    pdf_path = "/home/bedeko/dev/po-proj/static/uploads/signo.pdf"

    with Image.open(img_path) as im:
        im2 = im.copy()
        im2.putalpha(180)
        im.paste(im2, im)
        im = im.convert('RGB')
        im_invert = ImageOps.invert(im)

        newsize = (150, 60) 
        im_invert = im_invert.resize(newsize) 
        im_invert.save(pdf_path,"PDF")


def add_signo_to_invoice():
    input_file = "/home/bedeko/dev/po-proj/static/uploads/sample.pdf"
    watermark = "/home/bedeko/dev/po-proj/static/uploads/signo.pdf"
    output_file = "/home/bedeko/dev/po-proj/static/uploads/sample.pdf"

    with open(input_file, 'rb') as inputfile:
        pdf = PyPDF2.PdfFileReader(inputfile)

        with open(watermark, 'rb') as watermark_file:
            watermarkpdf = PyPDF2.PdfFileReader(watermark_file)

            p = pdf.getPage(0)

            w = watermarkpdf.getPage(0)

            p.mergePage(w)

            pdfwriter = PyPDF2.PdfFileWriter()

            pdfwriter.addPage(p)

            with open(output_file, 'wb') as output_filecontent:
                pdfwriter.write(output_filecontent)


convert_png_signo_to_pdf()
add_signo_to_invoice()