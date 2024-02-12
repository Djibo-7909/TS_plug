

class Axe {
	
	ntick;
	position; // horizontal position
	y0; // vertical position
	height;
	ymin; 
	ymax;
	labelString;
	color;
	display;
	axeObject;
	
    constructor(ntick,position,y0,height,ymin,ymax,labelString,color,display,axeObject) {
        this.ntick=ntick;
        this.position=position;
        this.y0=y0;
        this.height=height;
        this.ymin=ymin;
        this.ymax=ymax;
		this.labelString=labelString;
		this.color=color;
		this.display = display;        
		this.axeObject = axeObject;
    }

	static getAxe (axeSVGelement) {
		let pathd = axeSVGelement.firstElementChild.getAttribute("d").split(' ');
		let ticks = axeSVGelement.firstElementChild.nextElementSibling;
		let labels = ticks.nextElementSibling;
		let color = axeSVGelement.getAttribute("fill");
		let display = window.getComputedStyle(axeSVGelement.parentElement).getPropertyValue("display");
		if (display === 'none') display = false;
		else  display = true;
		
		let ntick=ticks.children.length;
		let position=parseFloat(pathd[1]);
		let y0=parseFloat(pathd[2]);
		let height=-1.0*parseFloat(pathd[5]);
		let ymin=labels.firstElementChild.textContent.trim();
		let ymax=labels.lastElementChild.textContent.trim();
		let labelString=axeSVGelement.lastElementChild.textContent.trim();
		let axeObject = [];	
		
		let collection = axeSVGelement.parentNode.getElementsByClassName("parameter");
		
		for (var i=0; i< collection.length;i++){
			axeObject.push(Parameter.getParameter(collection[i]));		
		}

		collection = axeSVGelement.parentNode.getElementsByClassName("line");
		for (var i=0; i< collection.length;i++){
			axeObject.push(Line.getLine(collection[i]));		
		}			
		
		return new Axe(ntick,position,y0,height,ymin,ymax,labelString,color,display,axeObject);
	}
	
	static async createSVGaxe(plot,axe,parameter){ // create axe with parameter 

		//1. Get json data
		let type = plot.xAxe.type;
		let reference = plot.xAxe.reference;
		let xmin = plot.xAxe.xmin;
		let xmax = plot.xAxe.xmax;
		let isReverse = plot.xAxe.isReverse;
		let apihostDALi = plot.apihostDALi;
		let base = plot.base;
		let response,jsonParamData,datax,datay;
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
					if (!(parseFloat(msn) ===1157 || parseFloat(msn)===811)){ /* for production flights, recorded flight number is like EVX01EU, to be transformed in F0001 to match flytop numbering system */				
						fltnum = 'F00'+plot.fltnum.substring(3, 5);
					}
					document.getElementById('plottingwait').innerHTML='<img height="100px" src="https://dali.intra.atr.corp/common/img/waiting.svg"/><br>Retrieving data...';
					document.getElementById('plottingwait').style.display = 'flex';
					let request = 'http://127.0.0.1:5000/api/data?msn='+msn+'&flight='+fltnum+'&param='+parameter.id;
					try{ response = await fetch(request);
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
					if (!(parseFloat(msn) ===1157 || parseFloat(msn)===811)){ 						
						fltnum = 'F00'+plot.fltnum.substring(3, 5);
					}
					document.getElementById('plottingwait').innerHTML='<img height="100px" src="https://dali.intra.atr.corp/common/img/waiting.svg"/><br>Retrieving data...';
					document.getElementById('plottingwait').style.display = 'flex';					
					let parameterid = parameter.id.replaceAll('/','**');									
					let request = 'https://flytop.intra.atr.corp/api/parameters_json/'+msn+'/'+fltnum+'/'+parameterid+'/last';
					console.log(request);
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
				try{ response = await fetch(apihostDALi+'/rest/'+base+'/'+plot.id_fl+'/'+parameter.id+','+plot.xAxe.parameter);
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
		
		//3. compute ymin and ymax of axis if "auto"	
		let ntick = axe.ntick;
		let position = axe.position; //(plot.xAxe.x0 = plot.xAxe.width)/2; // by default, set horisontal position centered on X axis.
		let y0 = axe.y0;//(plot.hgrid[0] + plot.hgrid[1])/2 ; // by default, set vertical position centered.
		let height = axe.height;
		let ymin = axe.ymin;
		let ymax = axe.ymax;
		let labelString = axe.labelString;
		let color = axe.color;
		let axeObject = axe.axeObject;
		
		if (ymin==="auto") {
			let datamin = getMin(datay);
			if (ymax=="auto") {
				let datamax = getMax(datay);
				
				if (datamin===datamax) {// assume parameter is boolean or discrete
					if (datamin===0 || datamin===1){
						ymin=0;
						ymax=1;
					}
						
					else {
						ymin=datamin;
						ymax = datamin +1;
					}					
				}
				else{
					let range = datamax - datamin;
					let exp = Math.floor(Math.log10(range/(ntick-1)));
					
					let interval = Math.floor(range/(Math.pow(10,exp)*(ntick-1)))*Math.pow(10,exp);
					
					range = interval*(ntick-1);
					if (((Math.abs(datamax)/interval) -  Math.floor(Math.abs(datamax)/interval)) <   (Math.abs(datamin)/interval) - Math.floor(Math.abs(datamin)/interval)){
						ymax = Math.round(datamax/interval)*interval;
						ymin = ymax - range;
					}
					else{
						ymin = Math.round(datamin/interval) * interval;
						ymax = ymin + range;
					}
				}
				//console.log('' + ymin + '/' + ymax);
			}
			else{
				let range = ymax  - datamin;
				if (range > 0){
					let exp = Math.floor(Math.log10(range/(ntick-1)));
					let interval = Math.floor(range/(Math.pow(10,exp)*(ntick-1)))*Math.pow(10,exp);
					range = interval * (ntick-1);
					ymin = ymax -range;
				}
				else{
					ymin = datamin;
				}
			}	
		}
		else{
			if (ymax=="auto"){
				//let datamax = Math.max(...datay);
				let datamax = getMax(datay);
				let range = datamax  - ymin;
				if (range >0){
					let exp = Math.floor(Math.log10(range/(ntick-1)));
					let interval = Math.floor(range/(Math.pow(10,exp)*(ntick-1)))*Math.pow(10,exp);
					range = interval * (ntick-1);
					ymax = ymin + range;
				}
				else{
					ymin = getMin(datay);
					ymax = datamax;
				}
			}
			else{
				// do nothing
			}
		}
		
		//4. Convert data in coordinates on svg canva		
		let x = [];
		let y = [];
		let xy=[];		
		for (var i=0; i< datax.length;i++){	
			x.push(plot.xAxe.x0 + plot.xAxe.width*(datax[i] - plot.xAxe.xmin)/(plot.xAxe.xmax - plot.xAxe.xmin));
			y.push(axe.y0 - axe.height + axe.height* (datay[i] - ymax)/(ymin- ymax));
			xy.push(x[x.length-1] + "," + y[y.length-1]);
		}
		
		//5. Create axe svg element
		let axeSVGelement = document.createElementNS("http://www.w3.org/2000/svg","g");
		axeSVGelement.setAttributeNS(null,"class","parametergroup");	
		let axehandle = document.createElementNS("http://www.w3.org/2000/svg","g");
		axehandle.setAttributeNS(null,"fill",color);
		let axepath = document.createElementNS("http://www.w3.org/2000/svg","path");
		axepath.setAttributeNS(null,"stroke-width","0.2");
		axepath.setAttributeNS(null,"transform","matrix(1 0 0 1 0 0)");
		axepath.setAttributeNS(null,"stroke",color);
		let path = "M "+position+" "+ y0 + " " + "l" + " 0 -" + height;
		axepath.setAttributeNS(null,"d",path);

		let axetickgroup = document.createElementNS("http://www.w3.org/2000/svg","g");
		axetickgroup.setAttributeNS(null,"stroke-width","0.2");
		axetickgroup.setAttributeNS(null,"stroke",color);
		
		let axelabelgroup = document.createElementNS("http://www.w3.org/2000/svg","g");
		axelabelgroup.setAttributeNS(null,"font-size","3");
		axelabelgroup.setAttributeNS(null,"dominant-baseline","middle");
		axelabelgroup.setAttributeNS(null,"class","zoomable");
		axelabelgroup.setAttributeNS(null,"font-family","Arial");
		axelabelgroup.setAttributeNS(null,"text-anchor","end");
		
		
		let tickdelta = height/(ntick-1);
		let labeldelta = (ymax-ymin)/(ntick-1);
		for (var i=0;i<ntick;i++){
			let axetick = document.createElementNS("http://www.w3.org/2000/svg","path");
			let pathtick = "M "+position+" "+ (y0 - i *tickdelta) + " " + "l" + " -0.5 0"; //M 17.5 375.0 l -0.5 0
			axetick.setAttributeNS(null,"d",pathtick);
			axetick.setAttributeNS(null,"transform","matrix(1 0 0 1 0 0)");
			axetickgroup.appendChild(axetick);
			
			let axeticklabel = document.createElementNS("http://www.w3.org/2000/svg","text");
			axeticklabel.setAttributeNS(null,"x",position-0.6);
			axeticklabel.setAttributeNS(null,"y",(y0 - i *tickdelta));
			axeticklabel.setAttributeNS(null,"transform","matrix(1 0 0 1 0 0)");
			axeticklabel.textContent = ymin+i*labeldelta;
			axelabelgroup.appendChild(axeticklabel);
			
		}
		
		let axelabel =  document.createElementNS("http://www.w3.org/2000/svg","text");
		axelabel.setAttributeNS(null,"font-size","3.25");
		axelabel.setAttributeNS(null,"font-family","Arial");
		axelabel.setAttributeNS(null,"text-anchor","start");
		axelabel.setAttributeNS(null,"dominant-baseline","middle");
		axelabel.setAttributeNS(null,"class","draggable");
		axelabel.setAttributeNS(null,"transform","matrix(1 0 0 1 0 0)");
		axelabel.setAttributeNS(null,"x",position-10);
		axelabel.setAttributeNS(null,"y",(y0 - height-5));
		axelabel.textContent = labelString;
		
		axehandle.appendChild(axepath);
		axehandle.appendChild(axetickgroup);
		axehandle.appendChild(axelabelgroup);
		axehandle.appendChild(axelabel);
		axeSVGelement.appendChild(axehandle);		
		
		//6. Create parameter svg elements
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
		// Create polyline transform matrix, using matrix applied on Xaxe
		let tmatrix = plot.xAxe.tmatrix;
		paramPolyline.setAttributeNS(null,"transform",tmatrix);
		
		let legend = document.createElementNS("http://www.w3.org/2000/svg","text");
        legend.setAttributeNS(null,"stroke","none");
        legend.setAttributeNS(null,"fill",parameter.color);		
        legend.setAttributeNS(null,"id","textlegendparam**"+parameter.id);		
        legend.setAttributeNS(null,"onmouseover","highlight(this,1)");
        legend.setAttributeNS(null,"onmouseout","highlight(this,-1)");
		legend.setAttributeNS(null,"x",""+x[0]);
		legend.setAttributeNS(null,"y",""+y[0]-0.05*Math.random()*axe.height);
		legend.setAttributeNS(null,"transform","matrix (1 0 0 1 0 0)");	
		legend.textContent = parameter.label;	

		// Attach polyline and legend to parameter
		paramSVGelement.appendChild(paramPolyline);
		paramSVGelement.appendChild(legend);
		
		// Attach parameter to axe handle
		axeSVGelement.appendChild(paramSVGelement);
		
		return axeSVGelement;
	}
	
	static modifySVGaxis(formulaire,val){
		let axeSVGelement = document.getElementsByClassName('parametergroup')[val];
		let color = formulaire['axis_color'].value;
		let label = formulaire['axis_label'].value;
		let checked = formulaire['axis_display'].checked;
		axeSVGelement.firstElementChild.setAttributeNS(null,"fill",color);
		axeSVGelement.firstElementChild.getElementsByTagName('path')[0].setAttributeNS(null,"stroke",color);
		axeSVGelement.firstElementChild.children[1].setAttributeNS(null,"stroke",color);
		axeSVGelement.firstElementChild.lastElementChild.textContent = label;
		if (checked) axeSVGelement.style.setProperty("display","none");
		else axeSVGelement.style.setProperty("display","inline");							
	}
}