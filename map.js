
var width = 1280,
   height = 800,
   scale0 = (width - 1) / 2 / Math.PI;;

var projection = d3.geoMercator()
   .scale(100000)
   // Center the Map in NYC
   .center([-73.935242, 40.730610])
   .translate([width / 2, height / 2]);

var zoom = d3.zoom()
   .on("zoom", zoomed);

var path = d3.geoPath()
   .projection(projection);

const canvas = d3.select('.canvas');
var mapLayer;
var subwayLayer;
var stationsLayer;

//global for transform
var transGlobal;

// Set svg width & height
// var svg = d3.select('.canvas')
//    .append('svg')
//    .attr('width', width)
//    .attr('height', height);

// Add background
// svg.append('rect')
//    .attr('class', 'background')
//    .attr('width', width)
//    .attr('height', height);

canvas
   .call(zoom);

// var g = svg.append('g');

// var mapLayer = svg.append('g')
//    .attr('class', 'map-layer');

// var subwayLayer = svg.append('g')
//    .attr('class', 'subway-layer');

// Load map data
d3.json('nyc.geojson').then((mapData) => {
   var features = mapData.features;

   // Draw each province as a path
   // mapLayer.selectAll('path')
   //    .data(features)
   //    .enter().append('path')
   //       .attr('d', path)
   //       .attr('vector-effect', 'non-scaling-stroke')
   //       .style('fill', '#ccc');
   
   mapLayer = d3.select('.canvas')
      .append('svg')
      .attr('class', 'map-layer')
      .style('width', width + 'px')
      .style('height', height + 'px')
      .style('background', 'white')
      .selectAll('path')
      .data(features)
      .enter().append('path')
         .attr('d', path)
         .attr('vector-effect', 'non-scaling-stroke')
         .style('fill', '#ccc');
});

// Load subway data
d3.json('nyc_subway.geojson').then((subwayData) => {
   var features = subwayData.features;

   // Draw each province as a path
   // subwayLayer.selectAll('path')
   //    .data(features)
   //    .enter().append('path')
   //       .attr('d', path);
   subwayLayer = d3.select('.canvas')
      .append('svg')
      .attr('class', 'subway-layer')
      .style('width', width + 'px')
      .style('height', height + 'px')
      .selectAll('path')
      .data(features)
      .enter().append('path')
         .attr('d', path)
         .attr('stroke', (d) => {
            if (d.properties.name.includes('B') ||
               d.properties.name.includes('F') ||
               d.properties.name.includes('D') ||
               d.properties.name.includes('M')) {

               return "#ff6319"; 
            } else if (d.properties.name.includes('A') ||
               d.properties.name.includes('C') ||
               d.properties.name.includes('E')) {

               return "#2850ad";
            } else if (d.properties.name.includes('G')) {
               return '#6cbe45';
            } else if (d.properties.name.includes('L')) {
               return "#a7a9ac";
            } else if (d.properties.name.includes('N') ||
               d.properties.name.includes('Q') ||
               d.properties.name.includes('R') ||
               d.properties.name.includes('W')) {
               
               return "#fccc0a";
            } else if (d.properties.name.includes('J') ||
               d.properties.name.includes('Z')) {

               return "#996633";
            } else if (d.properties.name.includes('1') ||
               d.properties.name.includes('2') ||
               d.properties.name.includes('3')) {
               
               return "#ee352e";
            } else if (d.properties.name.includes('4') ||
               d.properties.name.includes('5') ||
               d.properties.name.includes('6')) {
               
               return "#00933c";
            } else if (d.properties.name.includes('7')) {
               
               return "#b933ad";
            } else if (d.properties.name.includes('T')) {
               
               return "#00add0";
            } else if (d.properties.name.includes('S')) {
               
               return "#808183";
            } 
         });
});

d3.json('nyc_stations.geojson').then((subwayData) => {

   const tip = d3.tip()
      .attr('class', 'tip card')
      .html(d => {
         let content = `<div class="name">${d.properties.name}</div>`;
         return content;
      })
      .offset([-10, 0]);

   stationsLayer = d3.select('.canvas')
      .append("svg")
		.attr("class", "stations-layer")
 		.style("width", width + "px")
		.style("height", height + "px")
		.selectAll(".stop")
		.data(subwayData.features)
		.enter().append("circle")
         .attr("r", 5)
         .attr("cx", function(d) {return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[0]})
         .attr("cy", function(d) {return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[1]})
         .on('mouseover', (d,i,n) => {
            d3.select(n[i])
               .transition().duration(100)
                  .attr('r', 10 / (transGlobal !== undefined ? transGlobal.k : 1))
                  .attr('fill', '#fff');

            tip.show(d, n[i]);
         })
         .on('mouseleave', (d,i,n) => {
            d3.select(n[i])
               .transition().duration(100)
                  .attr('r', 5 / (transGlobal !== undefined ? transGlobal.k : 1))
                  .attr('fill', '#000');
            
            tip.hide(d, n[i]);
         });

   stationsLayer.call(tip);
});

function zoomed() {
   var {transform} = d3.event;
   transGlobal = transform;
   mapLayer.attr("transform", transform);
   // mapLayer.attr("stroke-width", 1 / transform.k);

   subwayLayer.attr("transform", transform);
   subwayLayer.attr("stroke-width", 2 / transform.k);

   stationsLayer.attr("transform", transform);
   stationsLayer.attr('r', 5 / transform.k);
}
