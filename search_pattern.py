
import os
import re

pattern = re.compile(r'</p>\s*</div>\s*</button>', re.MULTILINE)

for root, dirs, files in os.walk(r'c:\Users\razak\kifayatly-next\src'):
    for file in files:
        if file.endswith(('.jsx', '.js')):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                if pattern.search(content):
                    print(f"FOUND in {path}")
