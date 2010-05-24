var TimbrePlane = Geometry.extend
({
	init: function( width, height, depth, numX, numY )
	{
		this._super();
		
		this.vRows = [];
		this.fRows = [];

		this.blockHeight = height/numY;

		var width_half = width / 2;
		var height_half = height / 2;
		var depth_half = depth / 2;
		
		for(var y=0;y<=numY;y++){
			var row = [];
			for(var x=0;x<=numX;x++){
				this.v(((width/numX)*x)-width_half,((height/numY)*y)-height_half,depth_half);
				row.push(this.vertices[this.vertices.length-1]);
			}
			this.vRows.push(row);
		}
		
		for(var r=0;r<this.vRows.length;r++){
			var row = this.vRows[r];
			var nextRow = this.vRows[r+1];
			var faceRow = [];
			for (var v=0;v<row.length;v++){
				if(row[v].x<width_half && row[v].y<height_half){
					if (nextRow && row[v] && nextRow[v] && nextRow[v+1] && row[v+1]){
						this.f4v(row[v],nextRow[v],nextRow[v+1],row[v+1]);
						faceRow.push(this.faces[this.faces.length-1]);
					}
				}	
			}
			this.fRows.push(faceRow);
		}
		
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


