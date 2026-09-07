export type Profile={name:string;points:[number,number][];holes:[number,number][][];w:number;d:number};
export function parseDxf(text:string):{profiles:Profile[];notice:string}{
 if(text.startsWith('AutoCAD Binary'))throw Error('暂不支持二进制 DXF，请另存为 ASCII DXF');
 const lines=text.replace(/\r/g,'').split('\n'),pairs:[number,string][]=[];
 for(let i=0;i+1<lines.length;i+=2){const n=Number(lines[i].trim());if(!Number.isFinite(n))throw Error('DXF 格式无效');pairs.push([n,lines[i+1].trim()]);}
 let unit=0;for(let i=0;i<pairs.length-1;i++)if(pairs[i][1]==='$INSUNITS')unit=Number(pairs[i+1][1]);
 const scales:Record<number,number>={0:1,1:25.4,2:304.8,4:1,5:10,6:1000};if(!(unit in scales))throw Error('暂不支持此图纸单位，请将 CAD 单位设为毫米后导出');const scale=scales[unit];
 const loops:[number,number][][]=[],circles:[number,number][][]=[];let active=false,ignored=0;
 for(let i=0;i<pairs.length;i++){if(pairs[i][0]===2&&pairs[i][1]==='ENTITIES'){active=true;continue;}if(pairs[i][1]==='ENDSEC'){active=false;continue;}if(!active||pairs[i][0]!==0)continue;
 const type=pairs[i][1];let j=i+1;while(j<pairs.length&&pairs[j][0]!==0)j++;const fields=pairs.slice(i+1,j);i=j-1;const get=(code:number)=>Number(fields.find(p=>p[0]===code)?.[1]??0);
 if(type==='LWPOLYLINE'){const pts:[number,number][]=[];for(const [c,v] of fields){if(c===10)pts.push([Number(v)*scale,0]);if(c===20&&pts.length)pts[pts.length-1][1]=Number(v)*scale;}
 if((get(70)&1)&&pts.length>=3&&!fields.some(([c,v])=>c===42&&Number(v)!==0))loops.push(pts);else ignored++;
 }else if(type==='CIRCLE'){const x=get(10)*scale,y=get(20)*scale,r=get(40)*scale;if(r>0)circles.push(Array.from({length:96},(_,k)=>[x+r*Math.cos(k*Math.PI/48),y+r*Math.sin(k*Math.PI/48)]));}else ignored++;
 }
 const inside=(p:[number,number],poly:[number,number][])=>{let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])yes=!yes;}return yes;};
 const all=[...loops,...circles];const outer=all.filter(a=>!all.some(b=>a!==b&&a.every(p=>inside(p,b))));
 const profiles=outer.map((pts,i)=>{const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys),w=maxX-minX,d=maxY-minY;const norm=(p:[number,number]):[number,number]=>[(p[0]-minX)/w,1-(p[1]-minY)/d];return {name:`轮廓 ${i+1} · ${w.toFixed(1)} × ${d.toFixed(1)} mm`,points:pts.map(norm),holes:all.filter(a=>a!==pts&&a.every(p=>inside(p,pts))).map(a=>a.map(norm)),w,d};}).filter(p=>p.w>0&&p.d>0&&Number.isFinite(p.w+p.d));
 if(!profiles.length)throw Error('未找到支持的闭合轮廓。请在 CAD 中用 PEDIT 将线段连接为闭合轻量多段线；当前支持无圆弧的 LWPOLYLINE 和 CIRCLE。');
 if(profiles.length>100)throw Error('轮廓过多，请只导出需要建模的零件');
 return {profiles,notice:`识别到 ${profiles.length} 个轮廓。${unit===0?'图纸未指定单位，暂按毫米，请核对尺寸。':''}${ignored?`已跳过 ${ignored} 个不支持的实体（如文字、尺寸、线段或圆弧）。`:''}`};
}
