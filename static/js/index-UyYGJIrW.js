import{_ as C}from"./avatar-9ZDWn2VD.js";import{d,u as g,o as _,c as r,a as e,n as x,p as f,b as m,_ as u,r as M,e as l,f as k,g as p,h as S,i as w,j as h,k as A}from"./index-pD4qL1Ha.js";import{u as B}from"./index-fvUWBsa8.js";const H=s=>(f("data-v-8f8cceb8"),s=s(),m(),s),y={class:"nav_head_h5_one"},P={class:"nav_head_h5_boxs"},T=H(()=>e("div",{class:"nav_head_h5_desc"}," 🌈 We are who we choose to be. ",-1)),N=d({__name:"nav-head-h5",props:{toggleBtn:{type:Boolean,default:!1}},emits:["changToggle"],setup(s,{emit:t}){const o=g(),n=s,a=t,c=v=>{a("changToggle",!1),o.push(v)};return(v,i)=>(_(),r("div",{class:x(["nav_head_h5",n.toggleBtn?"scale-in-tl":""])},[e("div",y,[e("div",P,[e("div",{class:"nav_head_h5_one",onClick:i[0]||(i[0]=$=>c("/"))},"Home"),e("div",{class:"nav_head_h5_one",onClick:i[1]||(i[1]=$=>c("/article"))},"Article"),e("div",{class:"nav_head_h5_one",onClick:i[2]||(i[2]=$=>c("/author"))},"Author")])]),T],2))}}),V=u(N,[["__scopeId","data-v-8f8cceb8"]]),b=s=>(f("data-v-f24913d5"),s=s(),m(),s),D={class:"navbar_h5"},E={class:"navbar_h5_left"},O=b(()=>e("img",{src:C,alt:""},null,-1)),j=[O],z={class:"navbar_h5_right"},R=b(()=>e("span",{class:"bar"},null,-1)),W=b(()=>e("span",{class:"bar"},null,-1)),q=[R,W],F=d({__name:"navbar-h5",setup(s){const t=g(),o=M(!1),n=a=>{o.value=a};return(a,c)=>(_(),r("div",null,[e("div",D,[e("div",E,[e("div",{class:"navbar_h5_left_img",onClick:c[0]||(c[0]=v=>l(t).push("/"))},j)]),e("div",z,[k("",!0),e("div",{class:x(["toggle-button",{"toggle-x":o.value}]),onClick:c[1]||(c[1]=v=>o.value=!o.value)},q,2)])]),o.value?(_(),p(V,{key:0,toggleBtn:o.value,onChangToggle:n},null,8,["toggleBtn"])):k("",!0)]))}}),G=u(F,[["__scopeId","data-v-f24913d5"]]),I=s=>(f("data-v-29ca9a83"),s=s(),m(),s),J={class:"navbar_pc"},K={class:"navbar_pc_left"},L=I(()=>e("img",{src:C,alt:""},null,-1)),Q=[L],U=I(()=>e("div",{class:"navbar_pc_right"},null,-1)),X=d({__name:"navbar-pc",setup(s){const t=g();return(o,n)=>(_(),r("div",null,[e("div",J,[e("div",K,[e("div",{class:"navbar_pc_left_img",onClick:n[0]||(n[0]=a=>l(t).push("/"))},Q),e("div",{class:"navbar_pc_left_one",onClick:n[1]||(n[1]=a=>l(t).push("/"))}," Home "),e("div",{class:"navbar_pc_left_one",onClick:n[2]||(n[2]=a=>l(t).push("/article"))}," Article "),e("div",{class:"navbar_pc_left_one",onClick:n[3]||(n[3]=a=>l(t).push("/author"))}," Author ")]),U])]))}}),Y=u(X,[["__scopeId","data-v-29ca9a83"]]),Z=d({__name:"index",setup(s){const t=B(),o=S(()=>t.isMobile);return(n,a)=>(_(),r("div",null,[o.value?(_(),p(G,{key:0})):(_(),p(Y,{key:1}))]))}}),ee={};function se(s,t){const o=w("router-view");return _(),r("div",null,[h(o)])}const te=u(ee,[["render",se]]);function oe(){return/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)}const ce=d({__name:"index",setup(s){const t=B();return A(()=>{oe()?t.setIsMobile(!0):t.setIsMobile(!1)}),(o,n)=>(_(),r("div",null,[h(Z),h(te)]))}});export{ce as default};
