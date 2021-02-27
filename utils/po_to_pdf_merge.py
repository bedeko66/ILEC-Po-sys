import os
import sys
import json
import pdfkit 
import PyPDF2


def save_purchase_order_to_pdf(purchase_order):
    try:
        purchase_order = json.loads(purchase_order)
        po_template = f"""<h1 style="text-align:center;">Purchase Order</h1>  
                        <h4>Delivery address: Ibis Earls Court Hotel/Cockpit Hotel Limited/- 47 Lillie Road London SW6 1UD</h4>
                        <h6>Reg. No.:3405105, VAT reg. no.: 701 5349 65</h6>
                        <p>Po Id: {purchase_order['poId']}</p>
                        <p>Supplier: {purchase_order['supplier']}</p> 
                        <p>Attention of: {purchase_order['attention']}</p> 
                        <p>Department: {purchase_order['department']}</p> 
                        <p>Order Date: {purchase_order['orderDate']}</p>
                        <p>Description: {purchase_order['description']}</p>"""

        pdfkit.from_string(po_template, '/home/bedeko/dev/po-proj/static/templates/purchase-order.pdf') 
    
    except:
        raise Exception("error while loading argument")


# Merge po with Invoice ------------------------------

def load_pdf(filename):
    f = open(filename, "rb")
    return PyPDF2.PdfFileReader(f)


def add_to_writer(pdf, writer):
    for i in range(pdf.getNumPages()):
        writer.addPage(pdf.getPage(i))

def merge_po_with_invoice():
    pdf_dir = "/home/bedeko/dev/po-proj/static/templates/"
    invoice = load_pdf(pdf_dir + 'orig_invoice.pdf') 
    po = load_pdf(pdf_dir + 'purchase-order.pdf')

    invoice_pages = invoice.getNumPages()
    po_pages = po.getNumPages()

    writer = PyPDF2.PdfFileWriter()

    add_to_writer(po, writer)
    add_to_writer(invoice, writer)

    merged = open(pdf_dir + 'merged.pdf', 'wb')
    writer.write(merged)
    merged.close()


save_purchase_order_to_pdf(sys.argv[1])
merge_po_with_invoice()






# https://pythonexamples.org/python-convert-html-to-pdf/
# sudo apt-get install wkhtmltopdf
        # purchase_order = {
        #     'poId':'sdf',
        #     'supplier':'sdfs',
        #     'attention':'fdsd',
        #     'department':'zdfs',
        #     'orderDate':'cv',
        #     'description':'vxc'
        # }
