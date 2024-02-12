/* Insert plot GUI htlm in html body */
let body = document.getElementsByTagName("body");

let popup = document.createElement("div");
popup.setAttribute("id","popup");
popup.setAttribute("style","display:none;");

let strVar="";
strVar += "<div id=\"plottingcontent\" >";
strVar += "	<form  id=\"plottingcontent_gui\" novalidate>";
strVar += "		<table>";
strVar += "			<tr style=\"vertical-align:top;\" >";
strVar += "				<td>";
strVar += "					<div id=\"plottingcontent_gui_plot\" >";
strVar += "						<h3>Plot<\/h3>";
strVar += "						<table>";
strVar += "							<tr><td>Title:<\/td><td><input name=\"plot_title\" oninput=\"let plot_action=document.getElementById('plot_modify');plot_action.setAttribute('style','display:table-cell');\"\/><\/td><\/tr>";
strVar += "							<tr><td>Subtitle:<\/td><td><input name=\"plot_subtitle\" oninput=\"let plot_action=document.getElementById('plot_modify');plot_action.setAttribute('style','display:table-cell');\"\/><\/td><\/tr>";
strVar += "							<tr><td>Objects:<\/td><td><select name=\"plot_objects\" size=\"8\"  onclick=\"updateplotobject(Plot.getPlot(document.getElementById('Plot')),this.value);\"><\/select><\/td><\/tr>		";
strVar += "							<tr><td id=\"plot_modify\" colspan=\"2\" style=\"display:none\" ><font class=\"action\" onclick=\"setCurrentPlot(this);\"  >Apply<\/font> modifications to plot <\/td><\/tr>";
strVar += "							<tr><td id=\"plot_add_axis\"colspan=\"2\"><font class=\"action\" onclick=\"addplotparameter();\">Add<\/font> a parameter to a <b>new<\/b> axis<\/td><\/tr>";
strVar += "						<\/table>";
strVar += "					<\/div>";
strVar += "				<\/td>";
strVar += "				<td>";
strVar += "					<div id=\"plottingcontent_gui_axis\" style=\"display:none\">";
strVar += "						<h3>Axis<\/h3>";
strVar += "						<table>";
strVar += "							<tr><td>Label:<\/td><td><input name=\"axis_label\" oninput=\"let axis_action=document.getElementById('axis_modify');axis_action.setAttribute('style','display:table-cell');\"\/><\/td><\/tr>";
strVar += "							<tr><td>Color:<\/td><td><input name=\"axis_color\" oninput=\"let axis_action=document.getElementById('axis_modify');axis_action.setAttribute('style','display:table-cell');\"\/><\/td><\/tr>";
strVar += "							<tr><td>Height:<\/td><td><input name=\"axis_height\" style=\"background-color : #d1d1d1; \" readonly \/><\/td><\/tr>";
strVar += "							<tr><td>ymin:<\/td><td><input name=\"axis_ymin\" style=\"background-color : #d1d1d1; \" readonly \/><\/td><\/tr>";
strVar += "							<tr><td>ymax:<\/td><td><input name=\"axis_ymax\" style=\"background-color : #d1d1d1; \" readonly \/><\/td><\/tr>";
strVar += "							<tr><td>Number of ticks:<\/td><td><input name=\"axis_ntick\" style=\"background-color : #d1d1d1; \" readonly \/><\/td><\/tr>";
strVar += "							<tr><td>Objects:<\/td><td><select name=\"axis_objects\" size=\"7\" onchange=\"\"><\/select><\/td><\/tr>";
strVar += "							<tr><td>Hide axis:<\/td><td><input type=\"checkbox\"  name=\"axis_display\" unchecked onclick=\"let axis_action=document.getElementById('axis_modify');axis_action.setAttribute('style','display:table-cell');\"\/><\/td><\/tr>";
strVar += "							<tr><td id=\"axis_modify\" colspan=\"2\" style=\"display:none\"><font class=\"action\" onclick=\"setCurrentAxis(this);\">Apply<\/font> modifications to selected axis <\/td><\/tr>";
strVar += "							<tr><td id=\"axis_add_param\" colspan=\"2\" style=\"display:none\"><font class=\"action\" onclick=\"addaxisparameter();\">Add<\/font> a parameter to <b>selected<\/b> axis<\/td><\/tr>";
strVar += "						<\/table>";
strVar += "					<\/div>";
strVar += "					<div id=\"plottingcontent_gui_create_axis\" style=\"display:none\">";
strVar += "						<h3>Add Parameter to a new axis<\/h3>";
strVar += "						<table>";
strVar += "							<tr><td>Axis label:<\/td><td><input name=\"create_axis_label\" oninput=\"let axis_action=document.getElementById('create_param_axis');axis_action.setAttribute('style','display:table-cell');\"\/><\/td><\/tr>";
strVar += "							<tr><td>Axis height:<\/td><td><input name=\"create_axis_height\" value=\"40\" type=\"number\" oninput=\"let axis_action=document.getElementById('create_param_axis');axis_action.setAttribute('style','display:table-cell');\"\/><\/td><\/tr>";
strVar += "							<tr><td>Axis ymin:<\/td><td><input name=\"create_axis_ymin\" value=\"auto\" oninput=\"let axis_action=document.getElementById('create_param_axis');axis_action.setAttribute('style','display:table-cell');\"\/><\/td><\/tr>";
strVar += "							<tr><td>Axis ymax:<\/td><td><input name=\"create_axis_ymax\" value=\"auto\" oninput=\"let axis_action=document.getElementById('create_param_axis');axis_action.setAttribute('style','display:table-cell');\"\/><\/td><\/tr>";
strVar += "							<tr><td>Axis ticks number:<\/td><td><input name=\"create_axis_ntick\" value=\"5\" type=\"number\" oninput=\"let axis_action=document.getElementById('create_param_axis');axis_action.setAttribute('style','display:table-cell');\"\/><\/td><\/tr>";
strVar += "							<tr><td><hr><\/hr><\/td><td><hr><\/hr><\/td><\/tr>";
strVar += "							<tr><td>Parameter ID:<\/td><td><input name=\"create_parameter_id\" oninput=\"let param_action=document.getElementById('create_param_axis');param_action.setAttribute('style','display:table-cell');\"\/><\/td><\/tr>";
strVar += "							<tr><td>Parameter label:<\/td><td><input name=\"create_parameter_label\" oninput=\"let param_action=document.getElementById('create_param_axis');param_action.setAttribute('style','display:table-cell');\"\/><\/td><\/tr>";
strVar += "							<tr><td>Parameter color:<\/td><td><input name=\"create_parameter_color\" value=\"black\" oninput=\"let param_action=document.getElementById('create_param_axis');param_action.setAttribute('style','display:table-cell');\"\/><\/td><\/tr-->";
strVar += "							<tr><td>Parameter stroke width:<\/td><td><input name=\"create_parameter_strokeWidth\" value=\"0.8\" oninput=\"let param_action=document.getElementById('create_param_axis');param_action.setAttribute('style','display:table-cell');\"\/><\/td><\/tr>";
strVar += "							<tr><td>Parameter source:<\/td><td><select name=\"create_parameter_source\" onchange=\"let param_action=document.getElementById('create_param_axis');param_action.setAttribute('style','display:table-cell');\"><option value=\"FDR\" selected>FDR<\/option><option value=\"FTI\" >FTI<\/option><option value=\"FTI_Local\" >FTI_Local<\/option><\/select>									";
strVar += "							<tr><td id=\"create_param_axis\" style=\"display:none;text-align:right\"><input class=\"button\" type=\"button\" value=\"Create parameter\" onclick=\"createparamaxis(Plot.getPlot(document.getElementById('Plot')))\" \/><\/td><\/tr>";
strVar += "						<\/table>";
strVar += "					<\/div>";
strVar += "				<\/td>";
strVar += "				<td>";
strVar += "					<div id=\"plottingcontent_gui_parameter\" style=\"display:none\" >";
strVar += "						<h3>Parameter<\/h3>";
strVar += "						<table>";
strVar += "							<tr><td>ID:<\/td><td><input name=\"parameter_id\" style=\"background-color : #d1d1d1; \" readonly  \/><\/td><\/tr>";
strVar += "							<tr><td>Color:<\/td><td><input name=\"parameter_color\" oninput=\"let param_action=document.getElementById('param_modify');param_action.setAttribute('style','display:table-cell');\"\/><\/td><\/tr>";
strVar += "							<tr><td>Stroke width:<\/td><td><input name=\"parameter_strokeWidth\" oninput=\"let param_action=document.getElementById('param_modify');param_action.setAttribute('style','display:table-cell');\"\/><\/td><\/tr>";
strVar += "							<tr><td>Label:<\/td><td><input name=\"parameter_label\" oninput=\"let param_action=document.getElementById('param_modify');param_action.setAttribute('style','display:table-cell');\"\/><\/td><\/tr>";
strVar += "							<tr><td>Source:<\/td><td><input name=\"parameter_source\" style=\"background-color : #d1d1d1; \" readonly name=\"parameter_source\" \/><\/td><\/tr>";
strVar += "							<tr><td>Hide parameter:<\/td><td><input type=\"checkbox\"  name=\"parameter_display\" unchecked onclick=\"let param_action=document.getElementById('param_modify');param_action.setAttribute('style','display:table-cell');\"\/><\/td><\/tr>";
strVar += "							<tr><td id=\"param_modify\" colspan=\"2\" style=\"display:none\"><font class=\"action\" onclick=\"setCurrentParameter();\">Apply<\/font> modifications to selected parameter <\/td><\/tr>";
strVar += "						<\/table>";
strVar += "					<\/div>";
strVar += "					<div id=\"plottingcontent_gui_create_parameter\" style=\"display:none\" >";
strVar += "						<h3>Add Parameter to selected axis<\/h3>";
strVar += "						<table>";
strVar += "							<tr><td>Parameter ID:<\/td><td><input name=\"add_parameter_id\" oninput=\"let param_action=document.getElementById('add_param');param_action.setAttribute('style','display:table-cell');\"\/><\/td><\/tr>";
strVar += "							<tr><td>Parameter color:<\/td><td><input name=\"add_parameter_color\" value=\"black\" oninput=\"let param_action=document.getElementById('add_param');param_action.setAttribute('style','display:table-cell');\"\/><\/td><\/tr>";
strVar += "							<tr><td>Parameter stroke width:<\/td><td><input name=\"add_parameter_strokeWidth\" value=\"0.8\" oninput=\"let param_action=document.getElementById('add_param');param_action.setAttribute('style','display:table-cell');\"\/><\/td><\/tr>";
strVar += "							<tr><td>Parameter label:<\/td><td><input name=\"add_parameter_label\" oninput=\"let param_action=document.getElementById('add_param');param_action.setAttribute('style','display:table-cell');\"\/><\/td><\/tr>";
strVar += "							<tr><td>Parameter source:<\/td><td><select name=\"add_parameter_source\" onchange=\"let param_action=document.getElementById('add_param');param_action.setAttribute('style','display:table-cell');\"><option value=\"FDR\" selected>FDR<\/option><option value=\"FTI\" >FTI<\/option><option value=\"FTI_Local\" >FTI_Local<\/option><\/select>									";
strVar += "							<tr><td><\/td><td id=\"add_param\" style=\"display:none;text-align:right\"><input class=\"button\" type=\"button\" value=\"Add parameter\" onclick=\"createparam(Plot.getPlot(document.getElementById('Plot')))\"\/><\/td><\/tr>";
strVar += "						<\/table>";
strVar += "					<\/div>";
strVar += "				<\/td>";
strVar += "				<td> <td id=\"close_gui\" style=\"display:table-cell;text-align:right\"><input class=\"button\" type=\"button\" value=\"Close\" onclick=\"closegui()\" \/><\/td><\/td>";
strVar += "			<\/tr>";
strVar += "		<\/table>";
strVar += "	<\/form>";
strVar += "<\/div>";
strVar += "<div id=\"plottingwait\" style=\"display:none; justify-content: center;align-items: center;\"><\/div>";
popup.innerHTML = strVar;

if (document.getElementById(popup.id) == null){ /* insert the css stylesheet only if not already in the document.*/
	body[0].insertBefore(popup, body[0].firstChild);
}


/* function to load element from server for plot GUI*/
const loadElement = (FILE_URL,id, type,tagname) => {
	return new Promise((resolve, reject) => {
		try {
			let parentElement = document.getElementsByTagName(tagname);
			if (document.getElementById(id) == null){ // only insert element if id does not exist
				let childElement;
				if (type === "text/javascript"){
					childElement = document.createElement("script");
					childElement.id =id;
					childElement.type = type;
					childElement.async = true;
					childElement.src =FILE_URL;
				}
				else if (type === "text/css"){
					childElement = document.createElement("link");
					childElement.rel = "stylesheet";
					childElement.id = id;
					childElement.type = type;
					childElement.href = FILE_URL;
				}
											
				childElement.addEventListener("load", (ev) => {
					resolve({ status: true });
				});

				childElement.addEventListener("error", (ev) => {
					reject({
						status: false,
						message: `Failed to load the script ＄{FILE_URL}`
					});
				});
				parentElement[0].insertBefore(childElement, parentElement[0].firstChild);
			}
		} catch (error) {
			reject(error);
		}
	});
};


/* list of scripts to load*/
let scripts = ["PlotGUI","Plot","Cartouche","XAxe","Axe","AxeObject"]
for (let k = 0; k < scripts.length; k++){

	loadElement("https://"+location.hostname+"/plotGUI/js/"+scripts[k]+".js",scripts[k]+"js", "text/javascript","head")
	.then( data  => {
		console.log("Script "+ scripts[k]+".js" + " loaded successfully", data);
	})
	.catch( err => {
		console.error(err);
	});	
}

/* load library to read hdf5 from file */
loadElement("https://cdn.jsdelivr.net/npm/jsfive@0.3.10/dist/browser/hdf5.js","hdf5js", "text/javascript","head")
.then( data  => {
	console.log("Script hdf5.js loaded successfully", data);
})
.catch( err => {
	console.error(err);
});

/* load css stylesheed*/
loadElement("https://"+location.hostname+"/plotGUI/css/PlotGUI.css","PlotGUIcss", "text/css","head")
.then( data  => {
	console.log("Stylesheet PlotGUI.css loaded successfully", data);
})
.catch( err => {
	console.error(err);
});

