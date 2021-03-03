from string import Template
 
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
        """<tr>
            <td>
                $name
            </td>
        </tr>""")

    for item in items_list:
        print(table.substitute(name = item[0], marks = item[1]))


purchase_order = {
    'poId':'sdf',
    'supplier':'sdfs',
    'attention':'fdsd',
    'department':'zdfs',
    'orderDate':'cv',
    'comments':'vxc',
    'itemsArr':[{'name':90, 'age':1}, {'Ankit':78}, {'Bob':92}]
}
  
populate_html_table(purchase_order)