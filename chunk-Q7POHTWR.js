import{i as b,l as w}from"./chunk-4YWPXFYR.js";import{Ca as a,Fa as i,Ga as c,Hb as h,Na as d,Ra as u,Ya as r,db as s,eb as m,fb as p,jb as g,lb as f,mb as v,nb as y}from"./chunk-4PLXI2BH.js";var _=()=>["/historical-review"],C=n=>({beginGregorianYear:n});function I(n,o){if(n&1&&(s(0,"button",13),g(1),m()),n&2){let e=o.$implicit;r("routerLink",v(3,_))("queryParams",y(4,C,e)),i(),f(" ",e," ")}}var x=class n{constructor(o){this.commonService=o;this._original3DImgs=["man_in_steamy_room","man-elf","man-genie","man-vampire","person-mage","troll","woman-super-villain","woman-zombie"],this.presidentImgs=this._shuffle(this._original3DImgs),this.gregorianYearList=this.commonService.getYearsSince1996()}_original3DImgs;presidentImgs;gregorianYearList;_shuffle(o){if(!Array.isArray(o))return[];let e=[...o];for(let t=e.length-1;t>0;t--){let l=Math.floor(Math.random()*(t+1));[e[t],e[l]]=[e[l],e[t]]}return e}static \u0275fac=function(e){return new(e||n)(c(w))};static \u0275cmp=d({type:n,selectors:[["app-portal"]],decls:18,vars:7,consts:[[1,"min-h-dvh","pt-24"],[1,"grid-flow-rows","grid","auto-rows-auto","gap-y-6"],[1,"flex","flex-col","items-center","justify-center"],["src","/images/portal-logo.png",1,"mb-2","h-[85px]"],["src","/images/portal-title.png",1,"my-2","h-[32px]","xl:my-[14px]","xl:h-[58px]"],[1,"text-center","text-2xl","font-bold","leading-9","text-primary"],[1,"flex","items-center","justify-center"],[1,"grid","grid-cols-2","gap-4","xl:grid-cols-5"],["type","button",3,"routerLink","queryParams",4,"ngFor","ngForOf"],[1,"absolute","bottom-0","w-full","overflow-hidden"],[1,"grid","translate-y-[7%]","grid-cols-4","gap-12","xl:grid-cols-6"],[1,"w-full",3,"src"],[1,"hidden","w-full","xl:block",3,"src"],["type","button",3,"routerLink","queryParams"]],template:function(e,t){e&1&&(s(0,"div",0)(1,"div",1)(2,"div",2),p(3,"img",3)(4,"img",4),m(),s(5,"div",5),g(6,"\u9078\u64C7\u67E5\u8A62\u5E74\u4EFD"),m(),s(7,"div",6)(8,"div",7),u(9,I,2,6,"button",8),m()()(),s(10,"div",9)(11,"div",10),p(12,"img",11)(13,"img",11)(14,"img",11)(15,"img",11)(16,"img",12)(17,"img",12),m()()()),e&2&&(i(9),r("ngForOf",t.gregorianYearList),i(3),r("src","/images/3d-president/"+t.presidentImgs[0]+".png",a),i(),r("src","/images/3d-president/"+t.presidentImgs[1]+".png",a),i(),r("src","/images/3d-president/"+t.presidentImgs[2]+".png",a),i(),r("src","/images/3d-president/"+t.presidentImgs[3]+".png",a),i(),r("src","/images/3d-president/"+t.presidentImgs[4]+".png",a),i(),r("src","/images/3d-president/"+t.presidentImgs[5]+".png",a))},dependencies:[h,b],styles:["button[_ngcontent-%COMP%]{height:48px;width:163px;border-radius:9999px;--tw-bg-opacity: 1;background-color:rgb(233 236 239 / var(--tw-bg-opacity, 1));font-size:1rem;line-height:1.5rem;font-weight:700}button[_ngcontent-%COMP%]:hover{--tw-bg-opacity: 1;background-color:rgb(212 0 155 / var(--tw-bg-opacity, 1));--tw-text-opacity: 1;color:rgb(255 255 255 / var(--tw-text-opacity, 1))}@media (min-width: 1280px){button[_ngcontent-%COMP%]{width:172px}}"]})};export{x as PortalComponent};