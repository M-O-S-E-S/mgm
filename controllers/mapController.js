angular.module('mgmApp')
.controller('MapController', function($scope){
    $scope.map = new MosesMap("/maps/", $("#mosesMap"));
    $scope.map.updateTiles();
    $scope.map.updateNames();
    window.addEventListener('resize', $scope.map.resize, false);
        
    $scope.map.resize();
    $scope.map.centerTile(1000,1000);
    $scope.map.redraw();
    
});

function MosesMap(mapUrl, canvas){
    var self = this;
    
    self.tileSource = mapUrl;
    self.tiles = [];
    self.regions = {};
    self.centered = false;
    self.canvas = canvas;
    
    self.updateTiles = function(){
        $.getJSON("/server/map/tiles", function(data){
            self.tiles = data;
            self.redraw();
        });
    }
    
    self.updateNames = function(){
        $.getJSON("/server/map/regions", function(data){
            if(self.centered){
                $.each(data, function(index, region){
                    self.regions[region['x'] + "," + region['y']] = region['Name'];
                });
            } else {
                var maxX = 0;
                var minX = 999999999;
                var maxY = 0;
                var minY = 999999999;
                $.each(data, function(index, region){
                    self.regions[region['x'] + "," + region['y']] = region['Name'];
                    region['x'] = parseInt(region['x']);
                    region['y'] = parseInt(region['y']);
                    if(region['x'] > maxX) maxX = region['x'];
                    if(region['x'] < minX) minX = region['x'];
                    if(region['y'] > maxY) maxY = region['y'];
                    if(region['y'] < minY) minY = region['y'];
                });
                self.centerTile((minX+maxX)/2, (minY + maxY)/2);
            }
            self.redraw();
        });
    }
    
    self.port = {width: self.canvas.width(), height: self.canvas.height()};
    self.mouse = {down: false,x: 0,y: 0}
    self.offsetX = (self.port.width/2) -(256/2);
    self.offsetY = (self.port.height/2) +(256/2);
    
    self.redraw = function(){
        self.canvas.clearCanvas();
        self.canvas.drawRect({
            fillStyle: "rgb(29,71,95)",
            x: 0, y: 0,
            width: self.port.width*2,
            height: self.port.height*2
        });
        self.drawGrid();
    }
    
    self.pixelToTile = function(x,y){
        return {'x':Math.floor(-(self.offsetX - x)/(256/self.scalar)),'y': Math.floor((self.offsetY- y)/(256/self.scalar))};
    }
    
    self.centerTile = function(x,y){
        self.centered = true;
        self.goToTile(x,y);
        self.offsetX += (self.port.width/2) -(256/2);
        self.offsetY += (self.port.height/2) +(256/2);
    }
    
    self.goToTile = function(x,y){
        self.offsetX = -x*256/self.scalar;
        self.offsetY = y*256/self.scalar;
    }
    
    self.drawGrid = function(){
        var offYMod = self.offsetY%256;
        var offXMod = self.offsetX%256;
        var width = self.port.width+256*2;
        var height = self.port.height+256*2;
        var tileScalar = 256/self.scalar;
        for( var x = offXMod; x < width; x+=256){
            for( var y = offYMod; y < height; y+=256){
                var coords = self.pixelToTile(x,y);
                var tileName = "map-" + (self.zoomMax - self.zoomLevel+1) + "-" + coords.x + "-" + coords.y + "-objects.png";
                if($.inArray(tileName, self.tiles) != -1){
                    self.canvas.drawImage({
                      source: self.tileSource + tileName,
                      x: x,
                      y: y-256,
                      fromCenter: false
                    });
                }
            }
        }
        if(self.mouse.down && self.zoomLevel > 6){
            //draw grid
            for( var x = offXMod-tileScalar; x < width; x+=tileScalar){
                self.canvas.drawLine({strokeStyle: "#777",strokeWidth: 1,x1: x, y1: 0,x2: x, y2: self.port.height});
            }
            for( var y = offYMod-tileScalar; y < height; y+=tileScalar){
                self.canvas.drawLine({strokeStyle: "#777",strokeWidth: 1,x1: 0, y1: y,x2: self.port.width, y2: y});
            }
            //draw region coordinates and names
            for( var x = offXMod-tileScalar; x < width; x+=tileScalar){
                for( var y = offYMod-tileScalar; y < height; y+=tileScalar){
                    var coords = self.pixelToTile(x,y);
                    var coordstring = coords.x + "," + coords.y;
                    self.canvas.drawText({
                        layer: true,
                        fillStyle: "#fff",
                        strokeStyle: "#000",
                        strokeWidth: .5,
                        x: x, y: y-30,
                        fontSize: "20pt",
                        fontFamily: "Georgia",
                        fromCenter: false,
                        align: "left",
                        respectAlign: true,
                        text: coordstring
                    });
                    if(coordstring in self.regions){
                        self.canvas.drawText({
                        layer: true,
                        fillStyle: "#fff",
                        strokeStyle: "#000",
                        strokeWidth: .5,
                        x: x+60, y: y-tileScalar + 20,
                        fontSize: "20pt",
                        fontFamily: "Georgia",
                        text: self.regions[coordstring]
                    });
                    }
                }
            }
        }
    }
    
    self.scalar = 1;
    self.zoomLevel = 8;
    self.zoomMin = 1;
    self.zoomMax = 8;
    self.changeZoom = function(delta, x, y){
        self.zoomLevel += delta;
        if(self.zoomLevel < self.zoomMin){
            self.zoomLevel = self.zoomMin;
            return;
        } else if(self.zoomLevel > self.zoomMax){
            self.zoomLevel = self.zoomMax;
            return;
        }
        //locate tile under mouse
        var parentOffset = self.canvas.offset();
        x -= parentOffset.left;
        y -= parentOffset.top;
        var tileCoords = self.pixelToTile(x,y)
        //update scalar
        self.scalar = Math.pow(2, self.zoomMax - self.zoomLevel);
        self.goToTile(tileCoords.x, tileCoords.y);
        //put tile back under mouse
        self.offsetX += x;
        self.offsetY += y;
    }
    
    self.canvas.mousedown(function(e){
        self.mouse.down = true
        self.mouse.x = e.pageX;
        self.mouse.y = e.pageY;
        self.redraw();
    });
    self.canvas.mouseup(function(){self.mouse.down = false; self.redraw();});
    self.canvas.mouseleave(function(){self.mouse.down = false; self.redraw();});
    self.canvas.mousemove(function(e){
        if(self.mouse.down){
            //drag map
            var dx = e.pageX - self.mouse.x;
            var dy = e.pageY - self.mouse.y;
            self.mouse.x = e.pageX;
            self.mouse.y = e.pageY;
            self.offsetX += dx;
            self.offsetY += dy;
            self.redraw();
        }
    });
    self.canvas.mousewheel(function(e, delta, deltaX, deltaY) {
        self.changeZoom(delta, e.pageX, e.pageY);
        self.adjustOffset
        self.redraw();
    });
    
    self.resize = function(){
        self.canvas[0].width = self.canvas.parent().width();
        self.canvas[0].height = self.canvas.parent().height();
        self.port = {width: self.canvas.width(), height: self.canvas.height()};
        
        self.canvas[0].width = self.port.width;
        self.canvas[0].height = self.port.height;
        self.redraw();
    }
};
