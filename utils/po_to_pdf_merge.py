import os
import sys
import json
import pdfkit 
import PyPDF2
from string import Template

def save_purchase_order_to_pdf(purchase_order):
    try:
        purchase_order = json.loads(purchase_order)
        populated_table = populate_html_table(purchase_order)
        po_template = f"""<h1 style="text-align:center;">Purchase Order</h1>  
                        <h4>Delivery address: Ibis Earls Court Hotel/Cockpit Hotel Limited/- 47 Lillie Road London SW6 1UD</h4>
                        <h6>Reg. No.:3405105, VAT reg. no.: 701 5349 65</h6>
                        <p>Po Id: {purchase_order['poId']}</p>
                        <p>Supplier: {purchase_order['supplier']}</p> 
                        <p>Attention of: {purchase_order['attention']}</p> 
                        <p>Department: {purchase_order['department']}</p> 
                        <p>Order Date: {purchase_order['orderDate']}</p>
                        <p>Comments: {purchase_order['comments']}</p>""" + populated_table

        pdfkit.from_string(po_template, os.getcwd() + '/static/templates/purchase-order.pdf') 
    
    except:
        raise Exception("error while loading argument")

# Create Html Items Table ----------------------------------------
 
def merge(list1, list2): 
    merged_list = list(zip(list1, list2))  
    return merged_list 


def map_po_items(po_items):
    arr_values = []
    arr_keys = []
    for properties in po_items:
        for k, v in properties.items():
            arr_values.append(v)
            arr_keys.append(k)
           
    return merge(arr_values, arr_keys)


def populate_html_table(purchase_order):   
    items_list = map_po_items(purchase_order['itemsArr'])
    
    table = Template(
        """<table>
                <thead>
                    <tr>
                        <th>Item description</th>
                        <th>Quantity</th>
                        <th>Net amount</th>
                        <th>Vat amount</th>
                        <th>Gross Total</th>
                    </tr>
                </thead>
                <tbody>
                <tr>
                    <td>
                        $values
                    </td>
                    <td>
                        $values
                    </td>
                    <td>
                        $values
                    </td>
                    <td>
                        $values
                    </td>
                    <td>
                        $values
                    </td>
                </tr>
                </tbody>
            </table>""")

    for item in items_list:
        return populated_table = table.substitute(values = item[1]))


purchase_order = {
    'poId':'sdf',
    'supplier':'sdfs',
    'attention':'fdsd',
    'department':'zdfs',
    'orderDate':'cv',
    'comments':'vxc',
    'itemsArr':[{'name':90, 'age':1}, {'Ankit':78}, {'Bob':92}]
}
  
# Merge po with Invoice ------------------------------

def load_pdf(filename):
    f = open(filename, "rb")
    return PyPDF2.PdfFileReader(f)


def add_to_writer(pdf, writer):
    for i in range(pdf.getNumPages()):
        writer.addPage(pdf.getPage(i))

def merge_po_with_invoice():
    pdf_dir = os.getcwd() + "/static/templates/"
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


# purchase_order = {
#     'poId':'sdf',
#     'supplier':'sdfs',
#     'attention':'fdsd',
#     'department':'zdfs',
#     'orderDate':'cv',
#     'comments':'vxc'
# }
# save_purchase_order_to_pdf(purchase_order)
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
        #     'comments':'vxc'
        # }
