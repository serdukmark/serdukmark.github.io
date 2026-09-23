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
  super().__init__(); self.refs=[];self.ids=[];self.h1=0;self.lang='';self.canonical=None;self.alternates={};self.title=False;self.title_text='';self.meta={};self.schemas=[];self.capture=None;self.buffer='';self.feed(text)
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'id' in a:self.ids.append(a['id'])
  if tag=='html':self.lang=a.get('lang')
  if tag=='h1':self.h1+=1
  if tag=='title':self.title=True
  if tag=='meta':self.meta[a.get('name',a.get('property'))]=a.get('content','')
  if tag=='title' or (tag=='script' and a.get('type')=='application/ld+json'):
   self.capture=tag;self.buffer=''
  if tag=='link' and a.get('rel')=='canonical':self.canonical=a['href']
  if tag=='link' and a.get('hreflang'):self.alternates[a['hreflang']]=a['href']
  for k in ('href','src'):
   if k in a:self.refs.append(a[k])
  if 'srcset' in a:self.refs.extend(x.strip().split()[0] for x in a['srcset'].split(','))
 def handle_data(self,data):
  if self.capture:self.buffer+=data
 def handle_endtag(self,tag):
  if tag==self.capture:
   if tag=='title':self.title_text=self.buffer
   else:self.schemas.append(json.loads(self.buffer))
   self.capture=None
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
 if rel.as_posix()=='404.html':
  if 'noindex' not in p.meta.get('robots','') or p.canonical or p.schemas:errors.append('404 must be noindex, without canonical or profile schema')
 else:
  url='https://mserdyuk.ru/'+str(rel).removesuffix('index.html')
  if not p.title_text or not p.meta.get('description') or p.canonical!=url or not all(x in p.alternates for x in ('ru','en','x-default')):errors.append(f'{rel}: missing or incorrect metadata')
  if 'noindex' in p.meta.get('robots',''):errors.append(f'{rel}: unexpected noindex')
  if p.meta.get('og:url')!=url:errors.append(f'{rel}: wrong Open Graph URL')
  for lang,alternate in p.alternates.items():
   dest=target(urlsplit(alternate).path,path)
   if dest not in pages or pages[dest].alternates.get(p.lang)!=url:errors.append(f'{rel}: non-reciprocal hreflang {lang}')
  graph=p.schemas[0].get('@graph',[]) if p.schemas else []
  nodes={n.get('@type'):n for n in graph}
  expected={'Person','WebSite','WebPage','CreativeWork','BreadcrumbList'} if 'projects' in rel.parts else {'Person','WebSite','ProfilePage'}
  if set(nodes)!=expected:errors.append(f'{rel}: incorrect schema types')
  else:
   page=nodes.get('WebPage',nodes.get('ProfilePage'))
   if page['url']!=url or page['inLanguage']!=p.lang or page['name']!=p.title_text:errors.append(f'{rel}: schema does not match page')
   if 'BreadcrumbList' in nodes:
    crumbs=nodes['BreadcrumbList']['itemListElement']
    if [x['position'] for x in crumbs]!=[1,2] or crumbs[-1]['item']!=url:errors.append(f'{rel}: incorrect breadcrumbs')
 for ref in p.refs:
  u=urlsplit(ref)
  if u.scheme or u.netloc:continue
  dest=target(unquote(u.path),path) if u.path else path
  if not dest.exists():errors.append(f'{rel}: missing {ref}')
  elif u.fragment and dest in pages and unquote(u.fragment) not in pages[dest].ids:errors.append(f'{rel}: missing fragment {ref}')
for file in ['sitemap.xml','feed.xml','en/feed.xml']:ET.parse(ROOT/file)
indexed=[p for path,p in pages.items() if path.name!='404.html']
for attr in ['title_text']:
 values=[getattr(p,attr) for p in indexed]
 if len(values)!=len(set(values)):errors.append(f'duplicate {attr}')
descriptions=[p.meta['description'] for p in indexed]
if len(descriptions)!=len(set(descriptions)):errors.append('duplicate descriptions')
locations={n.text for n in ET.parse(ROOT/'sitemap.xml').iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')}
if locations!={p.canonical for p in indexed}:errors.append('sitemap does not match indexable pages')
assert isinstance(json.loads((ROOT/'content/updates.json').read_text()),list)
if errors:raise SystemExit('\n'.join(errors))
print(f'PASS: {len(pages)} pages, all local resources, fragments, language metadata and XML feeds.')
