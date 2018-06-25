var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 60,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Import Data
d3.csv("assets/data/car.csv", function(err, carData) {
  if (err) throw err;
  console.log(carData);

  // Step 1: Parse Data/Cast as numbers
   // ==============================
  carData.forEach(function(data) {
    data.price2018 = +data.price2018;
    data.price2019 = +data.price2019;
    data.price2020 = +data.price2020;
    data.price2021 = +data.price2021;
    data.price2022 = +data.price2022;

  });
  console.log(carData.car);
  console.log(carData.price2018);

  // Step 2: Create scale functions
  // ==============================
  var xLinearScale = d3.scaleBand()
    .domain(carData.map(d => d.car))
    .range([0, width]);

  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(carData, d => d.price2018)])
    .range([height, 0]);

  // Step 3: Create axis functions
  // ==============================
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // Step 4: Append Axes to the chart
  // ==============================
  chartGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis)
    .selectAll("text")
    .attr("y", 0)
    .attr("x", 9)
    .attr("dy", ".35em")
    .attr("transform", "rotate(45)")
    .style("text-anchor", "start");

  chartGroup.append("g")
    .call(leftAxis);

   // Step 5: Create Circles
  // ==============================
  var carsGroup = chartGroup.selectAll(".cars")
  .data(carData)
  .enter()
  .append("image")
  .attr("xlink:href", d => d.src)
  .attr("x", d => xLinearScale(d.car)+15)
  .attr("y", d => yLinearScale(d.price2018))
  .attr("width", "30")
  .attr("height", "30");

  var data = d3.range(0, 5).map(function (d) { return new Date(2018 + d, 5, 3); });

    var slider = d3.sliderHorizontal()
    .min(d3.min(data))
    .max(d3.max(data))
    .step(1000 * 60 * 60 * 24 * 365)
    .width(400)
    .tickFormat(d3.timeFormat('%Y'))
    .tickValues(data)
    .on('onchange', val => {
        d3.select("p#value").text(d3.timeFormat('%Y')(val));
        var carYear = d3.timeFormat('%Y')(slider.value());
        console.log(carYear);
        d3.selectAll("image").transition().duration(1000).attr("y", d => yLinearScale(d["price"+carYear]));
    });

    var g = d3.select("div#slider").append("svg")
    .attr("width", 500)
    .attr("height", 100)
    .append("g")
    .attr("transform", "translate(30,30)");

    g.call(slider);

    d3.select("p#value").text(d3.timeFormat('%Y')(slider.value()));

  
//   .attr("fill", "pink")
//   .attr("opacity", ".5");

//   d3.html("assets/data/car.svg", loadSVG);
//     function loadSVG(svgData) {
//         d3.selectAll("g").each(function() {
//         var gParent = this;
//         d3.select(svgData).selectAll("path").each(function() {
//             gParent.appendChild(this.cloneNode(true))
//         });
//         });
//     };

//   // Step 6: Initialize tool tip
//   // ==============================
//   var toolTip = d3.tip()
//     .attr("class", "tooltip")
//     .offset([80, -60])
//     .html(function(d) {
//       return (`${d.rockband}<br>Hair length: ${d.hair_length}<br>Hits: ${d.num_hits}`);
//     });

//   // Step 7: Create tooltip in the chart
//   // ==============================
//   chartGroup.call(toolTip);

//   // Step 8: Create event listeners to display and hide the tooltip
//   // ==============================
//   circlesGroup.on("click", function(data) {
//     toolTip.show(data);
//   })
//     // onmouseout event
//     .on("mouseout", function(data, index) {
//       toolTip.hide(data);
//     });

//   // Create axes labels
//   chartGroup.append("text")
//     .attr("transform", "rotate(-90)")
//     .attr("y", 0 - margin.left + 40)
//     .attr("x", 0 - (height / 2))
//     .attr("dy", "1em")
//     .attr("class", "axisText")
//     .text("Number of Billboard 100 Hits");

//   chartGroup.append("text")
//     .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
//     .attr("class", "axisText")
//     .text("Hair Metal Band Hair Length (inches)");
    

});
