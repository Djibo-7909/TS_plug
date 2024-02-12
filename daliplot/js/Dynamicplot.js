
/* v.01 JB Feb 2023: allow to dynamically tune scales and position of parameters */
/* v.02:correct of labels orientation with rotation angle */
/* v.03:
	- Update parameter stroke to account for non scaling vector effect 
	- Add highlight function to highlight text and polylines	*/
/* v0.4: add cursor with labels */
/* v0.5: add subticks and sub labels to parameter and time scale when zooming */
/* v0.6: extend parameter scale with shift + control wheel on first or last label of scale*/
/* v0.7: add plot GUI */
/* v0.8: 
	- lock horizontal translation of parameter label
	- update labels of parameter cursors only if cursors are visible
	- lock vertical position of Yaxis labels with regard to Yaxis when zooming */

var DeltaUTC = 0;	/*Delta between _UTC parameter and the Xaxis UTC parameter*/

document.getElementById("svg").addEventListener("load", makeDynamic);



function addParameterLabel(element){/* add parameters label to cursor*/
    var cursorid = element.id.split('_')[1]; /* get id number of cursor*/
    var cursorlabel = element.querySelectorAll("text[id='cursorlabel_"+cursorid+"']")[0]; /* get cursorlabel element */
    var cursorlabelx = cursorlabel.x.baseVal[0].value;/* get x position of cursor label*/
    var cursorlabelwidth = cursorlabel.getBBox().width;
    var cursortransform = cursorlabel.transform.baseVal; /* get transform of cursor label.*/
    var parameters = document.querySelectorAll("polyline[vector-effect]");/* select all polyline element with vector-effect attribute */
    for (var i=0; i<parameters.length;i++){
        if (parameters[i].parentNode.parentNode.classList.contains('parametergroup')){ /* verify parendnode is class parameter (to exclude events anf properties)*/
            var paramId = parameters[i].parentNode.id;			
            var paramLabelId = "cursorparam_"+cursorid+'**'+paramId;
            var paramMarkerId = "cursormarker_"+cursorid+'**'+paramId;
            var paramColor = window.getComputedStyle(parameters[i]).getPropertyValue("stroke");
            if (i%2===0) cursorlabelwidth*=-1;
            if (!document.getElementById(paramLabelId)){	/* Only add label if not already existing */		
                var paramLabel = document.createElementNS("http://www.w3.org/2000/svg","text");
                var matrix = document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGTransform();
                var m = document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGMatrix();
                m.a=cursortransform.getItem(0).matrix.a;
                m.b=cursortransform.getItem(0).matrix.b;
                m.c=cursortransform.getItem(0).matrix.c;
                m.d=cursortransform.getItem(0).matrix.d;
                m.e=cursortransform.getItem(0).matrix.e;
                matrix.setMatrix(m);
                paramLabel.transform.baseVal.appendItem(matrix);
                paramLabel.transform.baseVal.consolidate();
                paramLabel.setAttributeNS(null,"class","paramlabel");
                paramLabel.setAttributeNS(null,"id",paramLabelId);
                if (paramId==="_UTC_hidden") paramLabel.setAttributeNS(null,"x",cursorlabelx);
                else paramLabel.setAttributeNS(null,"x",cursorlabelx - cursorlabelwidth*(0.5+Math.random()));
                paramLabel.setAttributeNS(null,"y","5");
                paramLabel.setAttributeNS(null,"text-anchor","middle");
                paramLabel.setAttributeNS(null,"font-family","calibri");
                paramLabel.setAttributeNS(null,"font-size","3");
                paramLabel.setAttributeNS(null,"stroke-width","0.1");
                paramLabel.setAttributeNS(null,"stroke",paramColor);
                paramLabel.setAttributeNS(null,"style","display:block;");
                /*paramLabel.setAttributeNS(null,"style","pointer-events:none;");*/
                paramLabel.setAttributeNS(null, "onmouseover","highlight(this,1);");
                paramLabel.setAttributeNS(null, "onmouseout","highlight(this,-1);");
                element.appendChild(paramLabel);
                document.getElementById(paramLabelId).textContent="label";
                var paramMarker = document.createElementNS("http://www.w3.org/2000/svg","circle");
                paramMarker.transform.baseVal.appendItem(matrix);
                paramMarker.transform.baseVal.consolidate();
                paramMarker.setAttributeNS(null,"class","parammarker");
                paramMarker.setAttributeNS(null,"id",paramMarkerId);
                paramMarker.setAttributeNS(null,"cx",cursorlabelx);
                paramMarker.setAttributeNS(null,"cy","5");
                paramMarker.setAttributeNS(null,"r","1");
                paramMarker.setAttributeNS(null,"fill","none");
                paramMarker.setAttributeNS(null,"stroke-width","0.1");
                paramMarker.setAttributeNS(null,"stroke",paramColor);
                paramMarker.setAttributeNS(null,"style","display:block;");
                element.appendChild(paramMarker);				
            }
        }	
    }
}


function getParameterData(cx,id){ /* get value of parameter at cursor x position*/
    var parametergroup = document.getElementById(id).parentNode;
    var polyline = document.getElementById(id).firstElementChild;
    var parameterscale = parametergroup.children[0];
    
    var parameterticks =  parameterscale.children[1];
    var parameterybase= parameterticks.getBBox().y + parameterticks.getBBox().height;
    var parameterytop = parameterticks.getBBox().y ;
        
    var parameterlabels = parameterscale.children[2];
    var parameterlabelbase = parseFloat(parameterlabels.firstElementChild.textContent);
    var parameterlabeltop = parseFloat(parameterlabels.lastElementChild.textContent);
        
    var parameterslope = (parameterlabeltop-parameterlabelbase)/(parameterytop-parameterybase);
    var parametertransform = polyline.transform.baseVal; /* get transform of current parameter.*/

    if (id==='_UTC_hidden'){
        var X_cur = polyline.points[0].x * parametertransform.getItem(0).matrix.a + polyline.points[0].y * parametertransform.getItem(0).matrix.c + parametertransform.getItem(0).matrix.e;
        var Y_cur = polyline.points[0].x * parametertransform.getItem(0).matrix.b + polyline.points[0].y * parametertransform.getItem(0).matrix.d + parametertransform.getItem(0).matrix.f;
        for (var i=1; i< polyline.points.length;i++){
            var X_prev = X_cur;
            var Y_prev = Y_cur;
            var X_cur = polyline.points[i].x * parametertransform.getItem(0).matrix.a + polyline.points[i].y * parametertransform.getItem(0).matrix.c + parametertransform.getItem(0).matrix.e;
            var Y_cur = polyline.points[i].x * parametertransform.getItem(0).matrix.b + polyline.points[i].y * parametertransform.getItem(0).matrix.d + parametertransform.getItem(0).matrix.f;
            if (X_cur>cx){	
                var Y = Y_prev + (Y_cur - Y_prev)/(X_cur - X_prev) * (cx - X_prev);
                var val = parameterlabelbase+parameterslope*(Y - parameterybase);
                break;
            }
        }
                
    }
    else{
        var X = polyline.points[0].x * parametertransform.getItem(0).matrix.a + polyline.points[0].y * parametertransform.getItem(0).matrix.c + parametertransform.getItem(0).matrix.e;
        var Y = 0;
        for (var i=1; i< polyline.points.length;i++){
            X = polyline.points[i].x * parametertransform.getItem(0).matrix.a + polyline.points[i].y * parametertransform.getItem(0).matrix.c + parametertransform.getItem(0).matrix.e;
            if (X>cx){
                Y = polyline.points[i-1].x * parametertransform.getItem(0).matrix.b + polyline.points[i-1].y * parametertransform.getItem(0).matrix.d + parametertransform.getItem(0).matrix.f;
                var val = parameterlabelbase+parameterslope*(Y - parameterybase);
                break;
            }
        }
    }
    return [X,Y,val];
}

function updateCursorData(element){
    var cursorsl = element.querySelectorAll("text.paramlabel"); /* all cursor labels elements */
    var cursorsm = element.querySelectorAll("circle.parammarker"); /* all cursor marker elements */
    var yTime = document.getElementById('XAxe').children[0].children[0].getPointAtLength(0).y; /*Vertical position of X axis*/
    let displaye = window.getComputedStyle(element).getPropertyValue("display"); /* Display attribute of cursor element */
    for (var j = 0; j < cursorsl.length;j++){
        var displayc = window.getComputedStyle(cursorsl[j]).getPropertyValue("display"); /* Display attribute of cursor label */
        if (displayc==="block" && displaye==="block"){
            var cursortransform = cursorsl[j].transform.baseVal; /* get transform of current cursor.*/
            
            var cursorlx = cursorsl[j].x.baseVal[0].value * cursortransform.getItem(0).matrix.a + cursorsl[j].y.baseVal[0].value * cursortransform.getItem(0).matrix.c + cursortransform.getItem(0).matrix.e;
            var cursorly = cursorsl[j].x.baseVal[0].value * cursortransform.getItem(0).matrix.b + cursorsl[j].y.baseVal[0].value * cursortransform.getItem(0).matrix.d + cursortransform.getItem(0).matrix.f;
            var cursormx = cursorsm[j].cx.baseVal.value * cursortransform.getItem(0).matrix.a + cursorsm[j].cy.baseVal.value * cursortransform.getItem(0).matrix.c + cursortransform.getItem(0).matrix.e;
            var cursormy = cursorsm[j].cx.baseVal.value * cursortransform.getItem(0).matrix.b + cursorsm[j].cy.baseVal.value * cursortransform.getItem(0).matrix.d + cursortransform.getItem(0).matrix.f;
            
            var cursorid = cursorsl[j].id.split('**')[1];
            var resolution = document.getElementById(cursorid).getAttribute("resolution");
            var out = getParameterData(cursormx,cursorid);
            if (cursorid==='_UTC_hidden'){ /* label and marker displayed on Xaxis	*/
                cursorsl[j].setAttributeNS(null, 'y', yTime- cursorsm[j].getBBox().height);
                cursorsm[j].setAttributeNS(null, 'cy', yTime);
                cursorsl[j].setAttributeNS(null,"text-anchor","start");
                var label = new Date((out[2]+DeltaUTC)*1000); /* Create date format from UTC value in ms */
                var timepattern = /(?:[01]\d|2[0-3]):(?:[0-5]\d):(?:[0-5]\d).(?:[0-9]{3})/;
                label = label.toISOString().match(timepattern)[0];
                cursorsl[j].textContent = label;

            }
            else{
                if (j%2===0) cursorsl[j].setAttributeNS(null, 'y', out[1]-cursorsm[j].getBBox().height);
                else cursorsl[j].setAttributeNS(null, 'y', out[1]+2* cursorsm[j].getBBox().height);
                cursorsm[j].setAttributeNS(null, 'cy', out[1]);
                
                if (!isNaN(out[2])){
                    var precision = 7; 
                    if (resolution > 0){
                        if (resolution.toString().split('.').length > 1){/* get number of decimal digit */
                            precision = resolution.toString().split('.')[1].length; 
                            var val = Number.parseFloat(out[2].toFixed(precision));
                        }
                    }
                    else{	
                        var val = Number.parseFloat(out[2].toPrecision(precision));
                    }
                    cursorsl[j].textContent = val; /* Parsefloat to remove trailing 0*/
                }
                else cursorsl[j].textContent =' ';
            }
        }
    }
}

function addSubticks(element){/* add subticks to parameter scale */
    var c = element.children;
    var ticks = c[1].children;
    var labels = c[2].children;
    for (var i = 0; i< ticks.length-1;i++){
        
        var subtick = ticks[i].cloneNode(true);/* create subtick element to be insterted between ticks*/
        var label = labels[i].cloneNode(true);
        /* get path coordinates of surounding ticks to compute subtick and label coordinates*/
        var objectY = ticks[i].getPointAtLength(0).y;
        var nextObjectY = ticks[i+1].getPointAtLength(0).y;
        var d = ticks[i].getAttribute("d").split(' ');
        d[2] = (objectY + nextObjectY)/2;
        
        /* compute value corresponding to subtick*/		 
        var objectVal = parseFloat(labels[i].textContent);
        var nextObjectVal = parseFloat(labels[i+1].textContent);
        var Val = (objectVal + nextObjectVal)/2;

        /* compute transform matrix of subtick and label based on surrounding ticks*/
        var current_transform = ticks[i].transform.baseVal;
        var next_transform = ticks[i+1].transform.baseVal;
        var matrix = document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGTransform();
        var m = document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGMatrix();
        m.a=current_transform.getItem(0).matrix.a;
        m.b=current_transform.getItem(0).matrix.b;
        m.c=current_transform.getItem(0).matrix.c;
        m.d=current_transform.getItem(0).matrix.d;
        m.e=current_transform.getItem(0).matrix.e;
        m.f=(current_transform.getItem(0).matrix.f + next_transform.getItem(0).matrix.f)/2;
        matrix.setMatrix(m);

        /* Update subtick and label attribute and insert between 2 consecutive ticks and labels*/
        subtick.setAttributeNS(null,'d',d.join(' '));
        subtick.transform.baseVal.replaceItem(matrix,0);
        subtick.transform.baseVal.consolidate();
        label.setAttributeNS(null,'y',d[2]);
        label.textContent = Val;
        label.transform.baseVal.replaceItem(matrix,0);
        label.transform.baseVal.consolidate();
            
        c[1].insertBefore(subtick,ticks[i+1]);
        c[2].insertBefore(label,labels[i+1]);
        i++;
    }
}

function removeSubticks(element){/* remove subticks from parameter scale*/
    var c = element.children;
    var newticks = c[1].cloneNode(false);
    var ticks = c[1].children;
    var newlabels = c[2].cloneNode(false);
    var labels = c[2].children;
    
    for (var i = 0; i< ticks.length;i++){
        if(i%2===0){ /*keep only even ticks*/
            newticks.appendChild(ticks[i].cloneNode(true));
            newlabels.appendChild(labels[i].cloneNode(true));
        }
    }
    c[1].replaceWith(newticks);
    c[2].replaceWith(newlabels);
}


function addtimeSubticks(){
    var xAxegroup = document.getElementById('XAxe');
    var reference = xAxegroup.getAttribute('reference'); /* 0 for FRT or parameter, 1 for UTC */
    var xAxe = xAxegroup.children[0];
    var c = xAxe.children;
    var ticks = c[1].children;
    var labels = c[2].children;
    for (var i = 0; i< ticks.length-1;i++){
        var subtick = ticks[i].cloneNode(true);/* create subtick element to be insterted between ticks*/
        var label = labels[i].cloneNode(true);
        
        /* get path coordinates of surounding ticks to compute subtick and label coordinates*/
        var objectX = ticks[i].getPointAtLength(0).x;
        var nextObjectX = ticks[i+1].getPointAtLength(0).x;
        var d = ticks[i].getAttribute("d").split(' ');
        d[1] = (objectX + nextObjectX)/2;
        
        /* compute value corresponding to subtick*/
        if (reference==='0'){/* FRT or parameter scale */
            var objectVal = parseFloat(labels[i].textContent)
            var nextObjectVal = parseFloat(labels[i+1].textContent)
            var Val = (objectVal + nextObjectVal)/2;
        }
        else{ /* UTC scale*/
            var initime = '01 Jan 1970 ';
            var objectVal = Date.parse(initime + labels[i].textContent.trim() + ' GMT')
            var nextObjectVal = Date.parse(initime + labels[i+1].textContent.trim() + ' GMT')
            var Val = new Date((objectVal + nextObjectVal)/2);
            var timepattern = /(?:[01]\d|2[0-3]):(?:[0-5]\d):(?:[0-5]\d).(?:[0-9]{3})/;
            /*console.log(new Date(objectVal).toISOString() + "***" + timepattern.exec(new Date(objectVal).toISOString())+"***"+new Date(objectVal).toISOString().match(timepattern)[0]);*/
            var Val = Val.toISOString().match(timepattern)[0];
            var Decimal = parseFloat('0.'+parseInt(Val.split('.')[1]));
            if (Decimal===0) Val = Val.split('.')[0]
            else Val = Val.split('.')[0] + '.' + Decimal.toString().split('.')[1];
        }
        
        /* compute transform matrix of subtick and label based on surrounding ticks*/
        var current_transform = ticks[i].transform.baseVal;
        var next_transform = ticks[i+1].transform.baseVal;
        var matrix = document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGTransform();
        var m = document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGMatrix();
        m.a=current_transform.getItem(0).matrix.a;
        m.b=current_transform.getItem(0).matrix.b;
        m.c=current_transform.getItem(0).matrix.c;
        m.d=current_transform.getItem(0).matrix.d;
        m.e=(current_transform.getItem(0).matrix.e + next_transform.getItem(0).matrix.e)/2;
        m.f=current_transform.getItem(0).matrix.f;
        matrix.setMatrix(m);
        
        /* Update subtick and label attribute and insert between 2 consecutive ticks and labels*/
        subtick.setAttributeNS(null,'d',d.join(' '));
        subtick.transform.baseVal.replaceItem(matrix,0);
        subtick.transform.baseVal.consolidate();
        label.setAttributeNS(null,'x',d[1]);
        label.textContent = Val;
        label.transform.baseVal.replaceItem(matrix,0);
        label.transform.baseVal.consolidate();
        c[1].insertBefore(subtick,ticks[i+1]);
        c[2].insertBefore(label,labels[i+1]);
        i++;
    }
}

function removetimeSubticks(){/* remove subticks from parameter scale*/
    var xAxegroup = document.getElementById('XAxe');
    var xAxe = xAxegroup.children[0];
    var c = xAxe.children;
    var newticks = c[1].cloneNode(false);
    var ticks = c[1].children;
    var newlabels = c[2].cloneNode(false);
    var labels = c[2].children;
    
    for (var i = 0; i< ticks.length;i++){
        if(i%2===0){ /*keep only even ticks*/
            newticks.appendChild(ticks[i].cloneNode(true));
            newlabels.appendChild(labels[i].cloneNode(true));
        }
    }
    c[1].replaceWith(newticks);
    c[2].replaceWith(newlabels);
}

function makeDynamic(evt) { 	

    var svg = evt.target;
    svg.addEventListener('mousedown', startDrag);
    svg.addEventListener('mousemove', drag);
    svg.addEventListener('mouseup', endDrag);
    svg.addEventListener('mouseleave', endDrag);
    svg.addEventListener('wheel', zoom,{ passive: false });
    document.addEventListener("mouseover", event => {
        if (event.target){
            console.log(event.target);
            highlight(event.target,1);
        }
    });
    document.addEventListener("mouseout", event => {
        if (event.target){
            console.log(event.target);
            highlight(event.target,-1);
        }
    });

    
    document.addEventListener('keydown', (event) => {
        var popup = document.getElementById('popup');
        var display = window.getComputedStyle(popup).getPropertyValue("display");
        var name = event.key;
        var code = event.code;
        if (code==='KeyF' && display==='none'){
            var cursor1 = document.getElementById('cursor_1');
            if (!event.shiftKey){
                var display = window.getComputedStyle(cursor1).getPropertyValue("display");
                if (display==="none"){ 
                    cursor1.setAttributeNS(null,"style","display:block;");
                    updateCursorData(cursor1);
                }
                else cursor1.setAttributeNS(null,"style","display:none;");
            }
            else{/* if shift pressed, toggle display of parameter data */
                var cc = cursor1.children;
                for (var i=0; i<cc.length;i++){
                    if (cc[i].classList.contains('paramlabel') || cc[i].classList.contains('parammarker')){
                        var display = window.getComputedStyle(cc[i]).getPropertyValue("display");
                        if (display==="none") cc[i].setAttributeNS(null,"style","display:block;");
                        else cc[i].setAttributeNS(null,"style","display:none;");
                    }
                }
                updateCursorData(cursor1);
            }
        }
        else if (code==='KeyJ' && display==='none'){
            var cursor2 = document.getElementById('cursor_2');
            if (!event.shiftKey){
                var display = window.getComputedStyle(cursor2).getPropertyValue("display");
                if (display==="none"){
                    cursor2.setAttributeNS(null,"style","display:block;");
                    updateCursorData(cursor2);
                }
                else cursor2.setAttributeNS(null,"style","display:none;");
            }
            else{/*if shift pressed, toggle display of parameter data */
                var cc = cursor2.children;
                for (var i=0; i<cc.length;i++){
                    if (cc[i].classList.contains('paramlabel') || cc[i].classList.contains('parammarker')){
                        var display = window.getComputedStyle(cc[i]).getPropertyValue("display");
                        if (display==="none") cc[i].setAttributeNS(null,"style","display:block;");
                        else cc[i].setAttributeNS(null,"style","display:none;");
                    }
                }
                updateCursorData(cursor2);
            }
        }
        else if (code==='KeyP'){
            if (display==="none"){
                let plotSVGelement = document.getElementById('Plot');
                let myPlot = Plot.getPlot(plotSVGelement);
                console.log(myPlot);
                updatePlotGUI(myPlot);				
                popup.setAttributeNS(null,"style","display:block;");
            }
        }
        
        }, false);
    
    
    
    var zfactor = 1; /*zoom factor*/

    function getMousePosition(evt) {
        var CTM = svg.getScreenCTM();
        return {
            x: (evt.clientX - CTM.e) / CTM.a,
            y: (evt.clientY - CTM.f) / CTM.d
        };
    }
    
    /* increase polyline and cursor stroke width due to vector effect attribute altering the width */
    /* in order not to do it at every file load, we compare actual cursor stroke-width with the one defined in DALI java code (0.5px).*/
    var matches = Array.from(document.querySelectorAll("path[vector-effect]"));
    cursorstrokewidth = parseFloat(getComputedStyle(matches[0]).getPropertyValue("stroke-width"));
    if (cursorstrokewidth === 0.5){
        for (var i = 0; i<matches.length; i++) {
            var toto = window.getComputedStyle(matches[i]).getPropertyValue("stroke-width");
            var tata = parseFloat(toto)*4;
            matches[i].setAttribute("style", "stroke-width:"+ tata);
        }
        
        matches = Array.from(document.querySelectorAll("polyline[vector-effect]"));
        for (var i = 0; i<matches.length; i++) {
            var toto = window.getComputedStyle(matches[i]).getPropertyValue("stroke-width");
            var tata = parseFloat(toto)*4;
            matches[i].setAttribute("style", "stroke-width:"+ tata);
        }
    }
    
    /*Computation of DeltaUTC = difference between (rounded) UTC label displayed on X axis and value of _UTC parameter */
    var xAxegroup = document.getElementById('XAxe');
    var reference = xAxegroup.getAttribute('reference'); /* 0 for FRT or parameter, 1 for UTC */
    if (reference==='1'){
    
        var xAxe = xAxegroup.children[0];
        var c = xAxe.children;
        var firstTick = c[1].children[0];
        var firstLabel = c[2].children[0];
        
        var initime = '01 Jan 1970 ';
        var objectVal = Date.parse(initime + firstLabel.textContent.trim() + ' GMT'); /* transform label in epoch time in ms */
        var cursortransform = firstTick.transform.baseVal; /* get transform first time tick.*/
        var cx = firstTick.getPointAtLength(0).x * cursortransform.getItem(0).matrix.a + firstTick.getPointAtLength(0).x * cursortransform.getItem(0).matrix.c + cursortransform.getItem(0).matrix.e;/* get current position of first time tick */
        var out=getParameterData(cx,'_UTC_hidden');
        DeltaUTC = objectVal/1000 -out[2];
    }
        
    /*Update position and value of labels on cursor*/	
    var cursors = document.getElementById("cursorgroup").children;
    for (var i=0; i < cursors.length; i++){
        addParameterLabel(cursors[i]);
        updateCursorData(cursors[i]);		
    }
            
    var selectedGroup = false;
    var selectedElement = false;
    var initial_offsetx = [];
    var initial_offsety = [];
    var init_zfactor = 1;
    function startDrag(evt) {
        if (evt.target.classList.contains('draggable')) {
            coord = getMousePosition(evt);
            selectedElement = evt.target;
            selectedGroup= evt.target.parentNode.parentNode; /* svg parameter group*/
            initial_offsetx =[];
            initial_offsety =[];
            var c = selectedGroup.children;
            for(var i=0; i < c.length; i++){ /* we loop in each child and grand child to get transformation matrix and initial translation offset*/
                var gc = c[i].children;
                for (var j =0; j < gc.length;j++){
                    var init_transform = gc[j].transform.baseVal;
                    if (init_transform.length  === 1){ /* verify the transform matrix is initialized*/
                        if (gc[j].tagName==='text'){/* workaround to convert into matrix the initial rotation transform applied to some labels */
                                var matrix = svg.createSVGTransform();
                                matrix.setMatrix(init_transform.getItem(0).matrix);
                                init_transform.removeItem(0);
                                init_transform.appendItem(matrix);
                        }
                        if (init_transform.getItem(init_transform.length-1).type === SVGTransform.SVG_TRANSFORM_MATRIX ) {/* verify it is a matrix*/
                            initial_offsetx.push(coord.x - init_transform.getItem(0).matrix.e);
                            initial_offsety.push(coord.y - init_transform.getItem(0).matrix.f); 
                        }
                    }
                    else{ /* if no initial matrix, we go down the tree to find if there is any*/
                        var ggc = gc[j].children;
                        for (var k = 0; k < ggc.length;k++){
                            init_transform = ggc[k].transform.baseVal;
                            if (init_transform.length  === 1){ /* verify the transform matrix is initialized*/
                                if (init_transform.getItem(init_transform.length-1).type === SVGTransform.SVG_TRANSFORM_MATRIX ) {/* verify it is a matrix*/
                                    initial_offsetx.push(coord.x - init_transform.getItem(0).matrix.e);
                                    initial_offsety.push(coord.y - init_transform.getItem(0).matrix.f);
                                }
                            }
                        }
                    }
                }
            }
        }
        else if (evt.target.classList.contains('draggableX')) {/* we need to loop through all parameters to get the initial translation offset*/
            coord = getMousePosition(evt);
            selectedElement = evt.target;
            selectedGroup= evt.target.parentNode.parentNode; /* full svg group*/
            initial_offsetx =[];
            initial_offsety =[];
            var p = selectedGroup.children;
            for(var l=0; l < p.length; l++){/*we check the content of each object (parameter, xaxis and vertical line) to find matrix transform*/
                if (p[l].id==='XAxe'){
                    var c = p[l].children;
                    for(var i=0; i < c.length; i++){
                        if (c[i].id==='cursorgroup'){/* do not move cursor position when zooming on axes (to avoid cursor getting out of svg limits)*/
                            
                        }
                        else{
                            var gc = c[i].children;
                            for (var j =0; j < gc.length;j++){
                                var init_transform = gc[j].transform.baseVal;
                                if (init_transform.length  === 1){ /* verify the transform matrix is initialized*/	
                                    if (init_transform.getItem(init_transform.length-1).type === SVGTransform.SVG_TRANSFORM_MATRIX ) {/* verify it is a matrix*/
                                        initial_offsetx.push(coord.x - init_transform.getItem(0).matrix.e);
                                        initial_offsety.push(coord.y - init_transform.getItem(0).matrix.f); 
                                    }
                                }	
                                else{/* if no initial matrix, we go down the tree to find if there is any*/
                                    if (gc[j].hasChildNodes()) {
                                        var ggc = gc[j].children;
                                        for (var k = 0; k < ggc.length;k++){
                                            init_transform = ggc[k].transform.baseVal;
                                            if (init_transform.length  === 1){ /* verify the transform matrix is initialized*/
                                                if (init_transform.getItem(init_transform.length-1).type === SVGTransform.SVG_TRANSFORM_MATRIX ) {/* verify it is a matrix*/
                                                    initial_offsetx.push(coord.x - init_transform.getItem(0).matrix.e);
                                                    initial_offsety.push(coord.y - init_transform.getItem(0).matrix.f);
                                                }
                                            }	
                                        }
                                        
                                    }
                                }
                            }
                        }
                    }
                }
                else if (p[l].classList.contains('parametergroup')) {
                    var c = p[l].children;
                    for(var i=0; i < c.length; i++){ /* we loop in each child and grand child to get transformation matrix and initial translation offset*/
                        var gc = c[i].children;
                        for (var j =0; j < gc.length;j++){
                            var init_transform = gc[j].transform.baseVal;
                            if (init_transform.length  === 1){ /* verify the transform matrix is initialized*/
                                if (gc[j].tagName==='text'){/* workaround to convert into matrix the initial rotation transform applied to some labels  */
                                    var matrix = svg.createSVGTransform();
                                    matrix.setMatrix(init_transform.getItem(0).matrix);
                                    init_transform.removeItem(0);
                                    init_transform.appendItem(matrix);
                                }
                                if (init_transform.getItem(init_transform.length-1).type === SVGTransform.SVG_TRANSFORM_MATRIX ) {/* verify it is a matrix*/
                                    initial_offsetx.push(coord.x - init_transform.getItem(0).matrix.e);
                                    initial_offsety.push(coord.y - init_transform.getItem(0).matrix.f); 
                                }
                            }
                            else{ /* if no initial matrix, we go down the tree to find if there is any*/
                                var ggc = gc[j].children;
                                for (var k = 0; k < ggc.length;k++){
                                    init_transform = ggc[k].transform.baseVal;
                                    if (init_transform.length  === 1){ /* verify the transform matrix is initialized*/
                                        if (init_transform.getItem(init_transform.length-1).type === SVGTransform.SVG_TRANSFORM_MATRIX ) {/* verify it is a matrix*/
                                            initial_offsetx.push(coord.x - init_transform.getItem(0).matrix.e);
                                            initial_offsety.push(coord.y - init_transform.getItem(0).matrix.f);
                                        }
                                    }

                                }
                            }
                        }
                        
                    }
                }
                else if (p[l].classList.contains('vline')) {/* event vertical line*/
                    var c = p[l].children;
                    for(var i=0; i < c.length; i++){ /* we loop in each child and grand child to get transformation matrix and initial translation offset	*/							
                        var init_transform = c[i].transform.baseVal;
                        if (c[i].tagName==='text'){ /* workaround to convert into matrix the initial rotation transform applied to labels of vertical lines */
                            var matrix = svg.createSVGTransform();
                            matrix.setMatrix(init_transform.getItem(0).matrix);
                            init_transform.removeItem(0);
                            init_transform.appendItem(matrix);
                            
                        }
                        if (init_transform.length  === 1){ /* verify the transform matrix is initialized*/
                            if (init_transform.getItem(init_transform.length-1).type === SVGTransform.SVG_TRANSFORM_MATRIX ) {/* verify it is a matrix*/
                                initial_offsetx.push(coord.x - init_transform.getItem(0).matrix.e);
                                initial_offsety.push(coord.y - init_transform.getItem(0).matrix.f);
                            }
                        }
                        
                    }
                
                }	
            }
        }
        else if (evt.target.classList.contains('dragcursor')) {
            coord = getMousePosition(evt);
            selectedElement = evt.target;
            selectedGroup = evt.target;
            initial_offsetx =[];
            initial_offsety =[];
            var c = selectedGroup.children;
            for(var i=0; i < c.length; i++){
                var init_transform = c[i].transform.baseVal;
                if (init_transform.length  === 1){ /* verify the transform matrix is initialized*/	
                    initial_offsetx.push(coord.x - init_transform.getItem(0).matrix.e);
                    initial_offsetx.push(coord.x - init_transform.getItem(0).matrix.e);
                }
            }
            /*Update position and value of labels on cursor*/
            updateCursorData(selectedElement);
        }
    }
    function drag(evt) {
        if (selectedGroup) {	
            if (selectedElement.classList.contains('draggable')) {
                evt.preventDefault();
                var coord = getMousePosition(evt);
                var c = selectedGroup.children;
                var n = 0;
                for(var i=0; i < c.length; i++){/* we loop in each child to apply new transformation matrix*/	
                    var gc = c[i].children;
                    var ispolyline = false;
                    if ( c[i].querySelector('rect') || c[i].querySelector('polyline')) { /* check if child is polyline (parameter time serie) or rect (runway) to lock the horizontal translation.*/
                        ispolyline=true;
                    }
                    
                    for (var j =0; j < gc.length;j++){/* second loop on granchildren to apply translate*/
                        var current_transform = gc[j].transform.baseVal; /* get transform of current node.*/

                        if (current_transform.length  === 1){ /* verify the transform matrix is initialized	*/
                            var ca = current_transform.getItem(0).matrix.a;
                            var cb = current_transform.getItem(0).matrix.b;
                            var cc =current_transform.getItem(0).matrix.c; 
                            var cd =current_transform.getItem(0).matrix.d;
                            var ce =current_transform.getItem(0).matrix.e;
                            var cf =current_transform.getItem(0).matrix.f;
                            var matrix = svg.createSVGTransform();
                            var m = svg.createSVGMatrix();
                            if (ispolyline === true){ /* if sibling is polyline or rect, limit translation to vertical direction*/
                                var transX = 0;
                                var transY = coord.y - initial_offsety[n] - cf;
                            }
                            else{
                                var transX = coord.x - initial_offsetx[n] - ce;
                                var transY = coord.y - initial_offsety[n] - cf;
                            }
                            m.e = (cd*transX- cc*transY)/(ca*cd-cb*cc);
                            m.f = (cb*transX- ca*transY)/(cb*cc-ca*cd);
                            matrix.setMatrix(m);
                            current_transform.appendItem(matrix); /*we append the updated transformation matrix.*/
                            current_transform.consolidate();
                            n++;								
                        }
                        else{/* if no initial matrix, we go down the tree to find if there is any*/
                            var ggc = gc[j].children;
                            for (var k = 0; k < ggc.length;k++){
                                current_transform = ggc[k].transform.baseVal;
                                if (current_transform.length  === 1){ /* verify the transform matrix is initialized*/
                                    var ca = current_transform.getItem(0).matrix.a;
                                    var cb = current_transform.getItem(0).matrix.b;
                                    var cc = current_transform.getItem(0).matrix.c; 
                                    var cd = current_transform.getItem(0).matrix.d;
                                    var ce = current_transform.getItem(0).matrix.e;
                                    var cf = current_transform.getItem(0).matrix.f;
                                    var matrix = svg.createSVGTransform();
                                    var m = svg.createSVGMatrix();
                                    if (ispolyline === true){ /*if parent is polyline or rect, limit translation to vertical direction*/
                                        var transX = 0;
                                        var transY = coord.y - initial_offsety[n] - cf;
                                    }
                                    else{
                                        var transX = coord.x - initial_offsetx[n] - ce;
                                        var transY = coord.y - initial_offsety[n] - cf;
                                    }
                                    m.e = (cd*transX- cc*transY)/(ca*cd-cb*cc);
                                    m.f = (cb*transX- ca*transY)/(cb*cc-ca*cd);
                                    matrix.setMatrix(m);
                                    current_transform.appendItem(matrix); /*we append the updated transformation matrix.*/
                                    current_transform.consolidate();
                                    n++;
                                }
                            }
                        }
                    }
                } 
            }
            else if (evt.target.classList.contains('draggableX')) {
                evt.preventDefault();
                var coord = getMousePosition(evt);
                var p = selectedGroup.children;
                var n = 0;
                for(var l=0; l < p.length; l++){/*we check the content of X axis,  parameters or vertical lines to find matrix transform*/
                    if (p[l].id==='XAxe'){/* X axis*/
                        var c = p[l].children;						
                        for(var i=0; i < c.length; i++){
                            if (c[i].id==='cursorgroup'){/* do not move cursor position when zooming on axes (to avoid cursor getting out of svg limits)*/
                            
                            }
                            else{
                                var gc = c[i].children;
                                for (var j =0; j < gc.length;j++){
                                    var current_transform = gc[j].transform.baseVal;
                                    if (current_transform.length  === 1){ /* verify the transform matrix is initialized*/
                                        var ca = current_transform.getItem(0).matrix.a;
                                        var cb = current_transform.getItem(0).matrix.b;
                                        var cc = current_transform.getItem(0).matrix.c; 
                                        var cd = current_transform.getItem(0).matrix.d;
                                        var ce = current_transform.getItem(0).matrix.e;
                                        var cf = current_transform.getItem(0).matrix.f;
                                        
                                        var matrix = svg.createSVGTransform();
                                        var m = svg.createSVGMatrix();
                                        
                                        var transX = coord.x - initial_offsetx[n] - ce;
                                        var transY = 0; 
                                        m.e = (cd*transX- cc*transY)/(ca*cd-cb*cc);
                                        m.f = (cb*transX- ca*transY)/(cb*cc-ca*cd);
                                        
                                        matrix.setMatrix(m);
                                        /*current_transform.removeItem(0); we remove the last translate transform if it exists.*/
                                        current_transform.appendItem(matrix); /*we append the updated transformation matrix.*/
                                        current_transform.consolidate();
                                        n++;
                                    }	
                                    else{/* if no initial matrix, we go down the tree to find if there is any*/
                                        if (gc[j].hasChildNodes()) {
                                            var ggc = gc[j].children;
                                            for (var k = 0; k < ggc.length;k++){
                                                current_transform = ggc[k].transform.baseVal;
                                                if (current_transform.length  === 1){ /* verify the transform matrix is initialized*/
                                                    var ca = current_transform.getItem(0).matrix.a;
                                                    var cb = current_transform.getItem(0).matrix.b;
                                                    var cc = current_transform.getItem(0).matrix.c; 
                                                    var cd = current_transform.getItem(0).matrix.d;
                                                    var ce = current_transform.getItem(0).matrix.e;
                                                    var cf = current_transform.getItem(0).matrix.f;
                                                    
                                                    var matrix = svg.createSVGTransform();
                                                    var m = svg.createSVGMatrix();
                                                    var transX = coord.x - initial_offsetx[n] - ce;
                                                    var transY = 0;
                                                    m.e = (cd*transX- cc*transY)/(ca*cd-cb*cc);
                                                    m.f = (cb*transX- ca*transY)/(cb*cc-ca*cd);
                                                    
                                                    matrix.setMatrix(m);
                                                    current_transform.appendItem(matrix); /*we append the updated transformation matrix.*/
                                                    current_transform.consolidate();
                                                    n++;
                                                }	
                                            }
                                            
                                        }
                                    }
                                }
                            }
                        }
                    }
                    else if (p[l].classList.contains('parametergroup')) { /* parameter time series*/
                        var c = p[l].children;
                        for(var i=0; i < c.length; i++){ /* we loop in each child and grand child of each parameter to get the transformation matrix and apply the translation offset*/
                            var gc = c[i].children;
                            var ispolyline = false;
                            if ( c[i].querySelector('rect') || c[i].querySelector('polyline')) { /* check if child is polyline (parameter time serie) or rect (runway).*/
                                ispolyline=true;		
                            }
                            for (var j =0; j < gc.length;j++){
                                var current_transform = gc[j].transform.baseVal; /* get transform of current node.*/
                                if (current_transform.length  === 1){ /* verify the transform matrix is initialized	*/		
                                    var ca = current_transform.getItem(0).matrix.a;
                                    var cb = current_transform.getItem(0).matrix.b;
                                    var cc = current_transform.getItem(0).matrix.c; 
                                    var cd = current_transform.getItem(0).matrix.d;
                                    var ce = current_transform.getItem(0).matrix.e;
                                    var cf = current_transform.getItem(0).matrix.f;
                                    
                                    var matrix = svg.createSVGTransform();
                                    var m = svg.createSVGMatrix();
                                    if (ispolyline === true){ /* if sibling is  polyline or rect, allow translation to horizontal direction*/
                                        var transX = coord.x - initial_offsetx[n] - ce;
                                        if (gc[j].id.startsWith("textlegendparam")) transX = 0; /* lock horizontal translation of parameter labels */
                                        var transY = 0; 
                                        m.e = (cd*transX- cc*transY)/(ca*cd-cb*cc);
                                        m.f = (cb*transX- ca*transY)/(cb*cc-ca*cd);
                                    }
                                    else{ /* for scales and associaded do nothing*/

                                    }
                                    matrix.setMatrix(m);
                                    current_transform.appendItem(matrix); /*we append the updated transformation matrix.*/
                                    current_transform.consolidate();
                                    n++;
                                }
                                else{ /* if no initial matrix, we go down the tree to find if there is any*/
                                    var ggc = gc[j].children;
                                    for (var k = 0; k < ggc.length;k++){
                                        current_transform = ggc[k].transform.baseVal;
                                        if (current_transform.length  === 1){ /* verify the transform matrix is initialized*/
                                            var ca = current_transform.getItem(0).matrix.a;
                                            var cb = current_transform.getItem(0).matrix.b;
                                            var cc = current_transform.getItem(0).matrix.c; 
                                            var cd = current_transform.getItem(0).matrix.d;
                                            var ce = current_transform.getItem(0).matrix.e; 
                                            var cf = current_transform.getItem(0).matrix.f;
                                            
                                            var matrix = svg.createSVGTransform();
                                            var m = svg.createSVGMatrix();
                                            if (ispolyline === true){ /*if parent is polyline or rect, limit translation to horizontal direction*/
                                                var transX = coord.x - initial_offsetx[n] - ce;
                                                var transY = 0; 
                                                m.e = (cd*transX- cc*transY)/(ca*cd-cb*cc);
                                                m.f = (cb*transX- ca*transY)/(cb*cc-ca*cd);											
                                            }
                                            else{  /* for scales and associaded do nothing*/

                                            }
                                            matrix.setMatrix(m);
                                            current_transform.appendItem(matrix); /*we append the updated transformation matrix.*/
                                            current_transform.consolidate();
                                            n++;
                                        }
                                    }
                                }
                            }
                            
                        }
                    }
                    else if (p[l].classList.contains('vline')) {/* event vertical line*/
                        var c = p[l].children;
                        for(var i=0; i < c.length; i++){ /* we loop in each child of the each verticale line to get transformation matrix and apply translation offset*/												
                            var current_transform =c[i].transform.baseVal;
                            if (current_transform.length  === 1){ /* verify the transform matrix is initialized*/
                                var ca = current_transform.getItem(0).matrix.a;
                                var cb = current_transform.getItem(0).matrix.b;
                                var cc = current_transform.getItem(0).matrix.c; 
                                var cd = current_transform.getItem(0).matrix.d;
                                var ce = current_transform.getItem(0).matrix.e;
                                var cf = current_transform.getItem(0).matrix.f;
                                
                                var matrix = svg.createSVGTransform();
                                var m = svg.createSVGMatrix();										
                                if (c[i].tagName === 'polyline'){
                                    var transX = coord.x - initial_offsetx[n] - ce;
                                    var transY = 0; 
                                }
                                else if (c[i].tagName === 'text'){
                                    var transX = coord.x - initial_offsetx[n] - ce;
                                    var transY = 0; 
                                }
                                m.e = (cd*transX- cc*transY)/(ca*cd-cb*cc);
                                m.f = (cb*transX- ca*transY)/(cb*cc-ca*cd);
                                matrix.setMatrix(m);
                                current_transform.appendItem(matrix); /*we append the updated transformation matrix.*/
                                current_transform.consolidate();
                                n++;
                            }																		
                        }							
                    }
                }
            }
            else if (evt.target.classList.contains('dragcursor')) {
                evt.preventDefault();
                var coord = getMousePosition(evt);				
                var c = selectedGroup.children;
                var n = 0;
                for(var i=0; i < c.length; i++){					
                    var current_transform = c[i].transform.baseVal;
                    if (current_transform.length  === 1){ /* verify the transform matrix is initialized*/	
                        var ca = current_transform.getItem(0).matrix.a;
                        var cb = current_transform.getItem(0).matrix.b;
                        var cc = current_transform.getItem(0).matrix.c; 
                        var cd = current_transform.getItem(0).matrix.d;
                        var ce = current_transform.getItem(0).matrix.e;
                        var cf = current_transform.getItem(0).matrix.f;	
                        var matrix = svg.createSVGTransform();
                        var m = svg.createSVGMatrix();			
                        var transX = coord.x - initial_offsetx[n] - ce;
                        var transY = 0;
                        m.e = (cd*transX- cc*transY)/(ca*cd-cb*cc);
                        m.f = (cb*transX- ca*transY)/(cb*cc-ca*cd);
                        matrix.setMatrix(m);
                        current_transform.appendItem(matrix); /*we append the updated transformation matrix.*/
                        current_transform.consolidate();
                        n++;						
                    }
                }
                /*Update position and value of lables on cursor*/	
                updateCursorData(selectedElement);
        
            }
        }
    }
    function endDrag(evt) {
        /*Update position and value of lables on cursor*/
        if (evt.target.classList.contains('dragcursor')) {	
            if (selectedGroup) {
                updateCursorData(selectedElement);
            }
        }
        else{
            cursors = document.getElementById("cursorgroup").children;
            for (var i=0; i < cursors.length; i++){
                updateCursorData(cursors[i]);
            }
        }
        selectedGroup = null;
        selectedElement = null;
    }
    
    function zoom(evt) {				
        zfactor = Math.pow(4, 1/16);
        if(evt.target.closest('.zoomable')){
            if (!evt.shiftKey){ /* Check that  shift key is not pressed to activate zoom function*/
                evt.preventDefault();
                selectedGroup= evt.target.closest('.zoomable').parentNode.parentNode; /*svg parameter group*/
                selectedElement = evt.target; /*svg parameter scale label*/
                var centerX = selectedElement.x.baseVal[0].value;
                var centerY = selectedElement.y.baseVal[0].value;
                if (selectedGroup.querySelector('polyline')) { /* we look for the current zoom factor applied to the parameter group.*/
                    var polylineElement = selectedGroup.querySelector('polyline');
                    var scaleElement = selectedGroup.firstElementChild;
                    init_zfactor = polylineElement.transform.baseVal.getItem(0).matrix.d;

                    /*Update subticks and labels of parameter scale depending on zoom factor */
                    var epsilon = 1.0e-10;
                    /*check that scale is numeric before updating scale */
                    var isNum = !isNaN(parseFloat(scaleElement.children[2].children[0].textContent));
                    if (isNum){				
                        if (evt.deltaY<0){
                            var power = Math.log2(init_zfactor*zfactor);			
                            if ((Math.abs(power - Math.floor(power)) < epsilon) && (init_zfactor*zfactor >(1+epsilon))){ /* add subicks each time yAxis size is doubled and prevent adding subtick when yAxis is below its original size */
                                addSubticks(scaleElement);
                            }
                        }
                        else {
                            var power = Math.log2(init_zfactor);	
                            if ((Math.abs(power - Math.floor(power)) < epsilon) && (init_zfactor >(1+epsilon))){
                                removeSubticks(scaleElement);
                            }
                        }
                    }
                }
                
                var c = selectedGroup.children;/*children of the parameter group*/
                for(var i=0; i < c.length; i++){
                    var gc = c[i].children;
                    for (var j =0; j < gc.length;j++){						
                        var current_transform = gc[j].transform.baseVal; /* get transform of current node.*/										
                        if (current_transform.length  === 1){ /* verify the transform matrix is initialized	*/
                            var ca = current_transform.getItem(0).matrix.a;
                            var cb = current_transform.getItem(0).matrix.b;
                            var cc = current_transform.getItem(0).matrix.c; 
                            var cd = current_transform.getItem(0).matrix.d;
                            var ce = current_transform.getItem(0).matrix.e;
                            var cf = current_transform.getItem(0).matrix.f;
                            
                            var matrix = svg.createSVGTransform();
                            var m = svg.createSVGMatrix();
                    
                            if (gc[j].tagName === 'text'){/* if element is text, we need to translate it instead of zooming*/
                                if  (evt.deltaY  < 0){
                                    var transX = 0;
                                    var transY = 0;
                                    if (i===0){ /* for the first child element (yAxis), the text is the label and we apply the same transformation as the last tick label of the yAxis */
                                        transY = (gc[j-1].lastElementChild.y.baseVal[0].value - centerY) * init_zfactor * (zfactor - 1);
                                    }
                                    else transY = (gc[j].y.baseVal[0].value - centerY) * init_zfactor * (zfactor - 1); 
                                }
                                else{
                                    var transX = 0;
                                    var transY = 0;
                                    if (i===0){ /* same as above */
                                        transY = (gc[j-1].lastElementChild.y.baseVal[0].value - centerY) * init_zfactor * (1/zfactor - 1); 
                                    }
                                    else var transY = (gc[j].y.baseVal[0].value - centerY) * init_zfactor * (1/zfactor - 1); 
                                }
                                m.e = (cd*transX- cc*transY)/(ca*cd-cb*cc);
                                m.f = (cb*transX- ca*transY)/(cb*cc-ca*cd);
                            }
                            else { /*path (parameter Yaxis) or polyline (parameter time series)*/
                                if  (evt.deltaY  < 0){
                                    m.d = zfactor;						
                                    m.f = (1 - m.d) * centerY;	
                                }
                                else{
                                    m.d = 1/zfactor;
                                    m.f = (1 - m.d) * centerY;
                                }
                            }
                            matrix.setMatrix(m);
                            current_transform.appendItem(matrix); /*we append the updated transformation matrix.*/
                            current_transform.consolidate();
                        }
                        else{ /* if transform matrix is not initialized, we need to go one step below in the node */
                            var ggc = gc[j].children;
                            for (var k = 0; k < ggc.length;k++){
                                current_transform = ggc[k].transform.baseVal;
                                if (current_transform.length  === 1){ /* verify the transform matrix is initialized*/
                                    var ca = current_transform.getItem(0).matrix.a;
                                    var cb = current_transform.getItem(0).matrix.b;
                                    var cc = current_transform.getItem(0).matrix.c; 
                                    var cd = current_transform.getItem(0).matrix.d;
                                    var ce = current_transform.getItem(0).matrix.e;
                                    var cf = current_transform.getItem(0).matrix.f;
                                    
                                    var matrix = svg.createSVGTransform();
                                    var m = svg.createSVGMatrix();
                                    var objectX, objectY;
                                    if (ggc[k].tagName === 'text'){
                                        objectX= ggc[k].x.baseVal[0].value;
                                        objectY= ggc[k].y.baseVal[0].value;
                                    }
                                    else if (ggc[k].tagName === 'circle'){
                                        objectX= ggc[k].cx.baseVal.value;
                                        objectY= ggc[k].cy.baseVal.value;
                                    }
                                    else if (ggc[k].tagName === 'path'){
                                        objectX = ggc[k].getPointAtLength(0).x;
                                        objectY = ggc[k].getPointAtLength(0).y;									
                                    }
                                    if  (evt.deltaY  < 0){
                                        var transX = 0;
                                        var transY = (objectY - centerY) * init_zfactor * (zfactor - 1);
                                    }
                                    else{
                                        var transX = 0;
                                        var transY = (objectY - centerY) * init_zfactor * (1/zfactor - 1);
                                    }
                                    m.e = (cd*transX- cc*transY)/(ca*cd-cb*cc);
                                    m.f = (cb*transX- ca*transY)/(cb*cc-ca*cd);
                                    matrix.setMatrix(m);
                                    current_transform.appendItem(matrix); /*we append the updated transformation matrix.*/
                                    current_transform.consolidate();
                                }
                            }
                        }
                    }
                }
                selectedGroup = null;
                selectedElement = null;
            }
            else{ /*shift key pressed with mousewheel add tick and label at end or beginning of scale*/								
                evt.preventDefault();
                selectedElement = evt.target;
                if (!isNaN(parseFloat(selectedElement.textContent))){ /* add ticks only if scale is numeric */
                    selectedGroup = evt.target.parentNode;
                    var coord = getMousePosition(evt)
                    var path = 	selectedGroup.parentNode.children[0];
                    var ticks = selectedGroup.parentNode.children[1];				
                    var labels = selectedGroup.parentNode.children[2];
                    var title = null;
                    if ( selectedGroup.parentNode.children.length > 3){
                        title = selectedGroup.parentNode.children[3];
                    }
                    
                    if (selectedElement.nextElementSibling===null){/* if selected element is at the top of the scale, we add or remove the ticks at the bottom*/
                        if (evt.deltaY>0){/*add tick and label below first scale element*/
                            var subtick = ticks.firstElementChild;
                            var nextsubtick = ticks.firstElementChild.nextElementSibling;
                            var newtick = subtick.cloneNode();
                            
                            var label = labels.firstElementChild;
                            var nextlabel = labels.firstElementChild.nextElementSibling;
                            var newlabel = label.cloneNode();
                            
                            /* get path coordinates of 2 fist ticks to compute tick and label coordinates*/
                            var subtickY = subtick.getPointAtLength(0).y;
                            var nextsubtickY = nextsubtick.getPointAtLength(0).y;
                            var d = subtick.getAttribute("d").split(' ');
                            d[2] = (subtickY + (subtickY - nextsubtickY));
                            
                            /* compute value corresponding to subtick*/		 
                            var subtickVal = parseFloat(label.textContent);
                            var nextsubtickVal = parseFloat(nextlabel.textContent);
                            var Val = (subtickVal + (subtickVal - nextsubtickVal));
                            
                            var current_transform = ticks.firstElementChild.transform.baseVal;
                            var next_transform = ticks.firstElementChild.nextElementSibling.transform.baseVal;
                            
                            var matrix = document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGTransform();
                            var m = document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGMatrix();
                            m.a=current_transform.getItem(0).matrix.a;
                            m.b=current_transform.getItem(0).matrix.b;
                            m.c=current_transform.getItem(0).matrix.c;
                            m.d=current_transform.getItem(0).matrix.d;
                            m.e=current_transform.getItem(0).matrix.e;
                            m.f=(current_transform.getItem(0).matrix.f + current_transform.getItem(0).matrix.f - next_transform.getItem(0).matrix.f);
                            matrix.setMatrix(m);
                            
                            newtick.setAttributeNS(null,'d',d.join(' '));
                            newtick.transform.baseVal.replaceItem(matrix,0);
                            newtick.transform.baseVal.consolidate();
                            newlabel.setAttributeNS(null,'y',d[2]);
                            newlabel.textContent = Val;
                            newlabel.transform.baseVal.replaceItem(matrix,0);
                            newlabel.transform.baseVal.consolidate();
                            
                            ticks.insertBefore(newtick,subtick);
                            labels.insertBefore(newlabel,label);
                            
                            /* update parameter scale (path element) */
                            var pathd = path.getAttribute("d").split(' ');
                            pathd[2] =  (parseFloat(pathd[2]) + (subtickY - nextsubtickY)).toString();
                            pathd[5] =  (parseFloat(pathd[5]) - (subtickY - nextsubtickY)).toString();
                            path.setAttributeNS(null,'d',pathd.join(' '));
                        }
                        else{ /* remove first tick and label and adjust scale (path) size*/
                            if (ticks.children.length>2){/* keep at least 2 elements */
                                var subtick = ticks.firstElementChild;
                                var nextsubtick = ticks.firstElementChild.nextElementSibling;
                                var subtickY = subtick.getPointAtLength(0).y;
                                var nextsubtickY = nextsubtick.getPointAtLength(0).y;
                                var pathd = path.getAttribute("d").split(' ');
                                pathd[2] =  (parseFloat(pathd[2]) - (subtickY - nextsubtickY)).toString();
                                pathd[5] =  (parseFloat(pathd[5]) + (subtickY - nextsubtickY)).toString();
                                path.setAttributeNS(null,'d',pathd.join(' '));
                                
                                var newticks = ticks.cloneNode(false);
                                var newlabels = labels.cloneNode(false);
            
                                for (var i = 1; i< ticks.children.length;i++){		
                                    newticks.appendChild(ticks.children[i].cloneNode(true));
                                    newlabels.appendChild(labels.children[i].cloneNode(true));					
                                }
                                selectedGroup.parentNode.children[1].replaceWith(newticks);
                                selectedGroup.parentNode.children[2].replaceWith(newlabels);	
                            }
                        }
                    }
                    else if (selectedElement.previousElementSibling===null){/* if selected element is at the bottom of the scale, we add or remove the ticks at the top*/				
                        if (evt.deltaY<0){ /*add tick and label above last scale element*/
                            var subtick = ticks.lastElementChild;
                            var previoussubtick = ticks.lastElementChild.previousElementSibling;
                            var newtick = subtick.cloneNode();
                            
                            var label = labels.lastElementChild;
                            var previouslabel = labels.lastElementChild.previousElementSibling;
                            var newlabel = label.cloneNode();
                            
                            /* get path coordinates of 2 last ticks to compute tick and label coordinates*/
                            var subtickY = subtick.getPointAtLength(0).y;
                            var previoussubtickY = previoussubtick.getPointAtLength(0).y;
                            var d = subtick.getAttribute("d").split(' ');
                            d[2] = (subtickY + (subtickY - previoussubtickY));
                            
                            /* compute value corresponding to subtick*/		 
                            var subtickVal = parseFloat(label.textContent);
                            var previoussubtickVal = parseFloat(previouslabel.textContent);
                            var Val = (subtickVal + (subtickVal - previoussubtickVal));
                            
                            var current_transform = ticks.lastElementChild.transform.baseVal;
                            var previous_transform = ticks.lastElementChild.previousElementSibling.transform.baseVal;
                            
                            var matrix = document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGTransform();
                            var m = document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGMatrix();
                            m.a=current_transform.getItem(0).matrix.a;
                            m.b=current_transform.getItem(0).matrix.b;
                            m.c=current_transform.getItem(0).matrix.c;
                            m.d=current_transform.getItem(0).matrix.d;
                            m.e=current_transform.getItem(0).matrix.e;
                            m.f=(current_transform.getItem(0).matrix.f + current_transform.getItem(0).matrix.f - previous_transform.getItem(0).matrix.f);
                            matrix.setMatrix(m);
                            
                            newtick.setAttributeNS(null,'d',d.join(' '));
                            newtick.transform.baseVal.replaceItem(matrix,0);
                            newtick.transform.baseVal.consolidate();
                            newlabel.setAttributeNS(null,'y',d[2]);
                            newlabel.textContent = Val;
                            newlabel.transform.baseVal.replaceItem(matrix,0);
                            newlabel.transform.baseVal.consolidate();
                            
                            ticks.appendChild(newtick);
                            labels.appendChild(newlabel);
                            
                            /* update parameter scale (path element) */
                            var pathd = path.getAttribute("d").split(' ');
                            pathd[5] =  (parseFloat(pathd[5]) + (subtickY - previoussubtickY)).toString();
                            path.setAttributeNS(null,'d',pathd.join(' '));
                            
                            /* we need to update also the position of the scale title*/
                            init_zfactor = path.transform.baseVal.getItem(0).matrix.d;

                            var titleY = title.y.baseVal[0].value + (subtickY - previoussubtickY);
                            title.setAttributeNS(null,"y",titleY.toString());
                            
                            var title_transform = title.transform.baseVal;
                            var ce = title_transform.getItem(0).matrix.e;
                            var cf = title_transform.getItem(0).matrix.f;
                            
                            var matrix = svg.createSVGTransform();
                            var m = svg.createSVGMatrix();
                            var objectX, objectY;
                            objectX= title.x.baseVal[0].value;
                            objectY= title.y.baseVal[0].value;
                            m.e = ce;
                            m.f = cf + (subtickY - previoussubtickY) *(init_zfactor-1);
                            matrix.setMatrix(m);
                            title.transform.baseVal.replaceItem(matrix,0);
                            title.transform.baseVal.consolidate();												
                        }
                        else{ /* remove last tick and label and adjust scale (path) size*/
                            if (ticks.children.length>2){/* keep at least 2 elements */
                                var subtick = ticks.lastElementChild;
                                var previoussubtick = ticks.lastElementChild.previousElementSibling;
                                var subtickY = subtick.getPointAtLength(0).y;
                                var previoussubtickY = previoussubtick.getPointAtLength(0).y;
                                var pathd = path.getAttribute("d").split(' ');
                                pathd[5] =  (parseFloat(pathd[5]) - (subtickY - previoussubtickY)).toString();
                                path.setAttributeNS(null,'d',pathd.join(' '));							
                                
                                var newticks = ticks.cloneNode(false);
                                var newlabels = labels.cloneNode(false);
                            
                                for (var i = 0; i< ticks.children.length-1;i++){
                                    newticks.appendChild(ticks.children[i].cloneNode(true));
                                    newlabels.appendChild(labels.children[i].cloneNode(true));
                                }
                                selectedGroup.parentNode.children[1].replaceWith(newticks);
                                selectedGroup.parentNode.children[2].replaceWith(newlabels);
            
                                /* we need to update also the position of the scale title*/
                                init_zfactor = path.transform.baseVal.getItem(0).matrix.d;
                                var titleY = title.y.baseVal[0].value - (subtickY - previoussubtickY);
                                title.setAttributeNS(null,"y",titleY.toString());
                                var title_transform = title.transform.baseVal;
                                var ce = title_transform.getItem(0).matrix.e;
                                var cf = title_transform.getItem(0).matrix.f;
                                
                                var matrix = svg.createSVGTransform();
                                var m = svg.createSVGMatrix();
                                var objectX, objectY;
                                objectX= title.x.baseVal[0].value;
                                objectY= title.y.baseVal[0].value;
                                m.e = ce;
                                m.f = cf - (subtickY - previoussubtickY) *(init_zfactor-1);
                                matrix.setMatrix(m);
                                title.transform.baseVal.replaceItem(matrix,0);
                                title.transform.baseVal.consolidate();
                                    
                            }
                        }				
                    }
                }
            }
        }
        else if (evt.target.classList.contains('zoomableX')){
            evt.preventDefault();
            var coord = getMousePosition(evt);
            selectedGroup= evt.target.parentNode.parentNode.parentNode.parentNode; /*full svg*/
            selectedXaxis =  evt.target.parentNode.parentNode.parentNode;
            selectedElement = evt.target;
            var centerX = selectedElement.x.baseVal[0].value;
            var centerY = selectedElement.y.baseVal[0].value;
            if (selectedXaxis.querySelector('path')) { /* we look for the current zoom factor applied to the Xaxis path.*/
                var pathElement = selectedXaxis.querySelector('path');
                init_zfactor = pathElement.transform.baseVal.getItem(0).matrix.a;
                /*Update subticks and labels of X axis depending on zoom factor */	
                var epsilon = 1.0e-10;	
                if (evt.deltaY<0){
                    var power = Math.log2(init_zfactor*zfactor);			
                    if ((Math.abs(power - Math.floor(power)) < epsilon) && (init_zfactor*zfactor >(1+epsilon))){ 
                        addtimeSubticks();
                    }
                }
                else {
                    var power = Math.log2(init_zfactor);	
                    if ((Math.abs(power - Math.floor(power)) < epsilon) && (init_zfactor >(1+epsilon))){
                        removetimeSubticks();
                    }
                }
            }
            var p = selectedGroup.children;					
            for(var l=0; l < p.length; l++){/*we check the content of X axis,  parameters and vertical lines to find matrix transform*/
                if (p[l].id==='XAxe'){/* X axis*/
                    var c = p[l].children;
                    for(var i=0; i < c.length; i++){			
                        if (c[i].id==='cursorgroup'){ /* do not move cursor position when zooming on Xaxes (to avoid cursor getting out of svg limits)*/
                            /*var gc = c[i].children;
                            for (var j =0; j < gc.length;j++){
                                var matrix = svg.createSVGTransform();
                                var m = svg.createSVGMatrix();
                                var current_transform = gc[j].transform.baseVal;*/
                                /*if (current_transform.length  === 1){  verify the transform matrix is initialized
                                    if (gc[j].tagName === 'path'){
                                        if  (evt.deltaY  < 0){
                                            m.a = zfactor;
                                            m.e = (1 - m.a) * centerX;					
                                        }
                                        else{
                                            m.a = 1/zfactor;
                                            m.e = (1 - m.a) * centerX;
                                        }
                                        matrix.setMatrix(m);
                                        current_transform.appendItem(matrix); we append the updated transformation matrix.
                                        current_transform.consolidate();
                                    }
                                    else if (gc[j].tagName === 'text'){
                                        var ca = current_transform.getItem(0).matrix.a;
                                        var cb = current_transform.getItem(0).matrix.b;
                                        var cc = current_transform.getItem(0).matrix.c; 
                                        var cd = current_transform.getItem(0).matrix.d;
                                        var ce = current_transform.getItem(0).matrix.e;
                                        var cf = current_transform.getItem(0).matrix.f;
                                        var matrix = svg.createSVGTransform();
                                        var m = svg.createSVGMatrix();
                                        var objectX= gc[j].x.baseVal[0].value;
                                        var objectY= gc[j].y.baseVal[0].value;
                                        if  (evt.deltaY  < 0){
                                            var transX = (objectX- centerX) * init_zfactor * (zfactor - 1);
                                            var transY = 0;
                                        }
                                        else{
                                            var transX = (objectX - centerX) * init_zfactor * (1/zfactor - 1);
                                            var transY = 0;
                                        }
                                        m.e = (cd*transX- cc*transY)/(ca*cd-cb*cc);
                                        m.f = (cb*transX- ca*transY)/(cb*cc-ca*cd);
                                        matrix.setMatrix(m);
                                        current_transform.appendItem(matrix); we append the updated transformation matrix.
                                        current_transform.consolidate();
                                    }
                                }	
                            }*/
                        }
                        else{
                            var gc = c[i].children;
                            for (var j =0; j < gc.length;j++){
                            
                                var matrix = svg.createSVGTransform();
                                var m = svg.createSVGMatrix();
                                var current_transform = gc[j].transform.baseVal;
                                if (current_transform.length  === 1){ /* verify the transform matrix is initialized*/
                                    if  (evt.deltaY  < 0){
                                        m.a = zfactor;
                                        m.e = (1 - m.a) * centerX;					
                                    }
                                    else{
                                        m.a = 1/zfactor;
                                        m.e = (1 - m.a) * centerX;
                                    }
                                    matrix.setMatrix(m);
                                    current_transform.appendItem(matrix); /*we append the updated transformation matrix.*/
                                    current_transform.consolidate();
                                }	
                                else{/* if no initial matrix, we go down the tree to find if there is any*/
                                    if (gc[j].hasChildNodes()) {
                                        var ggc = gc[j].children;
                                        for (var k = 0; k < ggc.length;k++){
                                            current_transform = ggc[k].transform.baseVal;
                                            if (current_transform.length  === 1){ /* verify the transform matrix is initialized*/
                                                var ca = current_transform.getItem(0).matrix.a;
                                                var cb = current_transform.getItem(0).matrix.b;
                                                var cc = current_transform.getItem(0).matrix.c; 
                                                var cd = current_transform.getItem(0).matrix.d;
                                                var ce = current_transform.getItem(0).matrix.e;
                                                var cf = current_transform.getItem(0).matrix.f;
                                                var matrix = svg.createSVGTransform();
                                                var m = svg.createSVGMatrix();
                                                var objectX, objectY;
                                                if (ggc[k].tagName === 'text'){
                                                    objectX= ggc[k].x.baseVal[0].value;
                                                    objectY= ggc[k].y.baseVal[0].value;
                                                }
                                                else if (ggc[k].tagName === 'circle'){
                                                    objectX= ggc[k].cx.baseVal.value;
                                                    objectY= ggc[k].cy.baseVal.value;
                                                }
                                                else if (ggc[k].tagName === 'path'){
                                                    objectX = ggc[k].getPointAtLength(0).x;
                                                    objectY = ggc[k].getPointAtLength(0).y;									
                                                }
                                                if  (evt.deltaY  < 0){
                                                    var transX = (objectX- centerX) * init_zfactor * (zfactor - 1);
                                                    var transY = 0;
                                                }
                                                else{
                                                    var transX = (objectX - centerX) * init_zfactor * (1/zfactor - 1);
                                                    var transY = 0;
                                                }
                                                m.e = (cd*transX- cc*transY)/(ca*cd-cb*cc);
                                                m.f = (cb*transX- ca*transY)/(cb*cc-ca*cd);
                                                matrix.setMatrix(m);
                                                current_transform.appendItem(matrix); /*we append the updated transformation matrix.*/
                                                current_transform.consolidate();
                                            }	
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                else if (p[l].classList.contains('parametergroup')) { /* parameter time series*/
                    var c = p[l].children;
                    for(var i=0; i < c.length; i++){ /* we loop in each child and grand child of the each parameter to get transformation matrix and apply translation offset*/
                        if ( c[i].querySelector('rect') || c[i].querySelector('polyline')) { /* check if child is polyline (parameter time serie) or rect (runway).		*/
                            var gc = c[i].children;
                            for (var j =0; j < gc.length;j++){
                                var current_transform = gc[j].transform.baseVal; /* get transform of current node.*/
                                if (current_transform.length  === 1){ /* verify the transform matrix is initialized	*/			
                                    var ca = current_transform.getItem(0).matrix.a;
                                    var cb = current_transform.getItem(0).matrix.b;
                                    var cc = current_transform.getItem(0).matrix.c; 
                                    var cd = current_transform.getItem(0).matrix.d;
                                    var ce = current_transform.getItem(0).matrix.e;
                                    var cf = current_transform.getItem(0).matrix.f;
                                    
                                    var matrix = svg.createSVGTransform();
                                    var m = svg.createSVGMatrix();										
                                    if ((gc[j].tagName === 'polyline') || (gc[j].tagName === 'rect')){
                                        if  (evt.deltaY  < 0){
                                            m.a = zfactor;		
                                            m.e = (1 - m.a) * centerX;
                                        }
                                        else{
                                            m.a = 1/ zfactor;														
                                            m.e = (1 - m.a) * centerX;
                                        }
                                    }
                                    else if (gc[j].tagName === 'text'){ /* translate instead of zoom*/
                                        if (c[i].querySelector('rect')){ /* if text is attached to rect (ie runway), translate */
                                            var objectX, objectY;
                                            objectX= gc[j].x.baseVal[0].value;
                                            objectY= gc[j].y.baseVal[0].value;
                                            if  (evt.deltaY  < 0){			
                                                var transX = (objectX - centerX) * init_zfactor * (zfactor - 1);
                                                var transY = 0;
                                            }
                                            else{
                                                var transX = (objectX - centerX) * init_zfactor * (1/zfactor - 1);
                                                var transY = 0;	
                                            }
                                            m.e = (cd*transX- cc*transY)/(ca*cd-cb*cc);
                                            m.f = (cb*transX- ca*transY)/(cb*cc-ca*cd);
                                        }
                                        else if (c[i].querySelector('polyline')){/* if text is attached to polyline, no transformation applied*/

                                        }
                                    }																							
                                    matrix.setMatrix(m);
                                    current_transform.appendItem(matrix); /*we append the updated transformation matrix.*/
                                    current_transform.consolidate();
                                }
                                else{ /* if no initial matrix, we go down the tree to find if there is any*/
                                    var ggc = gc[j].children;
                                    for (var k = 0; k < ggc.length;k++){
                                        var current_transform = ggc[k].transform.baseVal;
                                        if (current_transform.length  === 1){ /* verify the transform matrix is initialized*/
                                            var objectX, objectY;
                                            if (ggc[k].tagName === 'circle'){
                                                objectX= ggc[k].cx.baseVal.value;
                                                objectY= ggc[k].cy.baseVal.value;
                                                if  (evt.deltaY  < 0){
                                                    m.e = (objectX - centerX) * init_zfactor * (zfactor - 1); 
                                                }
                                                else{
                                                    m.e = (objectX - centerX) * init_zfactor * (1/zfactor - 1);
                                                }
                                            }
                                            else if (ggc[k].tagName === 'text'){ /* future label attached to circle ?*/
                                                objectX= ggc[k].x.baseVal[0].value;
                                                objectY= ggc[k].y.baseVal[0].value;
                                                if  (evt.deltaY  < 0){		
                                                    var transX = (objectX - centerX) * init_zfactor * (zfactor - 1);
                                                    var transY = 0;
                                                }
                                                else{		
                                                    var transX = (objectX - centerX) * init_zfactor * (1/zfactor - 1);
                                                    var transY = 0;
                                                }			
                                                m.e = (cd*transX- cc*transY)/(ca*cd-cb*cc);
                                                m.f = (cb*transX- ca*transY)/(cb*cc-ca*cd);								
                                            }							
                                            matrix.setMatrix(m);
                                            current_transform.appendItem(matrix); /*we append the updated transformation matrix.*/
                                            current_transform.consolidate();
                                        }
                                    }
                                }
                            }
                        }
                        else{ /* no transformation applied to parameter scale*/
                        
                        }
                    }
                }
                else if (p[l].classList.contains('vline')) {
                    var c = p[l].children;
                    for(var i=0; i < c.length; i++){ /* we loop in each child of the each vline*/
                        if (c[i].tagName === 'polyline'){
                            var current_transform =c[i].transform.baseVal;
                            if (current_transform.length  === 1){ /* verify the transform matrix is initialized*/
                                var ca = current_transform.getItem(0).matrix.a;
                                var cb = current_transform.getItem(0).matrix.b;
                                var cc = current_transform.getItem(0).matrix.c; 
                                var cd = current_transform.getItem(0).matrix.d;
                                var ce = current_transform.getItem(0).matrix.e;
                                var cf = current_transform.getItem(0).matrix.f;
                                var matrix = svg.createSVGTransform();
                                var m = svg.createSVGMatrix();										
                                if  (evt.deltaY  < 0){
                                    m.a = zfactor;
                                    m.e = (1 - m.a) * centerX;
                                }
                                else{
                                    m.a = 1 / zfactor;														
                                    m.e =  (1 - m.a) * centerX;
                                }
                                matrix.setMatrix(m);
                                c[i].transform.baseVal.appendItem(matrix); /*we append the updated transformation matrix.*/
                                c[i].transform.baseVal.consolidate();
                            }
                        }
                        if (c[i].tagName === 'text'){
                            var current_transform =c[i].transform.baseVal;
                            if (current_transform.length  === 1){ 
                                var ca = current_transform.getItem(0).matrix.a;
                                var cb = current_transform.getItem(0).matrix.b;
                                var cc = current_transform.getItem(0).matrix.c; 
                                var cd = current_transform.getItem(0).matrix.d;
                                var ce = current_transform.getItem(0).matrix.e;
                                var cf = current_transform.getItem(0).matrix.f;
                                
                                var matrix = svg.createSVGTransform();
                                var m = svg.createSVGMatrix();
                                var objectX, objectY;
                                objectX= c[i].x.baseVal[0].value;
                                objectY= c[i].y.baseVal[0].value;
                                if  (evt.deltaY  < 0){		
                                    var transX = (objectX - centerX) * init_zfactor * (zfactor - 1);
                                    var transY = 0;
                                }
                                else{	
                                    var transX = (objectX - centerX) * init_zfactor * (1/zfactor - 1);
                                    var transY = 0;
                                }
                                m.e = (cd*transX- cc*transY)/(ca*cd-cb*cc);
                                m.f = (cb*transX- ca*transY)/(cb*cc-ca*cd);		
                                matrix.setMatrix(m);
                                current_transform.appendItem(matrix); /*we append the updated transformation matrix.*/
                                current_transform.consolidate();
                            }
                        }
                    }
                }
            }
            selectedGroup = null;
            selectedElement = null;					
        }
        /*Update position and value of lables on cursor*/	
        cursors = document.getElementById("cursorgroup").children;
        for (var i=0; i < cursors.length; i++){
            if (window.getComputedStyle(cursors[i]).getPropertyValue("display")==="block"){
                updateCursorData(cursors[i]);
            }
        }		
    }
    
    function highlight(element,increment){ /* highlight element when passing over.*/
        console.log(element);
        if (element.id.startsWith('textlegendparam') || element.id.startsWith('pathparam')){
            var paramid = element.id.split('**')[1];
            var c = element.parentNode.children;
            for(var i=0; i < c.length; i++){
                if (c[i].tagName==='text'){
                    if (increment < 0) c[i].setAttribute("style", "font-weight: 400");
                    else c[i].setAttribute("style", "font-weight: 800");			
                }
                else if (c[i].tagName==='polyline'){		
                    var toto =  window.getComputedStyle(c[i]).getPropertyValue("stroke-width");
                    var tata = parseFloat(toto) + increment;
                    c[i].setAttribute("style", "stroke-width:"+ tata);
                }
            }
            var cursorparamid1 = document.getElementById('cursorparam_1**'+paramid);
            var cursorparamid2 = document.getElementById('cursorparam_2**'+paramid);
            if (increment < 0){
                cursorparamid1.setAttributeNS(null,"font-size", "3");
                cursorparamid2.setAttributeNS(null,"font-size", "3");			
            }
            else{
                cursorparamid1.setAttributeNS(null,"font-size", "4");	
                cursorparamid2.setAttributeNS(null,"font-size", "4");
            }
            

        }
        else if(element.id.startsWith('cursorparam')){
            if (increment < 0) element.setAttributeNS(null,"font-size", "3");
            else element.setAttributeNS(null,"font-size", "4");	
        }
    }
}