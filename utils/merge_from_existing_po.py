import os
import sys
import json
import pdfkit 
import PyPDF2
from string import Template
from pathlib import Path

def get_project_root() -> Path:
    return Path(__file__).parent.parent

proj_path = get_project_root()
# Merge po with Invoice ------------------------------

def load_pdf(filename):
    f = open(filename, "rb")
    return PyPDF2.PdfFileReader(f)


def add_to_writer(pdf, writer):
    for i in range(pdf.getNumPages()):
        writer.addPage(pdf.getPage(i))

def merge_po_with_invoice():
    pdf_dir = str(proj_path) + "/static/templates/"
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



merge_po_with_invoice()