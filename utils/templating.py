# from pathlib import Path

# def get_project_root() -> Path:
#     return Path(__file__).parent.parent

# print(str(get_project_root()))
  
from string import Template
 
# def merge(list1, list2): 
#     print(list1)
#     print(list2)
#     merged_list = list(zip(list1, list2))  
#     return merged_list 


# def map_po_items(po_items):
#     arr_values = []
#     arr_keys = []
#     for properties in po_items:
#         for k, v in properties.items():
#             arr_values.append(v)
#             arr_keys.append(k)
           
#     return merge(arr_keys, arr_values)

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
        if len(temp) % 2 == 0:
            merged_tuple.append(temp[0] + temp[1])
            temp = []
            # print(temp)
    
    return merged_tuple



def populate_html_table(purchase_order):   
    items_list = map_po_items(purchase_order['itemsArr'])
    
    # items_list = [('name', 'laci', 'age', 2), ('name', 'peti', 'age', 3), ('name', 'tibi', 'age', 4)]
    print(items_list)
    table_n = Template(
        """<tr>
            <td>      
                $name
            </td>
            <td>      
                $val
            </td>
        </tr>""")
   
    
    for item in items_list:
        print(table_n.substitute(name= item[1], val= item[3]))

purchase_order = {
    'poId':'sdf',
    'supplier':'sdfs',
    'attention':'fdsd',
    'department':'zdfs',
    'orderDate':'cv',
    'comments':'vxc',
    'itemsArr':[{'name':'laci', 'age':1}, {'name':'peti', 'age':1}, {'name':'tibi', 'age':1}]
}
  
populate_html_table(purchase_order)