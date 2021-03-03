#  items_list = [('name', 'laci', 'age', 2), ('name', 'peti', 'age', 3), ('name', 'tibi', 'age', 4)]
items_list = [{'name':'laci', 'age':2}, {'name':'peti','age':3}, {'name':'tibi', 'age':4}]

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
    
    print(merged_tuple)




map_po_items(items_list)
