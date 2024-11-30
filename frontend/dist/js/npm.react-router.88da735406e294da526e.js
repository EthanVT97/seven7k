/*! For license information please see npm.react-router.88da735406e294da526e.js.LICENSE.txt */
"use strict";(self.webpackChunkseven7k_frontend=self.webpackChunkseven7k_frontend||[]).push([[825],{7767:(e,t,r)=>{var n;r.d(t,{$P:()=>h,BV:()=>L,Ix:()=>z,Rq:()=>u,V8:()=>H,Zp:()=>g,jb:()=>s,qh:()=>w,sp:()=>l,sv:()=>T,x$:()=>x,zy:()=>m});var a=r(6540),o=r(5588);function i(){return i=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var r=arguments[t];for(var n in r)Object.prototype.hasOwnProperty.call(r,n)&&(e[n]=r[n])}return e},i.apply(this,arguments)}const l=a.createContext(null);const u=a.createContext(null);const s=a.createContext(null);const c=a.createContext(null);const p=a.createContext({outlet:null,matches:[],isDataRoute:!1});const d=a.createContext(null);function h(e,t){let{relative:r}=void 0===t?{}:t;v()||(0,o.Oi)(!1);let{basename:n,navigator:i}=a.useContext(s),{hash:l,pathname:u,search:c}=x(e,{relative:r}),p=u;return"/"!==n&&(p="/"===u?n:(0,o.HS)([n,u])),i.createHref({pathname:p,search:c,hash:l})}function v(){return null!=a.useContext(c)}function m(){return v()||(0,o.Oi)(!1),a.useContext(c).location}function f(e){a.useContext(s).static||a.useLayoutEffect(e)}function g(){let{isDataRoute:e}=a.useContext(p);return e?function(){let{router:e}=P(O.UseNavigateStable),t=B(S.UseNavigateStable),r=a.useRef(!1);return f((()=>{r.current=!0})),a.useCallback((function(n,a){void 0===a&&(a={}),r.current&&("number"===typeof n?e.navigate(n):e.navigate(n,i({fromRouteId:t},a)))}),[e,t])}():function(){v()||(0,o.Oi)(!1);let e=a.useContext(l),{basename:t,future:r,navigator:n}=a.useContext(s),{matches:i}=a.useContext(p),{pathname:u}=m(),c=JSON.stringify((0,o.yD)(i,r.v7_relativeSplatPath)),d=a.useRef(!1);return f((()=>{d.current=!0})),a.useCallback((function(r,a){if(void 0===a&&(a={}),!d.current)return;if("number"===typeof r)return void n.go(r);let i=(0,o.Gh)(r,JSON.parse(c),u,"path"===a.relative);null==e&&"/"!==t&&(i.pathname="/"===i.pathname?t:(0,o.HS)([t,i.pathname])),(a.replace?n.replace:n.push)(i,a.state,a)}),[t,n,c,u,e])}()}const y=a.createContext(null);function x(e,t){let{relative:r}=void 0===t?{}:t,{future:n}=a.useContext(s),{matches:i}=a.useContext(p),{pathname:l}=m(),u=JSON.stringify((0,o.yD)(i,n.v7_relativeSplatPath));return a.useMemo((()=>(0,o.Gh)(e,JSON.parse(u),l,"path"===r)),[e,u,l,r])}function C(e,t,r,n){v()||(0,o.Oi)(!1);let{navigator:l}=a.useContext(s),{matches:u}=a.useContext(p),d=u[u.length-1],h=d?d.params:{},f=(d&&d.pathname,d?d.pathnameBase:"/");d&&d.route;let g,y=m();if(t){var x;let e="string"===typeof t?(0,o.Rr)(t):t;"/"===f||(null==(x=e.pathname)?void 0:x.startsWith(f))||(0,o.Oi)(!1),g=e}else g=y;let C=g.pathname||"/",E=C;if("/"!==f){let e=f.replace(/^\//,"").split("/");E="/"+C.replace(/^\//,"").split("/").slice(e.length).join("/")}let R=(0,o.ue)(e,{pathname:E});let b=k(R&&R.map((e=>Object.assign({},e,{params:Object.assign({},h,e.params),pathname:(0,o.HS)([f,l.encodeLocation?l.encodeLocation(e.pathname).pathname:e.pathname]),pathnameBase:"/"===e.pathnameBase?f:(0,o.HS)([f,l.encodeLocation?l.encodeLocation(e.pathnameBase).pathname:e.pathnameBase])}))),u,r,n);return t&&b?a.createElement(c.Provider,{value:{location:i({pathname:"/",search:"",hash:"",state:null,key:"default"},g),navigationType:o.rc.Pop}},b):b}function E(){let e=function(){var e;let t=a.useContext(d),r=U(S.UseRouteError),n=B(S.UseRouteError);if(void 0!==t)return t;return null==(e=r.errors)?void 0:e[n]}(),t=(0,o.pX)(e)?e.status+" "+e.statusText:e instanceof Error?e.message:JSON.stringify(e),r=e instanceof Error?e.stack:null,n="rgba(200,200,200, 0.5)",i={padding:"0.5rem",backgroundColor:n};return a.createElement(a.Fragment,null,a.createElement("h2",null,"Unexpected Application Error!"),a.createElement("h3",{style:{fontStyle:"italic"}},t),r?a.createElement("pre",{style:i},r):null,null)}const R=a.createElement(E,null);class b extends a.Component{constructor(e){super(e),this.state={location:e.location,revalidation:e.revalidation,error:e.error}}static getDerivedStateFromError(e){return{error:e}}static getDerivedStateFromProps(e,t){return t.location!==e.location||"idle"!==t.revalidation&&"idle"===e.revalidation?{error:e.error,location:e.location,revalidation:e.revalidation}:{error:void 0!==e.error?e.error:t.error,location:t.location,revalidation:e.revalidation||t.revalidation}}componentDidCatch(e,t){console.error("React Router caught the following error during render",e,t)}render(){return void 0!==this.state.error?a.createElement(p.Provider,{value:this.props.routeContext},a.createElement(d.Provider,{value:this.state.error,children:this.props.component})):this.props.children}}function _(e){let{routeContext:t,match:r,children:n}=e,o=a.useContext(l);return o&&o.static&&o.staticContext&&(r.route.errorElement||r.route.ErrorBoundary)&&(o.staticContext._deepestRenderedBoundaryId=r.route.id),a.createElement(p.Provider,{value:t},n)}function k(e,t,r,n){var i;if(void 0===t&&(t=[]),void 0===r&&(r=null),void 0===n&&(n=null),null==e){var l;if(!r)return null;if(r.errors)e=r.matches;else{if(!(null!=(l=n)&&l.v7_partialHydration&&0===t.length&&!r.initialized&&r.matches.length>0))return null;e=r.matches}}let u=e,s=null==(i=r)?void 0:i.errors;if(null!=s){let e=u.findIndex((e=>e.route.id&&void 0!==(null==s?void 0:s[e.route.id])));e>=0||(0,o.Oi)(!1),u=u.slice(0,Math.min(u.length,e+1))}let c=!1,p=-1;if(r&&n&&n.v7_partialHydration)for(let a=0;a<u.length;a++){let e=u[a];if((e.route.HydrateFallback||e.route.hydrateFallbackElement)&&(p=a),e.route.id){let{loaderData:t,errors:n}=r,a=e.route.loader&&void 0===t[e.route.id]&&(!n||void 0===n[e.route.id]);if(e.route.lazy||a){c=!0,u=p>=0?u.slice(0,p+1):[u[0]];break}}}return u.reduceRight(((e,n,o)=>{let i,l=!1,d=null,h=null;var v;r&&(i=s&&n.route.id?s[n.route.id]:void 0,d=n.route.errorElement||R,c&&(p<0&&0===o?(v="route-fallback",!1||D[v]||(D[v]=!0),l=!0,h=null):p===o&&(l=!0,h=n.route.hydrateFallbackElement||null)));let m=t.concat(u.slice(0,o+1)),f=()=>{let t;return t=i?d:l?h:n.route.Component?a.createElement(n.route.Component,null):n.route.element?n.route.element:e,a.createElement(_,{match:n,routeContext:{outlet:e,matches:m,isDataRoute:null!=r},children:t})};return r&&(n.route.ErrorBoundary||n.route.errorElement||0===o)?a.createElement(b,{location:r.location,revalidation:r.revalidation,component:d,error:i,children:f(),routeContext:{outlet:null,matches:m,isDataRoute:!0}}):f()}),null)}var O=function(e){return e.UseBlocker="useBlocker",e.UseRevalidator="useRevalidator",e.UseNavigateStable="useNavigate",e}(O||{}),S=function(e){return e.UseBlocker="useBlocker",e.UseLoaderData="useLoaderData",e.UseActionData="useActionData",e.UseRouteError="useRouteError",e.UseNavigation="useNavigation",e.UseRouteLoaderData="useRouteLoaderData",e.UseMatches="useMatches",e.UseRevalidator="useRevalidator",e.UseNavigateStable="useNavigate",e.UseRouteId="useRouteId",e}(S||{});function P(e){let t=a.useContext(l);return t||(0,o.Oi)(!1),t}function U(e){let t=a.useContext(u);return t||(0,o.Oi)(!1),t}function B(e){let t=function(){let e=a.useContext(p);return e||(0,o.Oi)(!1),e}(),r=t.matches[t.matches.length-1];return r.route.id||(0,o.Oi)(!1),r.route.id}const D={};const N={};const F=(e,t,r)=>{var n;N[n="\u26a0\ufe0f React Router Future Flag Warning: "+t+". You can use the `"+e+"` future flag to opt-in early. For more information, see "+r+"."]||(N[n]=!0,console.warn(n))};function H(e,t){null!=e&&e.v7_startTransition||F("v7_startTransition","React Router will begin wrapping state updates in `React.startTransition` in v7","https://reactrouter.com/v6/upgrading/future#v7_starttransition"),null!=e&&e.v7_relativeSplatPath||t&&t.v7_relativeSplatPath||F("v7_relativeSplatPath","Relative route resolution within Splat routes is changing in v7","https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath"),t&&(t.v7_fetcherPersist||F("v7_fetcherPersist","The persistence behavior of fetchers is changing in v7","https://reactrouter.com/v6/upgrading/future#v7_fetcherpersist"),t.v7_normalizeFormMethod||F("v7_normalizeFormMethod","Casing of `formMethod` fields is being normalized to uppercase in v7","https://reactrouter.com/v6/upgrading/future#v7_normalizeformmethod"),t.v7_partialHydration||F("v7_partialHydration","`RouterProvider` hydration behavior is changing in v7","https://reactrouter.com/v6/upgrading/future#v7_partialhydration"),t.v7_skipActionErrorRevalidation||F("v7_skipActionErrorRevalidation","The revalidation behavior after 4xx/5xx `action` responses is changing in v7","https://reactrouter.com/v6/upgrading/future#v7_skipactionerrorrevalidation"))}(n||(n=r.t(a,2))).startTransition;function T(e){return function(e){let t=a.useContext(p).outlet;return t?a.createElement(y.Provider,{value:e},t):t}(e.context)}function w(e){(0,o.Oi)(!1)}function z(e){let{basename:t="/",children:r=null,location:n,navigationType:l=o.rc.Pop,navigator:u,static:p=!1,future:d}=e;v()&&(0,o.Oi)(!1);let h=t.replace(/^\/*/,"/"),m=a.useMemo((()=>({basename:h,navigator:u,static:p,future:i({v7_relativeSplatPath:!1},d)})),[h,d,u,p]);"string"===typeof n&&(n=(0,o.Rr)(n));let{pathname:f="/",search:g="",hash:y="",state:x=null,key:C="default"}=n,E=a.useMemo((()=>{let e=(0,o.pb)(f,h);return null==e?null:{location:{pathname:e,search:g,hash:y,state:x,key:C},navigationType:l}}),[h,f,g,y,x,C,l]);return null==E?null:a.createElement(s.Provider,{value:m},a.createElement(c.Provider,{children:r,value:E}))}function L(e){let{children:t,location:r}=e;return C(M(t),r)}new Promise((()=>{}));a.Component;function M(e,t){void 0===t&&(t=[]);let r=[];return a.Children.forEach(e,((e,n)=>{if(!a.isValidElement(e))return;let i=[...t,n];if(e.type===a.Fragment)return void r.push.apply(r,M(e.props.children,i));e.type!==w&&(0,o.Oi)(!1),e.props.index&&e.props.children&&(0,o.Oi)(!1);let l={id:e.props.id||i.join("-"),caseSensitive:e.props.caseSensitive,element:e.props.element,Component:e.props.Component,index:e.props.index,path:e.props.path,loader:e.props.loader,action:e.props.action,errorElement:e.props.errorElement,ErrorBoundary:e.props.ErrorBoundary,hasErrorBoundary:null!=e.props.ErrorBoundary||null!=e.props.errorElement,shouldRevalidate:e.props.shouldRevalidate,handle:e.props.handle,lazy:e.props.lazy};e.props.children&&(l.children=M(e.props.children,i)),r.push(l)})),r}}}]);