import{a as q}from"./chunk-F2ITZKNL.js";import{a as l,c as S,d as b,e as D,f as N,g as M,h as E,j as T,l as x,n as O}from"./chunk-VUXMQJMP.js";import{$ as a,Aa as C,Db as P,Ia as R,J as c,Ja as F,Oa as I,S as m,U as h,V as u,Y as g,ca as f,gb as w,na as y,qa as v,vb as _,ya as A}from"./chunk-HOWSOM4S.js";var p=class n{static \u0275fac=function(e){return new(e||n)};static \u0275cmp=I({type:n,selectors:[["app-root"]],decls:1,vars:0,template:function(e,r){e&1&&w(0,"router-outlet")},dependencies:[T],encapsulation:2})};var L="@",Y=(()=>{class n{doc;delegate;zone;animationType;moduleImpl;_rendererFactoryPromise=null;scheduler=a(y,{optional:!0});loadingSchedulerFn=a(B,{optional:!0});_engine;constructor(e,r,o,i,s){this.doc=e,this.delegate=r,this.zone=o,this.animationType=i,this.moduleImpl=s}ngOnDestroy(){this._engine?.flush()}loadImpl(){let e=()=>this.moduleImpl??import("./chunk-AWMBE2DR.js").then(o=>o),r;return this.loadingSchedulerFn?r=this.loadingSchedulerFn(e):r=e(),r.catch(o=>{throw new h(5300,!1)}).then(({\u0275createEngine:o,\u0275AnimationRendererFactory:i})=>{this._engine=o(this.animationType,this.doc);let s=new i(this.delegate,this._engine,this.zone);return this.delegate=s,s})}createRenderer(e,r){let o=this.delegate.createRenderer(e,r);if(o.\u0275type===0)return o;typeof o.throwOnSyntheticProps=="boolean"&&(o.throwOnSyntheticProps=!1);let i=new d(o);return r?.data?.animation&&!this._rendererFactoryPromise&&(this._rendererFactoryPromise=this.loadImpl()),this._rendererFactoryPromise?.then(s=>{let z=s.createRenderer(e,r);i.use(z),this.scheduler?.notify(11)}).catch(s=>{i.use(o)}),i}begin(){this.delegate.begin?.()}end(){this.delegate.end?.()}whenRenderingDone(){return this.delegate.whenRenderingDone?.()??Promise.resolve()}static \u0275fac=function(r){R()};static \u0275prov=u({token:n,factory:n.\u0275fac})}return n})(),d=class{delegate;replay=[];\u0275type=1;constructor(t){this.delegate=t}use(t){if(this.delegate=t,this.replay!==null){for(let e of this.replay)e(t);this.replay=null}}get data(){return this.delegate.data}destroy(){this.replay=null,this.delegate.destroy()}createElement(t,e){return this.delegate.createElement(t,e)}createComment(t){return this.delegate.createComment(t)}createText(t){return this.delegate.createText(t)}get destroyNode(){return this.delegate.destroyNode}appendChild(t,e){this.delegate.appendChild(t,e)}insertBefore(t,e,r,o){this.delegate.insertBefore(t,e,r,o)}removeChild(t,e,r){this.delegate.removeChild(t,e,r)}selectRootElement(t,e){return this.delegate.selectRootElement(t,e)}parentNode(t){return this.delegate.parentNode(t)}nextSibling(t){return this.delegate.nextSibling(t)}setAttribute(t,e,r,o){this.delegate.setAttribute(t,e,r,o)}removeAttribute(t,e,r){this.delegate.removeAttribute(t,e,r)}addClass(t,e){this.delegate.addClass(t,e)}removeClass(t,e){this.delegate.removeClass(t,e)}setStyle(t,e,r,o){this.delegate.setStyle(t,e,r,o)}removeStyle(t,e,r){this.delegate.removeStyle(t,e,r)}setProperty(t,e,r){this.shouldReplay(e)&&this.replay.push(o=>o.setProperty(t,e,r)),this.delegate.setProperty(t,e,r)}setValue(t,e){this.delegate.setValue(t,e)}listen(t,e,r){return this.shouldReplay(e)&&this.replay.push(o=>o.listen(t,e,r)),this.delegate.listen(t,e,r)}shouldReplay(t){return this.replay!==null&&t.startsWith(L)}},B=new g("");function H(n="animations"){return C("NgAsyncAnimations"),f([{provide:F,useFactory:(t,e,r)=>new Y(t,e,r,n),deps:[P,N,v]},{provide:A,useValue:n==="noop"?"NoopAnimations":"BrowserAnimations"}])}var j=(n,t)=>{let e=a(O),{beginGregorianYear:r}=n.queryParams;return e.getYearsSince1996().includes(r)||E(n,["/portal"])};var k=[{path:"portal",loadComponent:()=>import("./chunk-PGAKONBF.js").then(n=>n.PortalComponent)},{path:"historical-review",canActivate:[j],loadComponent:()=>import("./chunk-XQNJMGG3.js").then(n=>n.HistoricalReviewComponent)},{path:"**",redirectTo:"portal",pathMatch:"full"}];var U=(n,t)=>{let e=a(q),r=Z();return e.startRequest(r),t(n).pipe(m({next:o=>{if(o.type===l.UploadProgress||o.type===l.DownloadProgress){let i=Math.round(100*o.loaded/o.total);e.updateProgress(r,i)}else o.type===l.Response&&e.completeRequest(r)},error:o=>{e.errorRequest(r)}}),c(()=>{e.getRequestProgress(r)&&e.completeRequest(r)}))},Z=()=>`${Date.now()}-${Math.random().toString(36).slice(2,9)}`;var V={providers:[H(),S(D(),b([U])),_({eventCoalescing:!0}),x(k)]};M(p,V).catch(n=>console.error(n));