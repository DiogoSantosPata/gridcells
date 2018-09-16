/************** GRID CELL CLASS *******************/
var GridCell = function (rowNum, colNum, gain, canvasPlotName) {
	this.rowNum = rowNum;
	this.colNum = colNum;
	this.gain = gain;
	this.canvasPlotName = canvasPlotName;
	this.TAO = 0.8/2;
	this.I = 0.3/2;
	this.SIGMA = 0.24/2;
	this.T = 0.05/2;
	this.bias = Math.PI/3;
	this.Sdist =[[0,0],[-0.5,Math.sqrt(3)/2],[-0.5,-Math.sqrt(3)/2],[0.5,Math.sqrt(3)/2],[0.5,-Math.sqrt(3)/2],[-1,0],[1,0]];		
	this.modulation = [];
	this.networkActivity = [];
	this.networkActivityCopy = [];
	this.networkWeights = [];
	this.mean = 0;
	this.min =1000;
	this.max=0;
	this.squareSize =  200/this.rowNum;
	this.speedvect = 0;
};

GridCell.prototype.create_network = function(){
	for (var i = 0; i < this.colNum; i += 1) {
		var subarray = [];
		for (var j = 0; j <= this.rowNum; j += 1) {						
			var act = (Math.random())/(Math.sqrt(this.rowNum*this.colNum))*10;
			subarray.push( act );
		}
		this.networkActivity.push(subarray);
		this.networkActivityCopy.push(subarray);					
	}
};

GridCell.prototype.update_network = function(){
	this.get_mean();
	for (var i = 0; i < this.colNum; i += 1) {
		for (var j = 0; j <= this.rowNum; j += 1) {
			var cellAcitvity =   this.networkActivityCopy[i][j];
			for (var ii = 0; ii < this.colNum; ii += 1) {
				for (var jj = 0; jj <= this.rowNum; jj += 1) {
					cellAcitvity += this.networkActivityCopy[ii][jj]*this.update_weights(i,j,ii,jj);
				}
			}
			this.networkActivity[i][j] = cellAcitvity+this.TAO* ( cellAcitvity/this.mean-cellAcitvity);
			if (this.networkActivity[i][j] < 0.0){  this.networkActivity[i][j] = 0.0; }
		}
	}
};

GridCell.prototype.get_mean = function(){
	this.min =1000;
	this.max=0;

	var mean = 0;
	for (var i = 0; i < this.colNum; i += 1) {
		for (var j = 0; j <= this.rowNum; j += 1) {
			mean += this.networkActivity[i][j]
		}
	}
	this.mean = mean / (this.colNum*this.rowNum);
};

GridCell.prototype.modulationFunc = function(){
		this.modulation[0] = this.gain*(this.speedvect[0]*Math.cos(this.bias)-this.speedvect[1]*Math.sin(this.bias));
		this.modulation[1] = this.gain*(this.speedvect[0]*Math.sin(this.bias)+this.speedvect[1]*Math.cos(this.bias));
};

GridCell.prototype.update_weights = function(x,y,xx,yy){
	this.modulationFunc();
	var i = [ ((x-0.5)/this.colNum) , (((Math.sqrt(3)/2)*(y-0.5))/this.rowNum)];    // i=(ix,iy)
	var j = [ ((xx-0.5)/this.colNum) , (((Math.sqrt(3)/2)*(yy-0.5))/this.rowNum )]; // j=(jx,jy)
	var su2 = [ i[0]-j[0]+this.modulation[0] , i[1]-j[1]+this.modulation[1] ];
	distTri = [];
	var disMin = 1000.0;
	for(var q=0;q<this.Sdist.length;q++){
		var norm = [ su2[0]+this.Sdist[q][0] , su2[1]+this.Sdist[q][1]  ];
		distTri.push(  Math.sqrt( Math.pow(norm[0],2) + Math.pow(norm[1],2) ) );
		if( distTri[q] < disMin ){  disMin = distTri[q]; }
	}
	var wij = this.I*Math.exp(-1*Math.pow(disMin,2)/ (2.0*Math.pow(this.SIGMA,2)) )-this.T;				
	return wij
};

GridCell.prototype.copyMatrix = function(){
	for(var x=0; x<this.rowNum;x++){
		for(var y=0; y<this.colNum;y++){
			this.networkActivityCopy[x][y] = this.networkActivity[x][y];
			if( this.networkActivityCopy[x][y] < this.min  ){this.min=this.networkActivityCopy[x][y];}
			if( this.networkActivityCopy[x][y] > this.max  ){this.max=this.networkActivityCopy[x][y];}
		}
	}
}

GridCell.prototype.plot_network = function(){
	var canvas = document.getElementById(this.canvasPlotName);
	if (canvas.getContext)
	{
		var ctx = canvas.getContext('2d');
		for(var x=0;x<this.colNum;x++){
			for(var y=0;y<this.rowNum;y++){
				ctx.beginPath();
				var val = (this.networkActivity[x][y]-this.min)/(this.max-this.min);
				ctx.clearRect(x*this.squareSize, y*this.squareSize, this.squareSize, this.squareSize);
				ctx.fillStyle = 'rgba(39,157,193,'+val+')';
				ctx.fillRect(x*this.squareSize, y*this.squareSize, this.squareSize, this.squareSize);
			}
		}
	}
};





/************** AGENT *******************/
var Agent = function(x,y){
	this.posx = x;
	this.posy = y;
	this.prevPos = [this.posx,this.posy];
	this.directionX = 2;
	this.directionY = 2;
};

Agent.prototype.move = function(){
	this.prevPos = [this.posx,this.posy];
	if( this.posx <= 400  ){   this.directionX = 2;  }
	if( this.posx >= 600  ){   this.directionX = -2;  }
	if( this.posy <= 400  ){   this.directionY = 2;  }
	if( this.posy >= 600  ){   this.directionY = -2;  }

	this.posx += (this.directionX+Math.random()*2-2 );
	this.posy += (this.directionY+Math.random()*2-2 );				

	var c = document.getElementById("Arena_canvas");
	var ctx = c.getContext("2d");
	ctx.clearRect(0, 0, c.width, c.height);
	ctx.beginPath();				
	ctx.arc(this.posx/3, this.posy/3, 10, 0, 2 * Math.PI);
	ctx.stroke();				
	ctx.fillStyle = "grey";
	ctx.fill();


	this.speedvect = [ this.posx-this.prevPos[0] , this.posx-this.prevPos[0] ];
};



/************** MAIN *******************/
var net0 = new GridCell(10,10,0.02, "plotCanvas0"); // GridCell(numOfRows, numOfColumns, gainFactor, canvasPlotName)
var net1 = new GridCell(10,10,0.03, "plotCanvas1"); // GridCell(numOfRows, numOfColumns, gainFactor, canvasPlotName)
var net2 = new GridCell(10,10,0.05, "plotCanvas2"); // GridCell(numOfRows, numOfColumns, gainFactor, canvasPlotName)
var objects = [net0,net1,net2];

for(var i=0; i<objects.length; i++){
	objects[i].create_network();
	objects[i].plot_network();
	objects[i].modulationFunc();
}

agent = new Agent(500, 500);
window.setInterval(function(){
	agent.move();

	for(var i=0; i<objects.length; i++){
		objects[i].speedvect = agent.speedvect;
		objects[i].update_network();
		objects[i].copyMatrix();
		objects[i].plot_network();
	}
}, 100);
