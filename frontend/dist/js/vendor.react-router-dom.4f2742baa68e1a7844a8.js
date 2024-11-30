/*! For license information please see vendor.react-router-dom.4f2742baa68e1a7844a8.js.LICENSE.txt */
"use strict";(self.webpackChunkseven7k_frontend=self.webpackChunkseven7k_frontend||[]).push([[43],{4976:(e,t,n)=>{var a,i;n.d(t,{Kd:()=>d,N_:()=>g,k2:()=>b});var r=n(6540),o=n(961),l=n(7767),s=n(5588);function c(){return c=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var a in n)Object.prototype.hasOwnProperty.call(n,a)&&(e[a]=n[a])}return e},c.apply(this,arguments)}function u(e,t){if(null==e)return{};var n,a,i={},r=Object.keys(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||(i[n]=e[n]);return i}new Set(["application/x-www-form-urlencoded","multipart/form-data","text/plain"]);const f=["onClick","relative","reloadDocument","replace","state","target","to","preventScrollReset","viewTransition"],p=["aria-current","caseSensitive","className","end","style","to","viewTransition","children"];try{window.__reactRouterVersion="6"}catch(R){}const v=r.createContext({isTransitioning:!1});new Map;const h=(a||(a=n.t(r,2))).startTransition;function d(e){let{basename:t,children:n,future:a,window:i}=e,o=r.useRef();null==o.current&&(o.current=(0,s.zR)({window:i,v5Compat:!0}));let c=o.current,[u,f]=r.useState({action:c.action,location:c.location}),{v7_startTransition:p}=a||{},v=r.useCallback((e=>{p&&h?h((()=>f(e))):f(e)}),[f,p]);return r.useLayoutEffect((()=>c.listen(v)),[c,v]),r.useEffect((()=>(0,l.V8)(a)),[a]),r.createElement(l.Ix,{basename:t,children:n,location:u.location,navigationType:u.action,navigator:c,future:a})}(i||(i=n.t(o,2))).flushSync,(a||(a=n.t(r,2))).useId;const w="undefined"!==typeof window&&"undefined"!==typeof window.document&&"undefined"!==typeof window.document.createElement,m=/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i,g=r.forwardRef((function(e,t){let n,{onClick:a,relative:i,reloadDocument:o,replace:p,state:v,target:h,to:d,preventScrollReset:g,viewTransition:b}=e,y=u(e,f),{basename:S}=r.useContext(l.jb),C=!1;if("string"===typeof d&&m.test(d)&&(n=d,w))try{let e=new URL(window.location.href),t=d.startsWith("//")?new URL(e.protocol+d):new URL(d),n=(0,s.pb)(t.pathname,S);t.origin===e.origin&&null!=n?d=n+t.search+t.hash:C=!0}catch(R){}let T=(0,l.$P)(d,{relative:i}),x=function(e,t){let{target:n,replace:a,state:i,preventScrollReset:o,relative:c,viewTransition:u}=void 0===t?{}:t,f=(0,l.Zp)(),p=(0,l.zy)(),v=(0,l.x$)(e,{relative:c});return r.useCallback((t=>{if(function(e,t){return 0===e.button&&(!t||"_self"===t)&&!function(e){return!!(e.metaKey||e.altKey||e.ctrlKey||e.shiftKey)}(e)}(t,n)){t.preventDefault();let n=void 0!==a?a:(0,s.AO)(p)===(0,s.AO)(v);f(e,{replace:n,state:i,preventScrollReset:o,relative:c,viewTransition:u})}}),[p,f,v,a,i,n,e,o,c,u])}(d,{replace:p,state:v,target:h,preventScrollReset:g,relative:i,viewTransition:b});return r.createElement("a",c({},y,{href:n||T,onClick:C||o?a:function(e){a&&a(e),e.defaultPrevented||x(e)},ref:t,target:h}))})),b=r.forwardRef((function(e,t){let{"aria-current":n="page",caseSensitive:a=!1,className:i="",end:o=!1,style:f,to:h,viewTransition:d,children:w}=e,m=u(e,p),b=(0,l.x$)(h,{relative:m.relative}),S=(0,l.zy)(),R=r.useContext(l.Rq),{navigator:C,basename:T}=r.useContext(l.jb),x=null!=R&&function(e,t){void 0===t&&(t={});let n=r.useContext(v);null==n&&(0,s.Oi)(!1);let{basename:a}=function(){let e=r.useContext(l.sp);return e||(0,s.Oi)(!1),e}(y.useViewTransitionState),i=(0,l.x$)(e,{relative:t.relative});if(!n.isTransitioning)return!1;let o=(0,s.pb)(n.currentLocation.pathname,a)||n.currentLocation.pathname,c=(0,s.pb)(n.nextLocation.pathname,a)||n.nextLocation.pathname;return null!=(0,s.B6)(i.pathname,c)||null!=(0,s.B6)(i.pathname,o)}(b)&&!0===d,k=C.encodeLocation?C.encodeLocation(b).pathname:b.pathname,L=S.pathname,O=R&&R.navigation&&R.navigation.location?R.navigation.location.pathname:null;a||(L=L.toLowerCase(),O=O?O.toLowerCase():null,k=k.toLowerCase()),O&&T&&(O=(0,s.pb)(O,T)||O);const U="/"!==k&&k.endsWith("/")?k.length-1:k.length;let F,j=L===k||!o&&L.startsWith(k)&&"/"===L.charAt(U),_=null!=O&&(O===k||!o&&O.startsWith(k)&&"/"===O.charAt(k.length)),E={isActive:j,isPending:_,isTransitioning:x},z=j?n:void 0;F="function"===typeof i?i(E):[i,j?"active":null,_?"pending":null,x?"transitioning":null].filter(Boolean).join(" ");let A="function"===typeof f?f(E):f;return r.createElement(g,c({},m,{"aria-current":z,className:F,ref:t,style:A,to:h,viewTransition:d}),"function"===typeof w?w(E):w)}));var y,S;(function(e){e.UseScrollRestoration="useScrollRestoration",e.UseSubmit="useSubmit",e.UseSubmitFetcher="useSubmitFetcher",e.UseFetcher="useFetcher",e.useViewTransitionState="useViewTransitionState"})(y||(y={})),function(e){e.UseFetcher="useFetcher",e.UseFetchers="useFetchers",e.UseScrollRestoration="useScrollRestoration"}(S||(S={}))}}]);