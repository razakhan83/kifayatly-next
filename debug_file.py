
path = r'c:\Users\razak\kifayatly-next\src\app\admin\products\edit\[id]\EditProductClient.jsx'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()
    for i in range(344, 365):
        if i < len(lines):
            print(f"{i+1}: {repr(lines[i])}")
