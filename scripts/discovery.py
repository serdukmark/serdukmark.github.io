# -*- coding: utf-8 -*-
"""Public, factual discovery pages and equivalent machine-readable text."""
from html import escape
from html.parser import HTMLParser
import json,re
from pathlib import Path
from urllib.parse import urljoin

TOPICS={
'expertise':{
 'title':['AI-продукты, discovery и бизнес-аналитика – Марк Сердюк','AI products, discovery and business analysis – Mark Serdyuk'],
 'heading':['Компетенции через реальные проекты','Capabilities through real projects'],
 'intro':['Моя работа соединяет управление AI-продуктами, исследование потребностей, бизнес-аналитику и обучение команд. Ниже – направления и проекты, в которых я их применял.','My work connects AI product management, user research, business analysis and team training. Below are the capabilities and projects where I applied them.'],
 'sections':[
  (['Корпоративные AI-продукты','Enterprise AI products'],['В Магнит Tech создал и вывел в эксплуатацию мультиагентного ассистента для поиска информации, расчётов, анализа метрик и отчётности. В Газпромнефть Бизнес-сервис апробировал LLM для работы с первичными учётными документами и ERP-системами.','At Magnit Tech I built and launched a multi-agent assistant for information retrieval, calculations, metrics and reporting. At Gazpromneft Business Service I piloted LLMs for accounting documents and ERP systems.'],['magnit','gazprom']),
  (['Discovery и исследование пользователей','Discovery and user research'],['Провёл 131 глубинное интервью с автосервисами в Т-Банке. В X5 Group участвовал в полевых исследованиях магазинов девяти регионов, построил CJM директоров-партнёров и сформировал более 50 предложений по улучшению.','I conducted 131 in-depth interviews with auto services at T-Bank. At X5 Group I conducted field research in stores across nine regions, mapped partner directors’ journeys and developed more than 50 improvement proposals.'],['tbank','x5']),
  (['Подготовка продукта к разработке','Preparing a product for development'],['В Яндексе собрал команду для сценария «Грузчик без машины», сформировал ценностное предложение, пользовательский путь, требования и приоритеты бэклога. Подготовил модель спроса и unit-экономику. Этот опыт относится к этапу до запуска.','At Yandex I assembled the team for “Mover without a van”, defined its value proposition, user journey, requirements and backlog priorities, and prepared demand and unit-economics models. This experience concerns the pre-launch stage.'],['yandex']),
  (['Обучение и работа с командой','Teaching and working with teams'],['Обучил 150+ продуктовых менеджеров и тимлидов работе с AI в Магнит Tech. В Центральном университете помогаю преподавать основы бизнес-аналитики. В проекте Стратегии образования до 2040 года руководил рабочей группой из восьми человек.','I trained more than 150 product managers and team leads in AI at Magnit Tech. At Central University I help teach business analytics. On the Education Strategy 2040 project I led a working group of eight.'],['magnit','government'])]},
'research':{
 'title':['Исследования БРИКС и преподавание – Марк Сердюк','BRICS research and teaching – Mark Serdyuk'],
 'heading':['Исследования и преподавание','Research and teaching'],
 'intro':['Участвую в международных финансовых исследованиях и передаю опыт студентам Центрального университета: через учебные кейсы, консультации и менторство команд.','I contribute to international financial research and share experience with Central University students through teaching cases, consultations and team mentoring.'],
 'sections':[
  (['Международные финансовые исследования','International financial research'],['Участвовал в подготовке международных докладов совместно с «Яков и Партнёры» и Минфином России. Исследования представлены на семинаре БРИКС в Бразилии в 2025 году и на съезде Нового банка развития в 2026 году. Моя роль – участие в подготовке исследований.','I contributed to international reports with Yakov and Partners and the Russian Ministry of Finance. Research was presented at a BRICS seminar in Brazil in 2025 and a New Development Bank meeting in 2026. My role was contributing to the research.'],[]),
  (['Основы бизнес-аналитики','Fundamentals of Business Analytics'],['С апреля 2025 года – индустриальный ассистент курса в Центральном университете. Разрабатывал и проверял более 100 учебных кейсов; на консультационных занятиях работал с группами до 170 студентов.','Since April 2025 I have been an industry teaching assistant at Central University. I developed and reviewed more than 100 teaching cases and worked with groups of up to 170 students in consultation sessions.'],[]),
  (['Менторство команд','Team mentoring'],['Ментор команд-призёров и победителей финалов DEADLINE 2025 и 2026 годов. Преподавательскую деятельность совмещаю с работой над индустриальными проектами.','I mentored teams with podium finishes and wins at the DEADLINE finals in 2025 and 2026, combining teaching with industry projects.'],['magnit'])]},
'speaking':{
 'title':['Выступления и публикации – Марк Сердюк','Speaking and publications – Mark Serdyuk'],
 'heading':['На сцене и в публикациях','On stage and in publications'],
 'intro':['Выступаю о первых шагах в карьере и делюсь опытом продуктовой работы. Здесь собраны материалы выступления на «Найти IT» и участия в спецпроекте Forbes.ru.','I speak about the first steps in a career and share product-work experience. This page brings together my Find IT talk and participation in a Forbes.ru special project.'],
 'sections':[
  (['Карьерный форум «Найти IT»','Find IT career forum'],['На форуме FutureToday вместе с Иваном рассказал о первых шагах после выхода на работу. В выступлении мы разобрали пять правил: предлагать следующий шаг, общаться без барьеров, показывать полезную работу, спрашивать по делу и проверять привычные подходы.','At FutureToday’s forum I spoke with Ivan about the first steps after starting a job. We discussed five rules: propose the next step, communicate without barriers, show useful work, ask focused questions and examine established approaches.'],[]),
  (['Спецпроект Forbes.ru','Forbes.ru special project'],['Принял участие в интервью и фотосессии для спецпроекта Forbes.ru. Рассказ об участии опубликован в моём Telegram-канале.','I took part in an interview and photoshoot for a Forbes.ru special project. My Telegram channel contains a post about the participation.'],[]) ]}}

def extra_pages(api):
 t=api['t']; home=api['home']; caseurl=api['caseurl']; cases=api['CASES']; v=api['v']
 byslug={c['slug']:c for c in cases}
 urls=[]
 for slug,data in TOPICS.items():
  path=home()+slug+'/'
  parts=[f'<main id="main" class="knowledge-page wrap"><span id="top"></span><nav class="breadcrumbs" aria-label="{t("Путь по сайту","Breadcrumbs")}"><a href="{home()}">{t("Главная","Home")}</a><span>{v(data["heading"])}</span></nav><p class="eyebrow">{t("Марк Сердюк","Mark Serdyuk")}</p><h1>{v(data["heading"])}</h1><p class="knowledge-lead">{v(data["intro"])}</p>']
  for i,(heading,text,related) in enumerate(data['sections']):
   parts.append(f'<section id="section-{i+1}"><h2>{v(heading)}</h2><p>{v(text)}</p>')
   if related:parts.append('<div class="related-links">'+''.join(f'<a href="{caseurl(byslug[s])}">{v(byslug[s]["company"])}</a>' for s in related)+'</div>')
   if slug=='speaking':
    url='https://t.me/mserdyuk/19' if i==0 else 'https://t.me/mserdyuk/24'
    label=t('Материалы выступления в Telegram','Talk materials on Telegram') if i==0 else t('Рассказ об участии в Telegram','Participation post on Telegram')
    image='forum.jpg' if i==0 else 'forbes-backstage.jpg'
    parts.append(f'<a href="{url}" target="_blank" rel="noopener">{label}</a><img class="knowledge-photo" src="/assets/img/{image}" alt="{v(heading)}" loading="lazy" width="680" height="480">')
   parts.append('</section>')
  parts.append(f'<p class="case-source">{t("Сведения об опыте: резюме Марка Сердюка, ноябрь 2026, и публикации автора.","Experience information: Mark Serdyuk’s November 2026 resume and author posts.")} <a href="/serdyuk-mark-cv.pdf">{t("Резюме PDF","Resume PDF (Russian)")}</a></p><a class="button primary" href="https://t.me/serdukmark">{t("Связаться со мной","Contact me")}</a></main>')
  api['write'](path.lstrip('/')+'index.html',api['head'](v(data['title']),v(data['intro']),path)+api['header'](path)+''.join(parts)+api['footer']())
  urls.append(api['DOMAIN']+path)
 path=home()+'projects/'
 title=t('Проекты и опыт – Марк Сердюк','Projects and experience – Mark Serdyuk')
 intro=t('Кейсы AI-продуктов, исследований пользователей, бизнес-аналитики и командной работы в шести организациях.','AI product, user research, business analysis and team delivery cases across six organisations.')
 cards=''.join(f'<a class="knowledge-card" href="{caseurl(c)}"><span class="eyebrow">{v(c["company"])} · {v(c["period"])}</span><h2>{v(api["DISCOVERY"][c["slug"]]["heading"])}</h2><p>{v(c["summary"])}</p><span>{v(c["role"])}</span></a>' for c in cases)
 body=f'<main id="main" class="knowledge-page wrap"><span id="top"></span><nav class="breadcrumbs"><a href="{home()}">{t("Главная","Home")}</a></nav><h1>{t("Проекты и опыт","Projects and experience")}</h1><p class="knowledge-lead">{intro}</p><div class="knowledge-grid">{cards}</div></main>'
 api['write'](path.lstrip('/')+'index.html',api['head'](title,intro,path)+api['header'](path)+body+api['footer']());urls.append(api['DOMAIN']+path)
 return urls

class MainText(HTMLParser):
 """Readable equivalent of visible main content; no bot-only facts or directives."""
 def __init__(self,base):super().__init__();self.base=base;self.active=False;self.skip=0;self.parts=[];self.hrefs=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='main':self.active=True
  if not self.active:return
  if tag in ('script','style','canvas'):self.skip+=1
  if self.skip:return
  if tag in ('h1','h2','h3','h4'):self.parts.append('\n\n'+'#'*int(tag[1])+' ')
  elif tag in ('p','section','article','div','nav','ul','dl','dt','dd','details'):self.parts.append('\n\n')
  elif tag=='li':self.parts.append('\n- ')
  elif tag=='br':self.parts.append('\n')
  elif tag=='a':self.parts.append('[');self.hrefs.append(urljoin(self.base,a.get('href','')))
 def handle_endtag(self,tag):
  if tag=='main':self.active=False
  if tag in ('script','style','canvas') and self.skip:self.skip-=1;return
  if not self.active or self.skip:return
  if tag=='a' and self.hrefs:self.parts.append(']('+self.hrefs.pop()+') ')
  elif tag in ('h1','h2','h3','h4','p','li','div'):self.parts.append('\n')
  elif tag in ('span','strong','b','a'):self.parts.append(' ')
 def handle_data(self,data):
  if self.active and not self.skip:self.parts.append(data)
 def result(self):return re.sub(r'\n[ \t]*\n(?:[ \t]*\n)+','\n\n',''.join(self.parts)).strip()

def text_exports(root,urls):
 contents=[];index=[]
 for url in urls:
  rel=url.replace('https://mserdyuk.ru/','')
  page=root/rel/'index.html'; html=page.read_text(); parser=MainText(url);parser.feed(html)
  title=re.search(r'<title>(.*?)</title>',html).group(1)
  dest=(root/rel/'index.md');md=f'Source: {url}\nUpdated: 2026-11-19\n\n'+parser.result()+'\n';dest.write_text(md)
  index.append(f'- [{title}]({url}): [Markdown]({url}index.md)')
  contents.append(md)
 (root/'llms.txt').write_text('# Mark Serdyuk / Марк Сердюк\n\n> Personal portfolio of an AI product manager. Russian and English pages cover work, research, teaching and speaking.\n\n## Pages\n\n'+'\n'.join(index)+'\n\n## Full text\n\n- [All page text](https://mserdyuk.ru/llms-full.txt)\n')
 (root/'llms-full.txt').write_text('\n\n---\n\n'.join(contents))
