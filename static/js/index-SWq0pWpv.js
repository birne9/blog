import{_ as f}from"./avatar-9ZDWn2VD.js";import{d as v,u as b,o as _,c as r,a as e,n as $,_ as u,r as k,b as c,e as p,f as M,p as C,g as x,h as B,i as S,j as h,k as A}from"./index-dacjbQIc.js";import{u as I}from"./index-M0YCMKHI.js";const H={class:"nav_head_h5_boxs"},y=v({__name:"nav-head-h5",props:{toggleBtn:{type:Boolean,default:!1}},emits:["changToggle"],setup(t,{emit:n}){const s=b(),o=t,a=n,l=d=>{a("changToggle",!1),s.push(d)};return(d,i)=>(_(),r("div",null,[e("div",{class:$(["nav_head_h5",o.toggleBtn?"scale-in-tl":""])},[e("div",H,[e("div",{class:"nav_head_h5_one",onClick:i[0]||(i[0]=m=>l("/"))},"Home"),e("div",{class:"nav_head_h5_one",onClick:i[1]||(i[1]=m=>l("/about"))},"About"),e("div",{class:"nav_head_h5_one",onClick:i[2]||(i[2]=m=>l("/author"))},"Author")])],2)]))}}),P=u(y,[["__scopeId","data-v-0fa69373"]]),g=t=>(C("data-v-c2ba9128"),t=t(),x(),t),T={class:"navbar_h5"},z={class:"navbar_h5_left"},E=g(()=>e("img",{src:f,alt:""},null,-1)),N=[E],V=g(()=>e("span",{class:"bar"},null,-1)),D=g(()=>e("span",{class:"bar"},null,-1)),O=[V,D],j=v({__name:"navbar-h5",setup(t){const n=b(),s=k(!1),o=a=>{s.value=a};return(a,l)=>(_(),r("div",null,[e("div",T,[e("div",z,[e("div",{class:"navbar_h5_left_img",onClick:l[0]||(l[0]=d=>c(n).push("/"))},N)]),e("div",{class:"navbar_h5_right",onClick:l[1]||(l[1]=d=>s.value=!s.value)},[e("div",{class:$(["toggle-button",{"toggle-x":s.value}])},O,2)])]),s.value?(_(),p(P,{key:0,toggleBtn:s.value,onChangToggle:o},null,8,["toggleBtn"])):M("",!0)]))}}),L=u(j,[["__scopeId","data-v-c2ba9128"]]),w=t=>(C("data-v-7780fb1b"),t=t(),x(),t),R={class:"navbar_pc"},U={class:"navbar_pc_left"},q=w(()=>e("img",{src:f,alt:""},null,-1)),F=[q],G=w(()=>e("div",{class:"navbar_pc_right"},null,-1)),J=v({__name:"navbar-pc",setup(t){const n=b();return(s,o)=>(_(),r("div",null,[e("div",R,[e("div",U,[e("div",{class:"navbar_pc_left_img",onClick:o[0]||(o[0]=a=>c(n).push("/"))},F),e("div",{class:"navbar_pc_left_one",onClick:o[1]||(o[1]=a=>c(n).push("/"))}," Home "),e("div",{class:"navbar_pc_left_one",onClick:o[2]||(o[2]=a=>c(n).push("/about"))}," About "),e("div",{class:"navbar_pc_left_one",onClick:o[3]||(o[3]=a=>c(n).push("/author"))}," Author ")]),G])]))}}),K=u(J,[["__scopeId","data-v-7780fb1b"]]),Q=v({__name:"index",setup(t){const n=I(),s=k(!1);return B(()=>{s.value=n.isMobile}),(o,a)=>(_(),r("div",null,[s.value?(_(),p(L,{key:0})):(_(),p(K,{key:1}))]))}}),W={};function X(t,n){const s=S("router-view");return _(),r("div",null,[h(s)])}const Y=u(W,[["render",X]]);function Z(){return/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)}const ne=v({__name:"index",setup(t){const n=I();return B(()=>{window.onresize=()=>{Z()?n.setIsMobile(!0):n.setIsMobile(!1)}}),A(()=>{window.removeEventListener("resize",()=>{console.log("移除")})}),(s,o)=>(_(),r("div",null,[h(Q),h(Y)]))}});export{ne as default};
