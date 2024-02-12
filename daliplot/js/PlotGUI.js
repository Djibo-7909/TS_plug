

function getSelectValues(select) {
	var result = [];
	var options = select && select.options;
	var opt;

	for (var i=0, iLen=options.length; i<iLen; i++) {
	  opt = options[i];

	  if (opt.selected) {
		result.push(opt.value || opt.text);
	  }
	}
	return result;
}

function getSelectValuesNumeric(select) {
	var result = [];
	var options = select && select.options;
	var opt;

	for (var i=0, iLen=options.length; i<iLen; i++) {
		opt = options[i];

		if (opt.selected) {
			result.push(i);
		}
	}
	return result;
}

function selectOption(select,value){
	var found = -1;
	var o = select.options;
	for(var i=0;i<o.length;i++){
		if(o[i].value==value) found = i;
	}

	if(found>-1){
		for(var i=0;i<o.length;i++){
			if(i==found) o[i].setAttribute("selected","selected");
			else o[i].removeAttribute("selected");
		}	
	}
}

/* functions to get max and min of array as Math.max crashes for large arrays */
function getMax(arr) {
    let len = arr.length;
    let max = -Infinity;

    while (len--) {
        max = arr[len] > max ? arr[len] : max;
    }
    return max;
}

function getMin(arr) {
    let len = arr.length;
    let min = Infinity;

    while (len--) {
        min = arr[len] < min ? arr[len] : min;
    }
    return min;
}


function updatePlotGUI(currentPlot){

	var form = document.forms['plottingcontent_gui'];	

	document.getElementById('plot_modify').style.display = 'none';
	document.getElementById('axis_modify').style.display = 'none';
	document.getElementById('plottingcontent_gui_axis').style.display = 'none';
	document.getElementById('axis_add_param').style.display = 'none';
	document.getElementById('plottingcontent_gui_axis').style.display = 'none';
	document.getElementById('plottingcontent_gui_create_axis').style.display = 'none';
	document.getElementById('plottingcontent_gui_parameter').style.display = 'none'
	document.getElementById('plottingcontent_gui_create_parameter').style.display = 'none';

	/* plot */
	form['plot_title'].value = currentPlot.cartouche.title;
	form['plot_subtitle'].value = currentPlot.cartouche.subtitle;
	/*selectOption(form['format'],currentPlot.format;
	selectOption(form['orientation'],currentPlot.orientation);
	selectOption(form['xaxis'],currentPlot.xaxis);*/
	
	/* objects list */
	updatePlotObjectsList(currentPlot,null);
}


function updatePlotObjectsList(currentPlot,val){
	var form = document.forms['plottingcontent_gui'];
	if(val===null){		
		var val = getSelectValues(form['plot_objects']);
		if(val.length>0){
			val = val[0].replace('axis-','').replace('event-','').replace('line-','');
			val = Math.min(val,currentPlot.axe.length);
		}
		else if(currentPlot.axe.length >0) val = 0;
		else val = -1;
	}

	while (form['plot_objects'].firstChild) form['plot_objects'].removeChild(form['plot_objects'].firstChild); // remove all options
	for (var i = 0; i < currentPlot.axe.length; i++) {
		var option = document.createElement("option");
		option.value = "axis-"+i;
		option.text = currentPlot.axe[i].labelString=="" ? "[axis] "+i : "[axis] "+currentPlot.axe[i].labelString;
		if(val==i){
			option.setAttribute('selected','selected');
		}
		form['plot_objects'].appendChild(option);
	}
}

function updateplotobject(currentPlot,val){
	var t = val.split("-");
	currentAxis = -1;
	currentEvent = -1;
	currentLine = -1;
	if(t[0]=='axis'){
		currentAxis = t[1];
		updateaxis(currentPlot,t[1]);
		document.getElementById('plot_modify').style.display = 'none';
		document.getElementById('axis_modify').style.display = 'none';
		document.getElementById('plottingcontent_gui_axis').style.display = 'block';
		document.getElementById('axis_add_param').style.display = 'table-cell';
		document.getElementById('plottingcontent_gui_create_axis').style.display = 'none';
		document.getElementById('create_param_axis').style.display = 'none';
	}
}

function updateaxis(currentPlot,n){
	var form = document.forms['plottingcontent_gui'];
	form['axis_height'].value = currentPlot.axe[n].height;
	form['axis_label'].value = currentPlot.axe[n].labelString;
	form['axis_color'].value = currentPlot.axe[n].color;
	form['axis_ymin'].value = currentPlot.axe[n].ymin;
	form['axis_ymax'].value = currentPlot.axe[n].ymax;
	form['axis_ntick'].value = currentPlot.axe[n].ntick;
	if (currentPlot.axe[n].display === true) form['axis_display'].checked = false;
	else form['axis_display'].checked = true;
	
	/* parameters list */
	var val = getSelectValuesNumeric(form['axis_objects']);
	if(val.length>0){
		val = Math.min(val[0],currentPlot.axe[n].axeObject.length);
	}
	else if(currentPlot.axe[n].axeObject.length >0) val = 0; 
	else val = -1;
	while (form['axis_objects'].firstChild) form['axis_objects'].removeChild(form['axis_objects'].firstChild); // remove all options
	for (var i = 0; i < currentPlot.axe[n].axeObject.length; i++) {
		if (currentPlot.axe[n].axeObject[i].type===AxeObject.PARAMETER){
			var option = document.createElement("option");
			option.value = "parameter-"+i;
			option.text = "[param] "+currentPlot.axe[n].axeObject[i].id;
			if(val==i){
				option.setAttribute('selected','selected');
				updateaxisobject(currentPlot,n,"parameter-"+i);
			}
			form['axis_objects'].appendChild(option);
		}
	}
	form['axis_objects'].setAttribute("onchange","updateaxisobject(Plot.getPlot(document.getElementById('Plot')),"+n+",this.value);");
}

function updateaxisobject(currentPlot,n,val){
	var t = val.split("-");
	if(t[0]=='parameter'){
		updateparameter(currentPlot,n,t[1]);
		document.getElementById('plottingcontent_gui_parameter').style.display = 'block';
		document.getElementById('param_modify').style.display = 'none';
		document.getElementById('plottingcontent_gui_create_parameter').style.display = 'none';
	}
}

function updateparameter(currentPlot,na,n){
	currentAxis = na;
	currentParameter = n;
	var form = document.forms['plottingcontent_gui'];	
	form['parameter_id'].value = currentPlot.axe[na].axeObject[n].id;
	form['parameter_label'].value = currentPlot.axe[na].axeObject[n].label;
	form['parameter_color'].value=currentPlot.axe[na].axeObject[n].color;
	form['parameter_strokeWidth'].value = currentPlot.axe[na].axeObject[n].lineWidth;;
	form['parameter_source'].value = currentPlot.axe[na].axeObject[n].subType;
	if (currentPlot.axe[na].axeObject[n].display === true) form['parameter_display'].checked = false;
	else form['parameter_display'].checked = true;
}

function addplotparameter(){
	document.getElementById('plottingcontent_gui_axis').style.display = 'none';
	document.getElementById('plottingcontent_gui_parameter').style.display = 'none';
	document.getElementById('plottingcontent_gui_create_parameter').style.display = 'none';
	document.getElementById('plottingcontent_gui_create_axis').style.display = 'block';
}

function addaxisparameter(){
	document.getElementById('plottingcontent_gui_parameter').style.display = 'none';
	document.getElementById('plottingcontent_gui_create_parameter').style.display = 'block';
	document.getElementById('add_param').style.display = 'none';
	
}


function createparamaxis(currentPlot){
	
	let plotSVGelement = document.getElementById('Plot');
	
	let paramform = document.forms['plottingcontent_gui'];
	let ntick = paramform['create_axis_ntick'].value;
	let position= (currentPlot.hgrid[0] + currentPlot.hgrid[1])/2;
	let y0= (currentPlot.xAxe.x0 + currentPlot.xAxe.width)/2
	let height= paramform['create_axis_height'].value;
	let ymin= paramform['create_axis_ymin'].value.trim();
	let ymax= paramform['create_axis_ymax'].value.trim();
	let labelString= paramform['create_axis_label'].value.trim();
	let color= paramform['create_parameter_color'].value.trim();
	let display = true;
	
	let id = paramform['create_parameter_id'].value.trim();
	let label=paramform['create_parameter_label'].value.trim();
	let type = AxeObject.PARAMETER;
	let subType = paramform['create_parameter_source'].value;
	let lineWidth = paramform['create_parameter_strokeWidth'].value.trim();
	let resolution = null;
	let markerVisible = false;
	let clamp = false;	
	
	if (id === null || id === ''){
		alert('Enter parameter ID');
		return;
	}
	else{
		if (label === null || label === '')label=id;
		if (labelString === null || labelString === ''){
			labelString = label;		
		}
		if (height === null || height === '') height = 40;
		if (ntick === null || ntick === '') ntick = 5;
		if (ymin === null || ymin === '') ymin = 'auto';
		else if (ymin !=='auto'){
			if(isNaN(parseFloat(ymin))){
				alert('ymin must be numeric');
				return;
			}
			else ymin = parseFloat(ymin);
		}
		if (ymax === null || ymax === '') ymax = 'auto';
		else if (ymax !=='auto') {
			if(isNaN(parseFloat(ymax))){
				alert('ymax must be numeric');
				return;
			}
			ymax = parseFloat(ymax);
		}
		if (color === null || color === '') color = 'black';
		if (lineWidth === null || lineWidth === '') lineWidth = 0.8;
		else {
			if(isNaN(parseFloat(lineWidth))){
				alert('Stroke width must be numeric');
				return;
			}
			else lineWidth=parseFloat(lineWidth);
		}
		let axis = new Axe(ntick,position,y0,height,ymin,ymax,labelString,color,display,[]);
		let param = new Parameter(id,label,type,color,display,subType,lineWidth,resolution,markerVisible,clamp);
		
		let SVGelement;
		(async () => {
			SVGelement = await Axe.createSVGaxe(currentPlot,axis,param);
			plotSVGelement.appendChild(SVGelement);
			currentPlot = Plot.getPlot(plotSVGelement);
			updatePlotGUI(currentPlot);
			/*Add cursor label to the new parameter*/	
			let cursors = document.getElementById("cursorgroup").children;
			for (var i=0; i < cursors.length; i++){
				addParameterLabel(cursors[i]);
				updateCursorData(cursors[i]);		
			}
		})()
		
	}
}

function createparam(currentPlot){
	let paramform = document.forms['plottingcontent_gui'];
	let plotSVGelement = document.getElementById('Plot');	
	let val = getSelectValuesNumeric(paramform['plot_objects']);
	let axeSVGelement = document.getElementsByClassName('parametergroup')[val];

	let id = paramform['add_parameter_id'].value.trim();
	let label=paramform['add_parameter_label'].value.trim();
	let type = AxeObject.PARAMETER;
	let color= paramform['add_parameter_color'].value.trim();
	let display = true;
	let subType = paramform['add_parameter_source'].value;
	let lineWidth = paramform['add_parameter_strokeWidth'].value.trim();
	let resolution = null;
	let markerVisible = false;
	let clamp = false;	
	
	if (id === null || id === ''){
		alert('Enter parameter ID');
		return;
	}
	else{
		if (label === null || label === '')label=id;
		if (color === null || color === '') color = 'black';
		if (lineWidth === null || lineWidth === '') lineWidth = 0.8;
		else {
			if(isNaN(parseFloat(lineWidth))){
				alert('Stroke width must be numeric');
				return;
			}
			else lineWidth=parseFloat(lineWidth);
		}
		
		let param = new Parameter(id,label,type,color,display,subType,lineWidth,resolution,markerVisible,clamp);
		let paramSVGelement;
		
		(async () => {
			paramSVGelement = await Parameter.createSVGparameter(currentPlot,currentPlot.axe[val],param)
			axeSVGelement.appendChild(paramSVGelement);
			currentPlot = Plot.getPlot(plotSVGelement);
			updatePlotGUI(currentPlot);
			/*Add cursor label to the new parameter*/	
			let cursors = document.getElementById("cursorgroup").children;
			for (var i=0; i < cursors.length; i++){
				addParameterLabel(cursors[i]);
				updateCursorData(cursors[i]);		
			}
		})()
	}
}

function setCurrentPlot() {
	let form = document.forms['plottingcontent_gui'];
	Plot.modifySVGplot(form);
	let plotSVGelement = document.getElementById('Plot');
	currentPlot = Plot.getPlot(plotSVGelement);
	updatePlotGUI(currentPlot);		
}

function setCurrentAxis() {
	let form = document.forms['plottingcontent_gui'];
	let val = getSelectValuesNumeric(form['plot_objects']);	
	Axe.modifySVGaxis(form,val);
	let plotSVGelement = document.getElementById('Plot');
	currentPlot = Plot.getPlot(plotSVGelement);
	updatePlotGUI(currentPlot);		
}

function setCurrentParameter () {
	let form = document.forms['plottingcontent_gui'];
	let valAxe = getSelectValuesNumeric(form['plot_objects']);
	let valParam = getSelectValuesNumeric(form['axis_objects']);	
	Parameter.modifySVGparameter(form,valAxe,valParam);
	let plotSVGelement = document.getElementById('Plot');
	currentPlot = Plot.getPlot(plotSVGelement);
	updatePlotGUI(currentPlot);	
}

function closegui(){
	let popup = document.getElementById('popup');
	let plot_form = document.forms['plottingcontent_gui'];	
	popup.setAttributeNS(null,"style","display:none;");
	plot_form.reset();
}


