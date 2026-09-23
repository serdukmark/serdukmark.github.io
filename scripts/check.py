#!/usr/bin/env python3
"""Validate all generated routes, internal links, fragments and language metadata."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json
import xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
class Page(HTMLParser):
 def __init__(self,text):
  super().__init__(); self.refs=[];self.ids=[];self.h1=0;self.lang='';self.canonical=None;self.alternates={};self.title=False;self.feed(text)
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'id' in a:self.ids.append(a['id'])
  if tag=='html':self.lang=a.get('lang')
  if tag=='h1':self.h1+=1
  if tag=='title':self.title=True
  if tag=='link' and a.get('rel')=='canonical':self.canonical=a['href']
  if tag=='link' and a.get('hreflang'):self.alternates[a['hreflang']]=a['href']
  for k in ('href','src'):
   if k in a:self.refs.append(a[k])
  if 'srcset' in a:self.refs.extend(x.strip().split()[0] for x in a['srcset'].split(','))
def target(path,current):
 p=ROOT/path.lstrip('/') if path.startswith('/') else current.parent/path
 return p/'index.html' if p.is_dir() else p
pages={p:Page(p.read_text()) for p in ROOT.rglob('*.html') if '.git' not in p.parts and not p.name.startswith('yandex_')}
errors=[]
for path,p in pages.items():
 rel=path.relative_to(ROOT)
 if p.h1!=1:errors.append(f'{rel}: expected one h1')
 if len(set(p.ids))!=len(p.ids):errors.append(f'{rel}: duplicate IDs')
 if p.lang!=('en' if rel.parts[0]=='en' else 'ru'):errors.append(f'{rel}: wrong language')
 if not p.title or not p.canonical or not all(x in p.alternates for x in ('ru','en','x-default')):errors.append(f'{rel}: missing metadata')
 for ref in p.refs:
  u=urlsplit(ref)
  if u.scheme or u.netloc:continue
  dest=target(unquote(u.path),path) if u.path else path
  if not dest.exists():errors.append(f'{rel}: missing {ref}')
  elif u.fragment and dest in pages and unquote(u.fragment) not in pages[dest].ids:errors.append(f'{rel}: missing fragment {ref}')
for file in ['sitemap.xml','feed.xml','en/feed.xml']:ET.parse(ROOT/file)
assert isinstance(json.loads((ROOT/'content/updates.json').read_text()),list)
if errors:raise SystemExit('\n'.join(errors))
print(f'PASS: {len(pages)} pages, all local resources, fragments, language metadata and XML feeds.')
