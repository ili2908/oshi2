(this["webpackJsonpgraph-project"]=this["webpackJsonpgraph-project"]||[]).push([[0],[,,,,,,,function(e){e.exports=JSON.parse('{"placeholder":"then nothing happens","nodePlaceholder":{"0":"then clown was trotting through the forest","1":"then wolf was trotting through the forest","0 1":"then wolf meet clown in the forest","0 0":"two wolfs meet in the forest","1 1":"two wolfs meet in the forest"}}')},,,,,,,,,,,,,function(e,n){function t(e){var n=new Error("Cannot find module '"+e+"'");throw n.code="MODULE_NOT_FOUND",n}t.keys=function(){return[]},t.resolve=t,e.exports=t,t.id=20},function(e,n){},,,,,,,,,,function(e,n){},function(e,n){},function(e,n){},,,,function(e,n){},function(e,n){},function(e,n){},function(e,n){},function(e,n){},function(e,n){},,function(e,n,t){"use strict";t.r(n);var o,r,c,i=t(8),a=t.n(i),s=t(22),d=t.n(s),u=t(4),h=t(3),l=t.n(h),f=t(13),v=t(15),b=t(14),p=t(0),j=(t(35),t(10)),M=t(9),g=t(5),k=t(2),O=function e(){var n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",t=arguments.length>1?arguments[1]:void 0;Object(k.a)(this,e),this.identifier=void 0,this.data=void 0,this.identifier=n,this.data=t},y=function e(n,t,o){Object(k.a)(this,e),this.node0=void 0,this.node1=void 0,this.data=void 0,this.node0=n,this.node1=t,this.data=o},w=function(e){Object(j.a)(t,e);var n=Object(M.a)(t);function t(){return Object(k.a)(this,t),n.apply(this,arguments)}return Object(g.a)(t,[{key:"createConnection",value:function(e,n,t){return new y(e,n,t)}}]),t}(function(){function e(){Object(k.a)(this,e),this.nodes={},this.connections={},this.inboundConnections={}}return Object(g.a)(e,[{key:"neighbours",value:function(e){var n=this.connections;if(!(e in n))return[];var t=[];for(var o in n[e])t.push(this.nodes[o]);return t}},{key:"connected",value:function(e,n){var t=this.connections;return e in t&&!!t[e][n]}},{key:"getConnection",value:function(e,n){var t=this.connections;return e in t?t[e][n]:null}},{key:"deleteV",value:function(e){var n=this.connections;e in this.nodes&&(delete this.nodes[e],delete n[e])}},{key:"addV",value:function(e){this.nodes[e.identifier]=e}},{key:"connect",value:function(e,n,t){e in this.nodes&&n in this.nodes&&(this.connections[n]=this.connections[n]||{},this.connections[e]=this.connections[e]||{},this.connections[e][n]=this.createConnection(this.nodes[e],this.nodes[n],t),this.inboundConnections[n]=this.inboundConnections[n]||{},this.inboundConnections[e]=this.inboundConnections[e]||{},this.inboundConnections[n][e]=this.connections[e][n])}},{key:"disconnect",value:function(e,n){var t=this.connections;e in t&&n in t[e]&&(delete this.connections[e][n],delete this.inboundConnections[n][e])}},{key:"contrapt",value:function(e,n){var t=this.connections,o=this.inboundConnections;if(e in t&&n in t[e]){for(var r in this.disconnect(e,n),this.disconnect(n,e),t[n])this.connect(e,r);for(var c in o[n])this.connect(c,e);this.deleteV(n)}}},{key:"GED",value:function(e){return 0}}]),e}()),x=(t(18),t(6),t(12)),m=1e3,C=function(e){Object(j.a)(t,e);var n=Object(M.a)(t);function t(e,o,r,c){var i;return Object(k.a)(this,t),(i=n.call(this,{radius:20,fill:"green",top:o-20,left:e-20,hasBorders:!1,hasControls:!1})).node=new O(m++,{x:e,y:o,n:Object(x.a)(i)}),r.addV(i.node),i.tokens=[],i.centreX=e,i.centreY=o,i.canvas=c,c.add(Object(x.a)(i)),i}return Object(g.a)(t,[{key:"addToken",value:function(){var e=this,n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0;6!=this.tokens.length&&(this.tokens.push({circle:new u.fabric.Circle({radius:5,fill:"rgb(".concat(17%n*30,",").concat(17%(+n+2)*30,",").concat(17%(+n+4)*30,")"),top:10,left:10}),color:n}),this._updateTokens(),this.tokens.forEach((function(n){var t=n.circle;return e.canvas.add(t)})))}},{key:"removeToken",value:function(e){var n=this.tokens.findIndex((function(n){var t=n.color;return e==t}));this.tokens=this.tokens.filter((function(e,t){return t!=n}))}},{key:"_updateTokens",value:function(){var e=this,n=function(e){var n=e.aCoords,t=n.tl,o=n.br;return[(t.x+o.x)/2,(t.y+o.y)/2]}(this),t=Object(p.a)(n,2),o=t[0],r=t[1];this.setCoords(),this.tokens.forEach((function(n,t){var c=n.circle;c.set({left:o-5+10*Math.sin(2*Math.PI*t/e.tokens.length),top:r-5+10*Math.cos(2*Math.PI*t/e.tokens.length)}).setCoords(),e.canvas.bringToFront(c),e.canvas.renderAll()}))}}]),t}(u.fabric.Circle),N=function(){function e(){Object(k.a)(this,e),this.handlers={}}return Object(g.a)(e,[{key:"on",value:function(e,n){var t=this;e.forEach((function(e){t.handlers[e]=n}))}},{key:"pass",value:function(e,n){return this.handlers[e]&&this.handlers[e](n)||this}}]),e}(),T=t(7),R=new w,S=0,E=[],P=function(e,n){var t=E.includes("a")?new u.fabric.Rect({width:40,height:40,fill:"red",top:n-20,left:e-20,hasBorders:!1,hasControls:!1}):new C(e,n,R,o);if(t.isRect=E.includes("a"),t.isRect){var r=new O(S++,{x:e,y:n,node:t});R.addV(r),t.node=r}return t.tokens=[],o.add(t),t},I=function(e,n){var t=Object(p.a)(e,4),r=t[0],c=t[1],i=t[2],a=t[3],s=new u.fabric.Triangle({width:10,height:15,fill:"rgb(".concat(17%n*30,",").concat(17%(+n+2)*30,",").concat(17%(+n+4)*30,")"),left:i,top:a,angle:180*Math.atan((i-r)/(a-c))/Math.PI,hasBorders:!1,hasas:!1,evented:!1,selectable:!1}),d=new u.fabric.Line([r,c,i,a],{stroke:"rgb(".concat(17%n*30,",").concat(17%(+n+2)*30,",").concat(17%(+n+4)*30,")"),hasBorders:!1,hasas:!1,evented:!1,selectable:!1});return d.triangle=s,d.color=n||0,o.add(d),o.add(s),d},q=function(e){var n=e.aCoords,t=n.tl,o=n.br;return[(t.x+o.x)/2,(t.y+o.y)/2]},A=function(){c&&(o.remove(c.triangle),o.remove(c).renderAll()),c=null},B=function(e){return[Math.floor(e.x)-2,Math.floor(e.y)-2]},D=function(e,n,t){var r=n.x1,c=n.x2,i=n.y1,a=n.y2,s=Math.sqrt((c-r)*(c-r)+(a-i)*(a-i))/100*t,d=Math.atan2(a-i,c-r);e.set({top:s*Math.sin(d)-5*Math.cos(d)+i,left:s*Math.cos(d)+5*Math.sin(d)+r}).setCoords(),o.renderAll()},_=["objectNotSelected","objectSelectedNode","objectDragging","ctrlPressed"].reduce((function(e,n){return e[n]=new N,e}),{});_.objectNotSelected.on(["down:nothing","down:node","down:selected"],(function(e){var n=e.pointer,t=e.target;return(r=t)||(r=P(Math.floor(n.x),Math.floor(n.y))),c=I([].concat(Object(b.a)(q(r)),[Math.floor(n.x)-2,Math.floor(n.y)-2]),E.find((function(e){return e>="0"&&e<="9"}))),_.objectSelectedNode})),_.objectSelectedNode.on(["down:nothing"],(function(e){e.target;var n=e.pointer;if(r.isRect&&!E.includes("a")||!r.isRect&&E.includes("a")){var t=P.apply(void 0,Object(b.a)(B(n))),i=q(t),a=Object(p.a)(i,2),s=a[0],d=a[1];c.end=t.node.identifier,c.set({x2:s,y2:d}).setCoords();var u=c.x1,h=c.y1,l=Math.atan2(d-h,s-u);c.triangle.set({left:s+5*Math.sin(l)-(c.isRect?(10*Math.sqrt(2)+15)*Math.cos(l):25*Math.cos(l)),top:d-5*Math.cos(l)-(c.isRect?(10*Math.sqrt(2)+15)*Math.sin(l):25*Math.sin(l)),angle:180*l/Math.PI+90}).setCoords(),R.connect(r.node.identifier,t.node.identifier,{line:c}),o.renderAll(),r=t,c=I([].concat(Object(b.a)(q(r)),[Math.floor(n.x)-2,Math.floor(n.y)-2]),E.find((function(e){return e>="0"&&e<="9"})))}})),_.objectSelectedNode.on(["down:node"],(function(e){var n=e.target;if(r.isRect&&!n.isRect||!r.isRect&&n.isRect){var t=q(n),i=Object(p.a)(t,2),a=i[0],s=i[1],d=n.node.identifier,u=r.node.identifier;if(R.connections[d]&&u in R.connections[d])return A(),o.remove(R.connections[d][u].data.line),o.remove(R.connections[d][u].data.line.triangle),R.disconnect(d,u),_.objectNotSelected;if(R.inboundConnections[d]&&u in R.inboundConnections[d])return A(),_.objectNotSelected;c.end=n.node.identifier,c.set({x2:a,y2:s}).setCoords();var h=c.x1,l=c.y1,f=Math.atan2(s-l,a-h);return c.triangle.set({left:a+5*Math.sin(f)-(c.isRect?(10*Math.sqrt(2)+15)*Math.cos(f):25*Math.cos(f)),top:s-5*Math.cos(f)-(c.isRect?(10*Math.sqrt(2)+15)*Math.sin(f):25*Math.sin(f)),angle:180*f/Math.PI+90}).setCoords(),o.renderAll(),R.connect(r.node.identifier,n.node.identifier,{line:c}),_.objectNotSelected}})),_.objectNotSelected.on(["key:pressed"],(function(e){"q"===e.key&&function(){K.apply(this,arguments)}()})),_.objectSelectedNode.on(["key:pressed"],(function(e){" "===e.key&&r.addToken&&r.addToken(E.find((function(e){return e>="0"&&e<="9"})))})),_.objectSelectedNode.on(["down:selected"],(function(){return A(),_.objectNotSelected})),_.objectSelectedNode.on(["move:mouse"],(function(e){var n=e.pointer,t=B(n),r=Object(p.a)(t,2),i=r[0],a=r[1];c.set({x2:i,y2:a}).setCoords();var s=c.x1,d=c.y1,u=Math.atan2(a-d,i-s);c.triangle.set({left:i+5*Math.sin(u),top:a-5*Math.cos(u),angle:180*u/Math.PI+90}).setCoords(),o.sendToBack(c).renderAll()})),_.objectSelectedNode.on(["move:node"],(function(){return _.objectDragging})),_.objectNotSelected.on(["move:node"],(function(){return _.objectDragging})),_.objectDragging.on(["move:node"],(function(e){var n=e.target,t=e.pointer;A();var r=n.node.identifier;if(n._updateTokens&&n._updateTokens(),o.sendToBack(n),R.connections[r]||R.inboundConnections[r]){var c=B(t),i=Object(p.a)(c,2),a=i[0],s=i[1];Object.entries(Object(v.a)(Object(v.a)({},R.connections[r]),R.inboundConnections[r])).forEach((function(e){var n=Object(p.a)(e,2),t=(n[0],n[1].data.line);t.set(t.end===r?{x2:a,y2:s}:{x1:a,y1:s}).setCoords();var c=t.end===r?t.x1:t.x2,i=t.end===r?t.y1:t.y2,d=Math.atan2(s-i,a-c);t.triangle.set({left:t.end===r?a+5*Math.sin(d)-(t.isRect?(10*Math.sqrt(2)+15)*Math.cos(d-Math):25*Math.cos(d)):c-5*Math.sin(d)+(t.isRect?(10*Math.sqrt(2)+15)*Math.cos(d-Math):25*Math.cos(d)),top:t.end===r?s-5*Math.cos(d)-(t.isRect?(10*Math.sqrt(2)+15)*Math.sin(d):25*Math.sin(d)):i+5*Math.cos(d)+(t.isRect?(10*Math.sqrt(2)+15)*Math.sin(d):25*Math.sin(d)),angle:t.end===r?180*d/Math.PI+90:180*d/Math.PI-90}).setCoords(),o.sendToBack(t),o.sendToBack(t.triangle)})),o.renderAll()}})),_.objectDragging.on(["up"],(function(){var e=r.node.identifier,n=Object(b.a)(q(r)),t=n[0],c=n[1];return R.connections[e]?(Object.entries(Object(v.a)(Object(v.a)({},R.connections[e]),R.inboundConnections[e])).forEach((function(n){var r=Object(p.a)(n,2),i=(r[0],r[1].data.line);i.set(i.end===e?{x2:t,y2:c}:{x1:t,y1:c}).setCoords(),o.sendToBack(i),i.set(i.end===e?{x2:t,y2:c}:{x1:t,y1:c}).setCoords();var a=i.end===e?i.x1:i.x2,s=i.end===e?i.y1:i.y2,d=Math.atan2(c-s,t-a);i.triangle.set({left:i.end===e?t+5*Math.sin(d)-(i.isRect?(10*Math.sqrt(2)+15)*Math.cos(d-Math):25*Math.cos(d)):a-5*Math.sin(d)+(i.isRect?(10*Math.sqrt(2)+15)*Math.cos(d-Math):25*Math.cos(d)),top:i.end===e?c-5*Math.cos(d)-(i.isRect?(10*Math.sqrt(2)+15)*Math.sin(d):25*Math.sin(d)):s+5*Math.cos(d)+(i.isRect?(10*Math.sqrt(2)+15)*Math.sin(d):25*Math.sin(d)),angle:i.end===e?180*d/Math.PI+90:180*d/Math.PI-90}).setCoords(),o.sendToBack(i.triangle)})),r._updateTokens&&r._updateTokens(),o.renderAll(),_.objectNotSelected):_.objectNotSelected}));var V=function(e){var n=e.color,t=new u.fabric.Circle({radius:5,fill:"rgb(".concat(17%n*30,",").concat(17%(+n+2)*30,",").concat(17%(+n+4)*30,")"),top:e.y1,left:e.x1});return o.add(t),t};function L(){var e=[],n={};return function(e){for(var n=(e=[].concat(e)).length-1;n>0;n--){var t=Math.floor(Math.random()*(n+1)),o=[e[t],e[n]];e[n]=o[0],e[t]=o[1]}return e}(Object.entries(R.nodes)).filter((function(e){var n=Object(p.a)(e,2);n[0];return!n[1].data.n})).forEach((function(t){var o=Object(p.a)(t,2),r=o[0];o[1];Object.entries(R.inboundConnections[r]).every((function(e){var t=Object(p.a)(e,2),o=t[0],r=t[1].data.line,c=R.nodes[o].data.n.tokens.filter((function(e){return e.color==r.color}));return n[o]||(n[o]=[0,0,0,0,0,0,0,0,0,0]),c.length-1>=n[o][r.color]}))&&Object.entries(R.inboundConnections[r]).forEach((function(t){var o=Object(p.a)(t,2),c=o[0],i=o[1].data.line,a=R.nodes[c].data.n.tokens.filter((function(e){return e.color==i.color}));e.push([a[n[c][i.color]].circle,i,r,c]),n[c][i.color]++}))})),e}function F(e,n,t){return J.apply(this,arguments)}function J(){return(J=Object(f.a)(l.a.mark((function e(n,t,r){return l.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",new Promise((function(e){var c=0,i=setInterval((function(){100==c&&(clearInterval(i),o.remove(n).renderAll(),o.bringToFront(R.nodes[r].data.node),e()),D(n,t,c++)}),20)})));case 1:case"end":return e.stop()}}),e)})))).apply(this,arguments)}function K(){return(K=Object(f.a)(l.a.mark((function e(){var n;return l.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:n=l.a.mark((function e(){var n,t;return l.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(n=L(),(t=n.map((function(e){var n=Object(p.a)(e,3);n[0],n[1];return n[2]})).filter((function(e,n,t){return t.indexOf(e)==n}))).forEach((function(e){var t=n.filter((function(n){var t=Object(p.a)(n,3),o=(t[0],t[1],t[2]);return e==o})).map((function(e){var n=Object(p.a)(e,3),t=(n[0],n[1].color);n[2];return t})).sort().join(" ");return T[e]&&T[e][t]?console.log(T[e][t]):!T[e]&&T.nodePlaceholder[t]?console.log(T.nodePlaceholder[t]):void console.log(T.placeholder)})),0!=n.length&&!E.includes("s")){e.next=5;break}return e.abrupt("return","break");case 5:return console.log("then"),e.next=8,Promise.all(n.map(function(){var e=Object(f.a)(l.a.mark((function e(n){var t,o,r,c,i;return l.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return t=Object(p.a)(n,4),o=t[0],r=t[1],c=t[2],i=t[3],e.next=3,F(o,r,c);case 3:R.nodes[i].data.n.removeToken(r.color);case 4:case"end":return e.stop()}}),e)})));return function(n){return e.apply(this,arguments)}}()));case 8:return e.next=10,Promise.all(t.map((function(e){return Object.entries(R.connections[e]).map(function(){var n=Object(f.a)(l.a.mark((function n(t){var o,r,c,i;return l.a.wrap((function(n){for(;;)switch(n.prev=n.next){case 0:return o=Object(p.a)(t,2),r=o[0],c=o[1].data.line,i=V(c),n.next=4,F(i,c,e);case 4:return n.abrupt("return",[c.color,r]);case 5:case"end":return n.stop()}}),n)})));return function(e){return n.apply(this,arguments)}}())})).flat());case 10:e.sent.forEach((function(e){var n=Object(p.a)(e,2),t=n[0],o=n[1];R.nodes[o].data.n.addToken(t)}));case 12:case"end":return e.stop()}}),e)}));case 1:return e.delegateYield(n(),"t0",3);case 3:if("break"!==e.t0){e.next=6;break}return e.abrupt("break",8);case 6:e.next=1;break;case 8:case"end":return e.stop()}}),e)})))).apply(this,arguments)}var U={initializeEvents:function(e){o=e;var n=_.objectNotSelected;o.on("mouse:down",(function(e){var t=e.target,o=e.pointer;t&&!t.node||(n=n.pass("down:".concat(t===r?"selected":t&&t.node?"node":"nothing"),{target:t,pointer:o}))})),o.on("mouse:move",(function(e){var t=e.pointer;n=n.pass("move:mouse",{pointer:t})})),o.on("object:moving",(function(e){var t=e.target,o=e.pointer;t&&!t.node||(n=n.pass("move:node",{target:t,pointer:o}))})),o.on("mouse:up",(function(e){var t=e.pointer;n=n.pass("up",{pointer:t}),document.onkeydown=function(e){E.push(e.key),n=n.pass("key:pressed",{key:e.key})},document.onkeyup=function(e){E=E.filter((function(n){return e.key!==n}))}}))}},z=t(1);function Y(){Object(i.useEffect)((function(){var n=e();U.initializeEvents(n)}),[]);var e=function(){return new u.fabric.Canvas("canvas",{height:800,width:1600,backgroundColor:"white",selection:!1,preserveObjectStacking:!0})};return Object(z.jsxs)("div",{children:[Object(z.jsx)("h1",{children:"PETRI KOVALENKO+CHALIUK"}),Object(z.jsx)("h2",{children:"left click to create node (lc on current node to disable arrow)"}),Object(z.jsx)("h2",{children:"left click on other node while having arrow to connect"}),Object(z.jsx)("h2",{children:"create opposite arrow to disconnect"}),Object(z.jsx)("h2",{children:"left click + number on node while not having arrow to create colored arrow"}),Object(z.jsx)("h2",{children:"space click + number on node while having arrow to create colored token"}),Object(z.jsx)("h2",{children:"q - to start simulation"}),Object(z.jsx)("canvas",{id:"canvas"})]})}var G=function(){return Object(z.jsx)(Y,{})};d.a.render(Object(z.jsx)(a.a.StrictMode,{children:Object(z.jsx)(G,{})}),document.getElementById("root"))}],[[44,1,2]]]);
//# sourceMappingURL=main.e767a491.chunk.js.map