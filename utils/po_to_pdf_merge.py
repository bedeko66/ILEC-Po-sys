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

def save_purchase_order_to_pdf(purchase_order):
    try:
        main_tbl = populate_html_table(purchase_order)
        
        po_template = f"""<h1 style="text-align:center;">Purchase Order</h1>  
                        <h4>Delivery address: Ibis Earls Court Hotel/Cockpit Hotel Limited/- 47 Lillie Road London SW6 1UD</h4>
                        <h6>Reg. No.:3405105, VAT reg. no.: 701 5349 65</h6>
                        <p>Po Id: {purchase_order['poId']}</p>
                        <p>Supplier: {purchase_order['supplier']}</p> 
                        <p>Attention of: {purchase_order['attention']}</p> 
                        <p>Department: {purchase_order['department']}</p> 
                        <p>Order Date: {purchase_order['orderDate']}</p>
                        <p>Comments: {purchase_order['comments']}</p>
                        <p>Purchase Order Total: {purchase_order['po_ttl']}</p>""" + main_tbl

        pdfkit.from_string(po_template, str(proj_path) + '/static/templates/purchase-order.pdf') 
    
    except:
        raise Exception("error while loading argument")

# Create Html Items Table ----------------------------------------
 
def map_po_items(po_items):
    arr_values = []
    arr_keys = []
    for properties in po_items:
        for k, v in properties.items():
            arr_values.append(v)
            arr_keys.append(k)

    mm = list(zip(arr_keys, arr_values))
    merged_tuple = []
    temp = []
   
    for m in mm:
        temp.append(m)
        if len(temp) % 5 == 0:
            merged_tuple.append(temp[0] + temp[1] + temp[2] + temp[3] + temp[4])
            temp = []

    return merged_tuple


def populate_html_table(purchase_order):   
    items_list = map_po_items(purchase_order['itemsArr'])

    main_tbl = Template( """<table>
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
                    $tb_data
                </tbody>
            </table>""")


    tbl_data = Template(
        """    
            <tr>
                <td style="text-align:center;">      
                    $item
                </td>
                <td style="text-align:center;">      
                    $qty
                </td>
                <td style="text-align:center;">      
                    $net
                </td>
                <td style="text-align:center;">      
                    $vat
                </td>
                <td style="text-align:center;">      
                    $gross
                </td>
            </tr>
           """)

    temp_tbl = ''
   
    for item in items_list:
        data = tbl_data.safe_substitute(item= item[1], qty = item[3], net = item[5], vat = item[7], gross = item[9])
        temp_tbl = temp_tbl + data

    dt = main_tbl.safe_substitute(tb_data=temp_tbl)
    return dt

  
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




purchase_order = json.loads(sys.argv[1])


save_purchase_order_to_pdf(purchase_order)
if (sys.argv[2] == 'invoice-validator'):
    merge_po_with_invoice()












# --------------------------------------------------------
# purchase_order = {
#     'poId':'sdf',
#     'supplier':'sdfs',
#     'attention':'fdsd',
#     'department':'zdfs',
#     'orderDate':'cv',
#     'comments':'vxc',
#     "itemsArr":[{"item_descr":"item1","item_qty":"12","item_net":"1232","item_vat":"145","item_gross":"67"},{"item_descr":"item2","item_qty":"1","item_net":"132","item_vat":"15","item_gross":"7"}]
# }