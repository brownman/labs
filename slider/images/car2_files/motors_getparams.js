//<!--
//1@@m8

function ReadURL(url){var Inputs=decodeURI(url.search).split('?');var pairs=decodeURI(Inputs[1]).split('&');return(pairs);}
function getParams(array,variable){var value="";if(!array)
return(value);var nameVal=array.split('=');if(nameVal[0]==variable){value=nameVal[1];}else{value="";}
return(value);}
// b=12593180 -->