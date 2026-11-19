#!/usr/bin/env python3
"""Notify participating engines after publication; acceptance is not indexing."""
import argparse,json,subprocess,urllib.request,xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import urlsplit
ROOT=Path(__file__).resolve().parents[1]
def payload(since=None):
 config=json.loads((ROOT/'content/indexnow.json').read_text())
 base='https://'+config['host']+'/'
 urls={n.text for n in ET.parse(ROOT/'sitemap.xml').iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')}
 if since:
  changed=subprocess.check_output(['git','diff','--name-only',since,'HEAD'],cwd=ROOT,text=True).splitlines()
  urls &= {base+p.removesuffix('index.html') for p in changed if p.endswith('index.html')}
 if any(urlsplit(u).netloc!=config['host'] for u in urls):raise ValueError('Only owned host URLs may be submitted')
 return dict(config,keyLocation=base+config['key']+'.txt',urlList=sorted(urls))
def main():
 parser=argparse.ArgumentParser();parser.add_argument('--since');parser.add_argument('--dry-run',action='store_true');args=parser.parse_args()
 data=payload(args.since)
 if not data['urlList']:print('No changed indexable HTML pages.');return
 if args.dry_run:print(json.dumps({'host':data['host'],'urlList':data['urlList']},indent=2));return
 with urllib.request.urlopen(data['keyLocation'],timeout=30) as r:
  if r.read().decode().strip()!=data['key']:raise RuntimeError('Public verification file is not deployed yet')
 request=urllib.request.Request('https://api.indexnow.org/indexnow',data=json.dumps(data).encode(),headers={'Content-Type':'application/json; charset=utf-8','User-Agent':'mserdyuk.ru IndexNow publisher'})
 with urllib.request.urlopen(request,timeout=60) as response:
  if response.status not in (200,202):raise RuntimeError(f'Unexpected response {response.status}')
  print(f'IndexNow HTTP {response.status}: received {len(data["urlList"])} URLs. This does not confirm indexing or ranking.')
if __name__=='__main__':main()
