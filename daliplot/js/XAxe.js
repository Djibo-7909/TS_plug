
class XAxe { // horizontal x axis, can be time (UTC or FRT) or parameter (ex: distance to threshold)
	//ntick; // number of ticks,not used
	type; // Parameter or time
	reference; // time in FRT or UTC
	parameter; // parameter name, if XAxe.type is parameter
	isReverse; // axis inverted
	width; // width of the x axis, 
	x0; // Initial position on horizontal axis
	xmin; // min value of parameter on horizontal axis
	xmax; // max value of parameter on horizontal axis
	tmatrix; // transform matrix applied to axe path
	
	//position; // vertical position on plot
	//frtmin; // not used
	//frtmax; // not used
	//_offset; // offset between FRT time and UTC time,; not used
	//_axeLabel; // axe label name, not used
	
	
	//handle; // svg Xaxis handle, not used
	//_lineH;
	//_ticks;
	//_ticksgroup; // svg Xaxis elements, not used
	//_tickslabelsgroup; not used
	//_limit; not used	
	//_label;
	//_tickslabels;*/

	static TIME = 0;
	static PARAMETER = 1;
	static FRT = 0;
	static UTC = 1;
	
    constructor(type,reference,parameter,isReverse,width,x0,xmin,xmax,tmatrix) {
		this.type=type; 
		this.reference=reference;
		this.parameter = parameter;
		this.isReverse = isReverse;
		this.width=width;
		this.x0=x0;
		this.xmin=xmin;
		this.xmax=xmax;
		this.tmatrix = tmatrix;		
    }

	static getXAxe (xaxeSVGelement) {	
		let type=parseFloat(xaxeSVGelement.getAttribute("type")); 
		let reference=parseFloat(xaxeSVGelement.getAttribute("reference"));
		let parameter = xaxeSVGelement.getAttribute("parameter");
		let isReverse = 0;
		let width = 0;
		let x0 = 0;
		let xmin=0;
		let xmax=0;
		let tmatrix = 0;
		
		let path = xaxeSVGelement.children[0].firstElementChild;
		let pathd = path.getAttribute("d").split(' ');
		tmatrix = path.getAttribute("transform");
		let ticks = path.nextElementSibling ;
		let labels = ticks.nextElementSibling;
		
		
		width = parseFloat(pathd[4]);
		x0 = parseFloat(pathd[1]);
		xmin = labels.firstElementChild.textContent.trim();
		xmax=labels.lastElementChild.textContent.trim()
		
		if (type===XAxe.PARAMETER){
			xmin=parseFloat(xmin);
			xmax=parseFloat(xmax);
		}
		else{
			if (reference===XAxe.FRT){
				xmin=parseFloat(xmin);
				xmax=parseFloat(xmax);
			}
			else{
				const initime = '01 Jan 1970 ';
				xmin = Date.parse(initime + xmin + ' GMT')/1000; /* transform label in epoch time in ms */
				xmax = Date.parse(initime + xmax + ' GMT')/1000; /* transform label in epoch time in ms */
			}			
		}
		//console.log(width+"/"+x0+"/"+xmin+"/"+xmax);
		
		if (xmin > xmax) isReverse = 1;
		
		return new XAxe(type,reference,parameter,isReverse,width,x0,xmin,xmax,tmatrix);
	}
}

