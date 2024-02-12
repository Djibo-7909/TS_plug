

class AxeObject {
	
	id;
	label;
	type; //parameter,line or runway
	color;
	display;
	
	static PARAMETER = 0;
	static RUNWAY = 1;
	static LINE = 4;
	
	
	constructor(id,label,type,color,display) {
		this.id = id;
		this.label=label;
		this.type = type;
		this.color=color;
		this.display = display;
	}	
}

class Parameter extends AxeObject {
	
	lineWidth;
    resolution;
    markerVisible;
    clamp;
	subType; //FDR or FTI
	tmatrix; //transform matrix applied to parameter polyline
	tmatrixl; //transform matrix applied to parameter legend 
	
	
	constructor(id,label,type,color,display,subType,lineWidth,resolution,markerVisible,clamp,tmatrix,tmatrixl) {
		super();
		this.id = id;
		this.label=label;
		this.type = type;
		this.color = color;
		this.display = display;
		this.subType = subType;
		this.lineWidth = lineWidth;
		this.resolution=resolution;
		this.markerVisible=markerVisible;
		this.clamp=clamp;
		this.tmatrix = tmatrix;
		this.tmatrixl = tmatrixl;
	}	
	
	static getParameter(paramSVGelement){		
		let id = paramSVGelement.getAttribute("id");
		let label=paramSVGelement.getElementsByTagName("text")[0].textContent.trim();
		let color = paramSVGelement.getAttribute("stroke");
		let type = AxeObject.PARAMETER;
		let display = window.getComputedStyle(paramSVGelement).getPropertyValue("display");
		if (display === 'none') display = false;
		else  display = true;
		let subType = paramSVGelement.getAttribute("source");
		let polyline = paramSVGelement.getElementsByTagName('polyline')[0];
		let legend = paramSVGelement.getElementsByTagName('text')[0];
		let lineWidth = parseFloat(window.getComputedStyle(polyline, null).getPropertyValue("stroke-width"));
		let resolution = paramSVGelement.getAttribute("resolution");
		let markerVisible = false;
		let clamp = false;
		let tmatrix = polyline.getAttribute("transform");
		let tmatrixl = legend.getAttribute("transform");
		
		return new Parameter(id,label,type,color,display,subType,lineWidth,resolution,markerVisible,clamp,tmatrix,tmatrixl);		
	}
	
	static async createSVGparameter(plot,axe,parameter){
		
		//0. need to check if axis is numeric before adding parameter
		if (isNaN(parseFloat(axe.ymin))){
			
			alert('Cannot add parameter to non numerix axis');
			return;
		}
		
		//1. get json data corresponding to the parameter from either DALI or FTI api
		let type = plot.xAxe.type;
		let reference = plot.xAxe.reference;
		let xmin = plot.xAxe.xmin;
		let xmax = plot.xAxe.xmax;
		let response,jsonParamData,datax,datay;
		let ymin = axe.ymin;
		let ymax = axe.ymax;
		let isReverse = plot.xAxe.isReverse;
		let apihostDALi = plot.apihostDALi;
		let base = plot.base;
		let msn = plot.msn
		//if (msn.length===3) msn = '0'+msn;
		
		if(parameter.subType === 'FTI_Local'){
			if (type === XAxe.TIME){
				if (reference === XAxe.FRT){
					alert('FTI parameter available for UTC axe reference only');
					return;
				}
				else{		
					let fltnum = plot.fltnum;
					if (!(parseFloat(msn) ===1157 || parseFloat(msn)===811)){  /* for production flights, recorded flight number is like EVX01EU, to be transformed in F0001 to match flytop numbering system */				
						fltnum = 'F00'+plot.fltnum.substring(3, 5);
					}				
					document.getElementById('plottingwait').innerHTML='<img height="100px" src="https://dali.intra.atr.corp/common/img/waiting.svg"/><br>Retrieving data...';
					document.getElementById('plottingwait').style.display = 'flex';
					let request = 'http://127.0.0.1:5000/api/data?msn='+msn+'&flight='+fltnum+'&param='+parameter.id;
					try {response = await fetch(request);
					jsonParamData = await response.json();}
					catch (e){ alert("FTI did not return any valid data");}	
					document.getElementById('plottingwait').style.display = 'none';
					document.getElementById('plottingwait').innerHTML='';
					datay = jsonParamData[parameter.id];
					datax = jsonParamData['_UTC'];
					// patch to remove 1 hour from UTC data (may happen when pcap data is captured with incorrect time setting)
					//datax = datax.map((datax) => (datax-3846));			
				}
			}
			else{
				alert('FTI parameter available for UTC axe reference only');
				return;
			}
		}
		else if (parameter.subType === 'FTI'){
			if (type === XAxe.TIME){
				if (reference === XAxe.FRT){
					alert('FTI parameter available for UTC axe reference only');
					return;
				}
				else{		
					let fltnum = plot.fltnum;
					if (!(parseFloat(msn) ===1157 || parseFloat(msn)===811)){ /* for production flights, recorded flight number is like EVX01EU, to be transformed in F0001 to match flytop numbering system */				
						fltnum = 'F00'+plot.fltnum.substring(3, 5);
					}	
					document.getElementById('plottingwait').innerHTML='<img height="100px" src="https://dali.intra.atr.corp/common/img/waiting.svg"/><br>Retrieving data...';
					document.getElementById('plottingwait').style.display = 'flex';					
					let parameterid = parameter.id.replaceAll('/','**');								
					let request = 'https://flytop.intra.atr.corp/api/parameters_json/'+msn+'/'+fltnum+'/'+parameterid+'/last';
					try{ response = await fetch(request);
					jsonParamData = await response.json();}
					catch (e){ alert("FTI did not return any valid data");}	
					document.getElementById('plottingwait').style.display = 'none';
					document.getElementById('plottingwait').innerHTML='';
					datay = jsonParamData['value'];
					datax = jsonParamData['unix_cns'];										
					datax = datax.map((datax) => (datax/10000000)%86400);	/* Convert unix_cns in seconds and keep only time of day*/		
					// patch to remove 1 hour from UTC data (may happen when pcap data is captured with incorrect time setting)
					//datax = datax.map((datax) => (datax-3846));						
				}								
			}
		}
		else{
			if (type === XAxe.TIME){ //axis type is time ( FRT or UTC)
				if (reference === XAxe.FRT){
					document.getElementById('plottingwait').innerHTML='<img height="100px" src="https://dali.intra.atr.corp/common/img/waiting.svg"/><br>Retrieving data...';
					document.getElementById('plottingwait').style.display = 'flex';
					try{ response = await fetch(apihostDALi+'/rest/'+base+'/'+plot.id_fl+'/'+parameter.id);
					jsonParamData = await response.json();}
					catch (e){ alert("DAli did not return any valid data");}
					document.getElementById('plottingwait').style.display = 'none';
					document.getElementById('plottingwait').innerHTML='';
					datay = jsonParamData[parameter.id];
					datax = jsonParamData['time'];
				}
				else{
					document.getElementById('plottingwait').innerHTML='<img height="100px" src="https://dali.intra.atr.corp/common/img/waiting.svg"/><br>Retrieving data...';
					document.getElementById('plottingwait').style.display = 'flex';
					try{ response = await fetch(apihostDALi+'/rest/'+base+'/'+plot.id_fl+'/'+parameter.id+',_UTC');
					jsonParamData = await response.json();}
					catch (e){ alert("DAli did not return any valid data");}
					document.getElementById('plottingwait').style.display = 'none';
					document.getElementById('plottingwait').innerHTML='';
					datay = jsonParamData[parameter.id];
					datax = jsonParamData['_UTC'];
				}
			}
			else{ // axis type is parameter
				document.getElementById('plottingwait').innerHTML='<img height="100px" src="https://dali.intra.atr.corp/common/img/waiting.svg"/><br>Retrieving data...';
				document.getElementById('plottingwait').style.display = 'flex';
				try {response = await fetch(apihostDALi+'/rest/'+base+'/'+plot.id_fl+'/'+parameter.id+','+plot.xAxe.parameter);
				jsonParamData = await response.json();}
				catch (e){ alert("DAli did not return any valid data");}
				document.getElementById('plottingwait').style.display = 'none';
				document.getElementById('plottingwait').innerHTML='';
				datay = jsonParamData[parameter.id];
				datax = jsonParamData[plot.xAxe.parameter];
			}
		}
		
		//2. clamp parameter based on xmin and xmax of plot.xAxe
		let imin=-1;
		let imax=-1;
		
		if (!isReverse){
			for (var i=0; i< datax.length;i++){	
				if (datax[i] >= xmin){
					imin = i;				
					break;
				}
			}
			for (var i=datax.length-1; i >= 0; i--){	
				if (datax[i] <= xmax){
					imax = i;				
					break;
				}
			}
		}
		else{
			for (var i=0; i< datax.length;i++){	
				if (datax[i] <= xmin){
					imin = i;				
					break;
				}
			}
			for (var i=datax.length-1; i >= 0; i--){	
				if (datax[i] >= xmax){
					imax = i;				
					break;
				}
			}
		}

		datax = datax.slice(imin,imax+1);
		datay = datay.slice(imin,imax+1);

		// 3. convert data in coordinates on svg canva
		let x = [];
		let y = [];
		let xy=[];		
		for (var i=0; i< datax.length;i++){	
			x.push(plot.xAxe.x0 + plot.xAxe.width*(datax[i] - plot.xAxe.xmin)/(plot.xAxe.xmax - plot.xAxe.xmin));
			y.push(axe.y0 - axe.height + axe.height* (datay[i] - ymax)/(ymin- ymax));
			xy.push(x[x.length-1] + "," + y[y.length-1]);
		}
		
		//4. create svg elements
		let paramSVGelement = document.createElementNS("http://www.w3.org/2000/svg","g");
		paramSVGelement.setAttributeNS(null,"font-size","3");		
		paramSVGelement.setAttributeNS(null,"fill","none");
		paramSVGelement.setAttributeNS(null,"font-famliy","Arial");
		paramSVGelement.setAttributeNS(null,"class","parameter");
		paramSVGelement.setAttributeNS(null,"id",parameter.id);
		paramSVGelement.setAttributeNS(null,"source",parameter.subType);
		paramSVGelement.setAttributeNS(null,"stroke",parameter.color);
		
		let paramPolyline = document.createElementNS("http://www.w3.org/2000/svg","polyline");
		paramPolyline.setAttributeNS(null,"id","pathparam**"+parameter.id);
		paramPolyline.setAttributeNS(null,"vector-effect","non-scaling-stroke");
		paramPolyline.setAttributeNS(null,"onmouseover","highlight(this,1)");		
		paramPolyline.setAttributeNS(null,"onmouseout","highlight(this,-1)");
		paramPolyline.setAttributeNS(null,"style","stroke-width:"+parameter.lineWidth);
		
		// Create polyline points
		let dpoints = xy.join(" ");
		paramPolyline.setAttributeNS(null,"points",dpoints);
		
		// Create polyline and legend transform matrix, using same matrix applied on sibling parameters polyline
		let tmatrix=-1;
		let tmatrixl = -1;
		for (var j = 0; j<axe.axeObject.length;j++){				
			if (axe.axeObject[j].type === AxeObject.PARAMETER){
				tmatrix = axe.axeObject[j].tmatrix;
				tmatrixl = axe.axeObject[j].tmatrixl;
				break;
			}
		}
		if (tmatrix ===-1) tmatrix = plot.xAxe.tmatrix;// if no parameter found, we apply transform matrix of X axe.
		if (tmatrixl === 0) tmatrixl = "matrix (1 0 0 1 0 0)";
		paramPolyline.setAttributeNS(null,"transform",tmatrix);
		

		let legend = document.createElementNS("http://www.w3.org/2000/svg","text");
        legend.setAttributeNS(null,"stroke","none");
        legend.setAttributeNS(null,"fill",parameter.color);		
        legend.setAttributeNS(null,"id","textlegendparam**"+parameter.id);		
        legend.setAttributeNS(null,"onmouseover","highlight(this,1)");
        legend.setAttributeNS(null,"onmouseout","highlight(this,-1)");
		legend.setAttributeNS(null,"x",""+x[0]);
		legend.setAttributeNS(null,"y",""+y[0]-0.1*axe.height *axe.axeObject.length );
		legend.setAttributeNS(null,"transform",tmatrixl);	
		legend.textContent = parameter.label;

		//attach polyline and legend to parameter
		paramSVGelement.appendChild(paramPolyline);
		paramSVGelement.appendChild(legend);

		return paramSVGelement;
	}
	
	static modifySVGparameter(formulaire,valAxe,valParam){
		let paramId  = formulaire['parameter_id'].value;
		let color = formulaire['parameter_color'].value;
		let strokeWidth = formulaire['parameter_strokeWidth'].value;
		let label = formulaire['parameter_label'].value;
		let checked = formulaire['parameter_display'].checked;
		
		let axeSVGelement = document.getElementsByClassName('parametergroup')[valAxe];
		let c = axeSVGelement.children;
		
		let paramSVGelement=-1;
		for (let i = 0; i<axeSVGelement.children.length;i++){ /* loop in each element of axe, in case several parameters have same id in different axes (cannot use getElementbyId)*/
			if (c[i].id === paramId){
				paramSVGelement=c[i];
				break;
			}
		}
		
		if (paramSVGelement !== -1){
			paramSVGelement.setAttributeNS(null,'stroke',color);
			paramSVGelement.getElementsByTagName('text')[0].setAttributeNS(null,'fill',color);
			paramSVGelement.getElementsByTagName('text')[0].textContent=label;
			paramSVGelement.firstElementChild.style.setProperty("stroke-width",strokeWidth);		
			if (checked) paramSVGelement.style.setProperty("display","none");
			else paramSVGelement.style.setProperty("display","inline");
		}
	}
	
}

class Line extends Parameter{
	
	subType;
	dataStr;
	
	constructor(id,label,type,color,display,subType,lineWidth,resolution,dataStr){
		super();
		this.id = id;
		this.label= label;
		this.type = type;
		this.color=color;
		this.display = display;
		this.subType = subType;
		this.type = AxeObject.LINE;
		this.lineWidth = lineWidth;
		this.resolution = resolution;
		this.dataStr = dataStr;
	}
	
	static getLine(lineSVGelement){
		let id = lineSVGelement.getAttribute("id");
		let label=lineSVGelement.getElementsByTagName("text")[0].textContent.trim();
		let type = AxeObject.LINE;
		let color = lineSVGelement.getAttribute("stroke");
		let display = window.getComputedStyle(lineSVGelement).getPropertyValue("display");
		if (display === 'none') display = false;
		else  display = true;
		let lineWidth = parseFloat(window.getComputedStyle(lineSVGelement.getElementsByTagName('polyline')[0], null).getPropertyValue("stroke-width"));
		let resolution = lineSVGelement.getAttribute("resolution");
		let subType='value';
		let dataStr ='toto'; 
		
		return new Line(id,label,type,color,display,subType,lineWidth,resolution,dataStr);	
			
	}
				
}