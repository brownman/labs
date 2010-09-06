var TimbrePlane = Geometry.extend
({
	init: function( width, height, depth )
	{
		this._super();
		
		var numX = 12;
		var numY = 600;
		
		this.bottoms = [];
		this.tops = [];
		this.matrixMap = [];
		
		var width_half = width / 2;
		var height_half = height / 2;
		var depth_half = depth / 2;
		
		/*
		for(var y=0;y<=numY;y++){
			for(var x=0;x<=numX;x++){
				this.v(((width/numX)*x)-width_half,((height/numY)*y)-height_half,-depth_half);
				this.bottoms.push(this.vertices[this.vertices.length-1]);
			}
		}
		*/
		for(var y=0;y<=numY;y++){
			var row = [];
			for(var x=0;x<=numX;x++){
				this.v(((width/numX)*x)-width_half,((height/numY)*y)-height_half,depth_half);
				this.tops.push(this.vertices[this.vertices.length-1]);
				row.push(this.vertices[this.vertices.length-1]);
			}
			this.matrixMap.push(row);
		}
		
		/* 
		console.log(this.vertices.length);
		this.f4(0,0+1,0+numX+2,0+numX+1);
		this.f4(1,1+1,1+numX+2,1+numX+1);
		this.f4(2,2+1,2+numX+2,2+numX+1);
		this.f4(3,3+1,3+numX+2,3+numX+1);
		*/
		/*
		for(var v=0;v<this.bottoms.length;v++){
			//console.log(this.faces[this.faces.length-1],this.faces.length);
			//console.log(this.vertices[v],this.vertices[v+numX],this.vertices[v+numX+1],this.vertices[v+1]);
			// Top and Bottom coverage:
			
			if(this.bottoms[v].x<width_half && this.bottoms[v].y<height_half){
				if (this.bottoms[v] && this.bottoms[v+numX+1] && this.bottoms[v+numX+2] && this.bottoms[v+1]){
					this.f4v(this.bottoms[v],this.bottoms[v+numX+1],this.bottoms[v+numX+2],this.bottoms[v+1]);	
				}
			}	
		}
		*/
	
		for(var v=0;v<this.tops.length;v++){
			if(this.tops[v].x<width_half && this.tops[v].y<height_half){
				if (this.tops[v] && this.tops[v+1+numX] && this.tops[v+numX+2] && this.tops[v+1]){
					this.f4v(this.tops[v],this.tops[v+1+numX],this.tops[v+numX+2],this.tops[v+1]);	
				}
			}
			/*
			if(this.tops[v].x==width_half && this.tops[v].y!=height_half){
				this.f4v(this.tops[v],this.bottoms[v],this.bottoms[v+numX+1],this.tops[v+numX+1]);
			}
			if(this.tops[v].x==-width_half && this.tops[v].y!=height_half){
				this.f4v(this.tops[v],this.tops[v+numX+1],this.bottoms[v+numX+1],this.bottoms[v]);
			}
			if(this.tops[v].x==width_half && this.tops[v].y!=height_half){
				this.f4v(this.tops[v],this.bottoms[v],this.bottoms[v+numX+1],this.tops[v+numX+1]);
			}
			if(this.tops[v].x==width_half && this.tops[v].y!=height_half){
				this.f4v(this.tops[v],this.bottoms[v],this.bottoms[v+numX+1],this.tops[v+numX+1]);
			}
			*/
		}

		// Sides
			/*
			if(this.vertices[v].x==-width_half && this.vertices[v].y!=height_half && v <=numX*numY){
				this.f4(v,v+numX*numY,v+1+numX*numY,v+1)
			}
			if(this.vertices[v].x==width_half && this.vertices[v].y!=-height_half && v<=numX*numY){
				this.f4(v,v+numX*numY,v+1+numX*numY,v+1)
			}
			if(this.vertices[v].y==height_half && this.vertices[v].x!=-width_half && v<=numX*numY){
				this.f4(v,v+numX*numY,v+1+numX*numY,v+1)
			}
			if(this.vertices[v].y==-height_half && this.vertices[v].x!=width_half && v<=numX*numY){
				this.f4(v,v+numX*numY,v+1+numX*numY,v+1)
			}
			*/
		
		
	},

	v: function( x, y, z )
	{
		this.vertices.push( new Vertex( x, y, z ) );
	},

	f4: function( a, b, c, d )
	{
		this.faces.push( new Face4( this.vertices[a], this.vertices[b], this.vertices[c], this.vertices[d] ) );
	},
	
	f4v: function(a, b, c, d){
		this.faces.push( new Face4( a, b, c, d ) );
	}
	
	
});


