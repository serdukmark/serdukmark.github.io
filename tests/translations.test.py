"""Check translation boundaries and generated language consistency."""
from html.parser import HTMLParser
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
VOID = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}

class TranslationBoundaries(HTMLParser):
    def __init__(self):
        super().__init__(); self.stack=[]; self.protected=False; self.skipped=False; self.errors=[]
    def handle_starttag(self, tag, attrs):
        attrs=dict(attrs)
        if tag in ('html','body') and attrs.get('translate') == 'no':
            self.errors.append('prose must remain translatable')
        if tag not in VOID:
            self.stack.append((self.protected,self.skipped))
            self.protected=self.protected or attrs.get('translate')=='no' or 'notranslate' in attrs.get('class','').split()
            self.skipped=self.skipped or tag in ('script','style')
    def handle_endtag(self, tag):
        if tag not in VOID and self.stack:self.protected,self.skipped=self.stack.pop()
    def handle_data(self, data):
        if self.skipped:return
        if re.search(r'\bMark\b',data) and not self.protected:self.errors.append('unprotected personal name: '+data)
        if re.search('[А-Яа-яЁё]',data):self.errors.append('Russian copy on English page: '+data)

pages=list((ROOT/'en').rglob('*.html'))
for path in pages:
    check=TranslationBoundaries();check.feed(path.read_text())
    assert not check.errors, f'{path}: {check.errors}'
english_interactions=(ROOT/'assets/interactions-en.js').read_text()
assert not re.search('[А-Яа-яЁё]',english_interactions), 'untranslated runtime interaction copy'
print(f'PASS: {len(pages)} English pages protect the personal name, allow prose translation and contain English copy.')
