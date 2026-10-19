export const VERSION=1;
export const TABLES=['books','logs','thoughts','experiments','reports'];
export const uid=()=>globalThis.crypto.randomUUID();
export const day=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
export const active=a=>a.filter(x=>!x.deletedAt);
export function empty(){return {schemaVersion:VERSION,updatedAt:new Date().toISOString(),books:[],logs:[],thoughts:[],experiments:[],reports:[],settings:{lastBackup:null,remindBackup:true}};}
export function range(kind,date=day()){
 const d=new Date(date+'T12:00:00');let a=new Date(d),b=new Date(d);
 if(kind==='week'){a.setDate(a.getDate()-(a.getDay()+6)%7);b=new Date(a);b.setDate(b.getDate()+6)}
 if(kind==='month'){a.setDate(1);b=new Date(d.getFullYear(),d.getMonth()+1,0,12)}
 if(kind==='year'){a=new Date(d.getFullYear(),0,1,12);b=new Date(d.getFullYear(),11,31,12)}
 return [day(a),day(b)];
}
export function statistics(db,start,end){
 const within=x=>x>=start&&x<=end;const logs=active(db.logs).filter(x=>within(x.date));
 const thoughts=active(db.thoughts).filter(x=>within(day(new Date(x.createdAt))));
 return {logs,pages:logs.reduce((s,x)=>s+x.pages,0),minutes:logs.reduce((s,x)=>s+(x.minutes||0),0),timed:logs.filter(x=>x.minutes!==null).length,books:active(db.books).filter(x=>x.status==='已读'&&within(x.finished||'')).length,thoughts:thoughts.length,experiments:active(db.experiments).filter(x=>within(x.start)).length,ended:active(db.experiments).filter(x=>x.status==='已结束'&&within(x.ended||'')).length,changes:active(db.thoughts).flatMap(t=>t.history.filter(h=>h.kind==='更新判断'&&within(day(new Date(h.at)))).map(h=>({thought:t,revision:h})))};
}
export function validDate(s){return typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&day(new Date(s+'T12:00:00'))===s;}
export function validate(input){
 const db=input?.data||input;if(!db||db.schemaVersion!==VERSION)throw Error('备份版本不受支持。请保留原文件，不会覆盖当前数据。');
 const str=(s,max=100000)=>typeof s==='string'&&s.length<=max;
 const refs=(a,set)=>Array.isArray(a)&&a.every(id=>typeof id==='string'&&set.has(id))&&new Set(a).size===a.length;
 const safeId=s=>str(s,100)&&/^[A-Za-z0-9_-]+$/.test(s);
 const ts=s=>str(s,50)&&!Number.isNaN(Date.parse(s));
 for(const k of TABLES){if(!Array.isArray(db[k])||db[k].length>100000)throw Error('备份中的数据列表无效');const ids=new Set();for(const x of db[k]){if(!x||!safeId(x.id)||ids.has(x.id)||!ts(x.createdAt)||!ts(x.updatedAt)||(x.deletedAt&&!ts(x.deletedAt)))throw Error('记录标识或时间无效');ids.add(x.id)}}
 const bs=new Set(db.books.map(x=>x.id)),ths=new Set(db.thoughts.map(x=>x.id)),exs=new Set(db.experiments.map(x=>x.id)),ls=new Set(db.logs.map(x=>x.id));
 const num=n=>Number.isInteger(n)&&n>=0&&n<=10000000;
 for(const b of db.books)if(!str(b.title,500)||!b.title.trim()||!str(b.author,500)||!['想读','在读','已读','暂停'].includes(b.status)||!num(b.total)||!num(b.position)||!(b.percent===null||num(b.percent)&&b.percent<=100)||!str(b.summary)||!num(b.rating)||b.rating>5||(b.started&&!validDate(b.started))||(b.finished&&!validDate(b.finished)))throw Error('书籍信息不完整');
 for(const l of db.logs)if(!bs.has(l.bookId)||!validDate(l.date)||!str(l.time,5)||!/^\d{2}:\d{2}$/.test(l.time)||!num(l.pages)||!(l.minutes===null||num(l.minutes))||!str(l.note)||(l.position!==null&&!num(l.position)))throw Error('阅读记录格式或来源无效');
 const statuses=['新收获','思考中','实践中','暂时认可','需要修正'];
 for(const t of db.thoughts){if(!str(t.title,500)||!str(t.understanding)||!str(t.authorView)||!str(t.question)||!refs(t.bookIds,bs)||!(t.logId===null||ls.has(t.logId))||!Array.isArray(t.tags)||!t.tags.every(v=>str(v,100))||!statuses.includes(t.status)||!Array.isArray(t.links)||!Array.isArray(t.history))throw Error('思想卡片格式无效');
 for(const l of t.links)if(!ths.has(l.target)||l.target===t.id||!['相关','支持','补充','质疑'].includes(l.type)||!str(l.reason))throw Error('思想关联无效');
 for(const h of t.history)if(!safeId(h.id)||!ts(h.at)||!str(h.kind,100)||!str(h.reason)||!str(h.understanding)||!str(h.title,500)||!str(h.authorView)||!str(h.question)||!statuses.includes(h.status)||!Array.isArray(h.tags)||!h.tags.every(v=>str(v,100))||!refs(h.bookIds,bs)||!(h.experimentId===null||exs.has(h.experimentId)))throw Error('修订历史无效');}
 for(const e of db.experiments){if(!str(e.title,500)||!str(e.hypothesis)||!str(e.action)||!str(e.observe)||!str(e.stop)||!refs(e.thoughtIds,ths)||!validDate(e.start)||(e.due&&!validDate(e.due))||(e.ended&&!validDate(e.ended))||!['进行中','已暂停','已结束'].includes(e.status)||!Array.isArray(e.feedback)||!str(e.conclusion)||!str(e.verdict,100))throw Error('实验信息无效');for(const f of e.feedback)if(!safeId(f.id)||!validDate(f.date)||!str(f.event)||!str(f.meaning))throw Error('实验反馈无效')}
 for(const r of db.reports)if(!['day','week','month','year'].includes(r.period)||!validDate(r.start)||!validDate(r.end)||r.end<r.start||!str(r.title,500)||!str(r.body)||!str(r.snapshot)||!ts(r.sourceUpdatedAt))throw Error('复盘报告无效');
 if(!db.settings||typeof db.settings.remindBackup!=='boolean'||!(db.settings.lastBackup===null||ts(db.settings.lastBackup))||!ts(db.updatedAt))throw Error('设置或数据时间无效');
 return structuredClone(db);
}
export function migrate(db){return validate(db)}
export function snapshot(db,start,end){const s=statistics(db,start,end);return `阅读页数：${s.pages} 页\n已记录时长：${s.minutes} 分钟（${s.timed}/${s.logs.length} 次记录填写时长）\n完成书籍：${s.books} 本\n新增思想：${s.thoughts} 张\n新建实验：${s.experiments} 个\n结束实验：${s.ended} 个\n更新判断：${s.changes.length} 次\n\n阅读收获：\n${s.logs.filter(l=>l.note).map(l=>`- ${l.date}《${db.books.find(b=>b.id===l.bookId)?.title||'已删除书籍'}》：${l.note}`).join('\n')||'暂无记录'}\n\n新增思想：\n${active(db.thoughts).filter(t=>day(new Date(t.createdAt))>=start&&day(new Date(t.createdAt))<=end).map(t=>'- '+t.title+'：'+t.understanding).join('\n')||'暂无记录'}\n\n实践反馈：\n${active(db.experiments).flatMap(e=>e.feedback.filter(f=>!f.deletedAt&&f.date>=start&&f.date<=end).map(f=>'- '+e.title+' / '+f.date+'：'+f.event+(f.meaning?'；'+f.meaning:''))).join('\n')||'暂无记录'}\n\n判断变化：\n${s.changes.map(x=>'- '+x.thought.title+'：'+x.revision.understanding).join('\n')||'暂无记录'}`;}
