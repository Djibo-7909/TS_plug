class Plot { // general plot, parent to Xaxe and parameters axis
	cartouche;
	xAxe;
	axe;
	id_fl;
	id_plot;
	fltnum;
	msn;
	format;
	orientation;
	width;
	height;
	hgrid; // min and max position of horizontal grid
	vgrid; // min and max position of vertical grid
	base;
	apihostDALi;
	
	static FORMAT_A3 = 0;
	static FORMAT_A4 = 1;
	static ORIENTATION_PORTRAIT = 0;
	static ORIENTATION_LANDSCAPE = 1; // not used in DALi
	
    constructor(cartouche,xAxe,axe,id_fl,id_plot,fltnum,msn,format,orientation,width,height,hgrid,vgrid,base,apihostDALi) {
		this.cartouche = cartouche;
		this.xAxe=xAxe; 
		this.axe=axe;
		this.id_plot = id_plot;
		this.id_fl = id_fl;
		this.fltnum=fltnum;
		this.msn = msn;
		this.format=format;
		this.orientation=orientation;
		this.width=width;
		this.height=height;
		this.hgrid=hgrid;
		this.vgrid=vgrid;
		this.base=base;
		this.apihostDALi = apihostDALi;
    }
	
	static getPlot(plotSVGelement) {
		let cartouche = Cartouche.getCartouche(document.getElementById('Cartouche'));
		let xAxe = XAxe.getXAxe(document.getElementById('XAxe'));	
		let axe = [];
		let id_fl = parseFloat(plotSVGelement.getAttribute("id_fl")); 
		let id_plot = parseFloat(plotSVGelement.getAttribute("id_plot")); 
		let fltnum = plotSVGelement.getAttribute("fltnum"); 
		let msn = plotSVGelement.getAttribute("msn"); 
		let width = parseFloat(plotSVGelement.parentElement.getAttribute("width"))*10;
		let height = parseFloat(plotSVGelement.parentElement.getAttribute("height"))*10;
		let orientation = Plot.ORIENTATION_PORTRAIT;
		let base = plotSVGelement.getAttribute("base");
		let apihostDALi = 'https:'+plotSVGelement.getAttribute("wsserver").split(':')[1];
		
		let format = Plot.FORMAT_A4
		let margin=[];
		margin[0] = 5.0; //px left
        margin[1] = 5.0; //px top
        margin[2] = 5.0; //px right
        margin[3] = 32; //px bottom		
		if (width===297 && height==420){
			format=Plot.FORMAT_A3;
			margin[0] = 3.5; //px left
            margin[1] = 5; //px top
            margin[2] = 3.5; //px right
            margin[3] = 35; //px bottom
		}		
		let vgrid = [margin[0],width - margin[2]];
		let hgrid = [height - margin[3],margin[1]];

		/*let hgrid_major = document.getElementById('hgridmajor').children;
		//console.log(hgrid_major);
		let hgrid_minor = document.getElementById('hgridminor').children; 
		let counter=0;
		for (var i = hgrid_major.length-1; i>=0;i--){
			for (var j = i*4+7;j>=i*4+4;j--){
				var pathd = hgrid_minor[j].getAttribute("d").split(' ');
				console.log(hgrid_minor[j]);
				hgrid.push([counter,Math.round(pathd[2])]);
				counter++;
			}
			var pathd2 = hgrid_major[i].getAttribute("d").split(' ');
			console.log(hgrid_major[i]);
			//console.log(pathd2[2]);
			hgrid.push([counter,Math.round(pathd[2])]);
			counter++;
		}
		console.log(hgrid);	
		
		let vgrid_major = document.getElementById('vgridmajor'); 
		let vgrid_minor = document.getElementById('vgridmajor'); */
		
		
		let collection = document.getElementsByClassName("parametergroup");
		for (var i=0; i< collection.length;i++){
			axe.push(Axe.getAxe(collection[i].firstElementChild));		
			//console.log(paramcollection[i].firstElementChild);
		}
		
		return new Plot(cartouche,xAxe,axe,id_fl,id_plot,fltnum,msn,format,orientation,width,height,hgrid,vgrid,base,apihostDALi);
	}
	
	static modifySVGplot(formulaire){
		let title = formulaire['plot_title'].value;
		let subtitle = formulaire['plot_subtitle'].value;
		//let cartoucheSVGelement = document.getElementById('Cartouche');
		document.getElementById('Title').textContent = title;
		document.getElementById('Subtitle').textContent = subtitle;						
	}
}