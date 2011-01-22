
vjo.itype("vjo.dsf.IBinding").protos({serialize:function(_1){},deserialize:function(_2){}}).endType();

vjo.ctype("vjo.util.List").protos({constructs:function(_1){this.javaClass=_1||"java.util.ArrayList";this.list=[];},get:function(_2){if(this.size()>_2){return this.list[_2];}
return null;},add:function(_3){return this.list[this.size()]=_3;},remove:function(_4){var _5=this.size(),tmp=this.list,nlist=[],rv=false;for(var i=0;i<_5;i++){if(!rv&&tmp[i]===_4){rv=true;}else{nlist[nlist.length]=tmp[i];}}
this.list=nlist;return rv;},size:function(){return this.list.length;}}).endType();

vjo.ctype("vjo.util.Map").protos({constructs:function(_1){this.javaClass=_1||"java.util.HashMap";this.map={};},get:function(_2){return this.map[_2];},put:function(_3,_4){return this.map[_3]=_4;},remove:function(_5){var _6=this.map[_5];delete this.map[_5];return _6;},size:function(){var _7=0;for(var _8 in this.map){_7++;}
return _7;}}).endType();

vjo.needs("vjo.dsf.Json");vjo.ctype("vjo.dsf.JsonBinding").satisfies("vjo.dsf.IBinding").needs("vjo.dsf.Error").needs("vjo.dsf.SvcErr").needs("vjo.dsf.Message").needs("vjo.util.List").needs("vjo.util.Map").needs("vjo.dsf.ServiceResponse").needs("vjo.dsf.Service").needs("vjo.dsf.Enc").protos({serialize:function(_1){var _2="";_2+=vjo.dsf.Service.generateReqParams(_1);_2+=vjo.dsf.Enc.encodeURIComponent(JSON.stringify(_1.request));_1.rawRequest=_2;return _2;},deserialize:function(_3){var _4=_3.response.data;try{_3.response=eval("("+_4+")");this.addMethods(_3.response,vjo.dsf.ServiceResponse.prototype.addError);if(_3.response.data){this.processObj(_3.response.data);}}
catch(e){var _5=new vjo.dsf.Error();_5.id=vjo.dsf.SvcErr.Prs;_5.message="marshalling="+_3.svcConfig.respMarshalling+":responseText="+_4;_3.response.addError(_5);}},processObj:function(_6){var _7=_6.javaClass;if(_7&&_7.length>0){if(/java.util.([^\s])*List/.test(_7)){this.addMethods(_6,vjo.util.List.prototype);}else{if(/java.util.([^\s])*Map/.test(_7)){this.addMethods(_6,vjo.util.Map.prototype);}}}},addMethods:function(_8,_9){for(var _a in _9){_8[_a]=_9[_a];}}}).endType();

vjo.ctype("vjo.dsf.NvBinding").satisfies("vjo.dsf.IBinding").needs("vjo.dsf.Service").needs("vjo.dsf.Enc").protos({serialize:function(_1){_1.rawRequest=vjo.dsf.Service.generateReqParams(_1)+vjo.dsf.Enc.encodeURIComponent(_1.request);return _1.rawRequest;},deserialize:function(_2){}}).endType();

vjo.ctype("vjo.dsf.XhrTransport").satisfies("vjo.dsf.ITransport").needs(["vjo.dsf.Service","vjo.dsf.ServiceEngine","vjo.dsf.SvcErr","vjo.dsf.assembly.VjClientAssembler"]).protos({processed:[],timerCount:0,reqTimers:[],handleRequest:function(_1,_2){this.remoteTrspHdl(_1);var _3=vjo.dsf.Service,xmlHttpReq=_3.getXmlHttpReq(),requestUrl=this.appendPort80ForSafari(document.location.href,_1.svcConfig.url),cfg=_1.svcConfig;_1.status=-1;try{var _4=(cfg.async===false)?false:true;xmlHttpReq.open(cfg.method,requestUrl,_4);var _5=this.timerCount++;if(_4){this.setupReadyState(xmlHttpReq,_1,_5);}
if(cfg.method=="POST"){xmlHttpReq.setRequestHeader("Content-Type","application/x-www-form-urlencoded");xmlHttpReq.setRequestHeader("Content-Length",_1.rawRequest.length);if(_1.headers!=="undefined"&&_1.headers){for(var m in _1.headers){xmlHttpReq.setRequestHeader(m,_1.headers[m]);}}
xmlHttpReq.send(_1.rawRequest);}else{xmlHttpReq.send(null);}
if(!_4&&!this.checkAndSetProcessed(_5)){vjo.dsf.Service.callback(xmlHttpReq,_1);}else{if(cfg.timeout){var _7=this;this.reqTimers[_5]=window.setTimeout(function(){_7.timeout(xmlHttpReq,_1,_5);},cfg.timeout);}}}
catch(e){vjo.dsf.SvcErr.err(_1,vjo.dsf.SvcErr.InvRq,"Cannot open URL '"+requestUrl+"'");}},setupReadyState:function(_8,_9,_a){var _b=this;_8.onreadystatechange=function(){if(_8.readyState!=4||_b.checkAndSetProcessed(_a)){return;}
var _c=_b.reqTimers[_a];if(_c){window.clearTimeout(_c);delete _b.reqTimers[_a];}
vjo.dsf.Service.callback(_8,_9);};},timeout:function(_d,_e,_f){if(this.checkAndSetProcessed(_f)){return;}
delete _d.onreadystatechange;_d.abort();delete this.reqTimers[_f];vjo.dsf.SvcErr.err(_e,vjo.dsf.SvcErr.TO,"Timed out:"+_e.svcConfig.timeout);vjo.dsf.ServiceEngine.handleResponse(_e);},checkAndSetProcessed:function(idx){if(this.processed[idx]){return true;}
this.processed[idx]=true;return false;},remoteTrspHdl:function(_11){var cfg=_11.svcConfig;if(!cfg||cfg.objType!="dsf_SvcConfig"){return;}else{if(cfg.respMarshalling=="JSCALLBACK"){if(typeof vjo.dsf.assembly!="undefined"&&typeof vjo.dsf.assembly.VjClientAssembler!="undefined"&&!vjo.dsf.assembly.VjClientAssembler.bBodyLoaded){vjo.dsf.assembly.VjClientAssembler.load(_11);_11.status=-1;return;}}}
if(_11.request&&_11.request.javaClass){delete _11.request.b;}
var svc=vjo.dsf.Service,requestUrl=cfg.url;if(_11.svcConfig.method=="GET"){var sep=(requestUrl.indexOf("?")==-1)?"?":"&";requestUrl=requestUrl+sep+_11.rawRequest;}else{if(!_11.rawRequest){var _15=svc.generateReqParams(_11);_11.rawRequest=_15;}}
_11.svcConfig.url=requestUrl;},appendPort80ForSafari:function(_16,_17){try{if(navigator.userAgent.toLowerCase().indexOf("safari")>=0){var _18="(([^:]*)://([^:/?]*)(:([0-9]+))?)?([^?#]*)([?]([^#]*))?(#(.*))?",ajaxUrl=_17,safariIssuePort="80";var _19=_16.match(_18);if(_19&&_19.length>=5&&_19[5]&&_19[5]==safariIssuePort){var _1a=ajaxUrl.match(_18);if(_1a&&_1a[2]&&_1a[2].length>0){if(_1a[5]&&_1a[5].length>0){}else{var _1b="";if(_1a[2]){_1b+=_1a[2]+"://";}
if(_1a[3]){_1b+=_1a[3]+":"+safariIssuePort;}
if(_1a[6]){_1b+=_1a[6];}
if(_1a[8]){_1b+="?"+_1a[8];}
if(_1a[10]){_1b+="#"+_1a[10];}
_17=_1b;}}}}}
catch(e){}
return _17;}}).endType();

// en_US_AUTOS/e699/SYS-ZAM_vjo_e69912562057_opta_en_US_AUTOS
// b=12562057