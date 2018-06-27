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

var lineSvg = d3.select(".line_chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var lineChartGroup = lineSvg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Import Data
d3.csv("assets/data/car.csv", function(err, carData) {
  if (err) throw err;
  console.log(carData);

  //  Parse Data/Cast as numbers
  carData.forEach(function(data) {
    data.price2014 = +data.price2014;
    data.price2015 = +data.price2015;
    data.price2016 = +data.price2016;
    data.price2017 = +data.price2017;
    data.price2018 = +data.price2018;
    data.price2019 = +data.price2019;
    data.price2020 = +data.price2020;
    data.price2021 = +data.price2021;
    data.price2022 = +data.price2022;
  });
  console.log(carData.car);
  console.log(carData.price2018);

  //  Create scale functions
  var xLinearScale = d3.scaleBand()
    .domain(carData.map(d => d.car))
    .range([0, width]);

  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(carData, d => d.price2018)])
    .range([height, 0]);

  // Create axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  //  Append Axes to the chart
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

   // Create car icone
  var carsGroup = chartGroup.selectAll(".cars")
  .data(carData)
  .enter()
  .append("image")
  .attr("xlink:href", d => d.src)
  .attr("alt", d=>d.car)
  .attr("x", d => xLinearScale(d.car)+15)
  .attr("y", d => yLinearScale(d.price2018))
  .attr("width", "30")
  .attr("height", "30")
  .style("cursor", "pointer")
  .on("click", function() {
    console.log(this.getAttribute("alt"));
    var modelName = this.getAttribute("alt")
    var x = d3.scaleBand()
    .rangeRound([0, width])
    .paddingInner(0.05)
    .align(0.1);

    var y = d3.scaleLinear()
        .rangeRound([height, 0]);

    var z = d3.scaleOrdinal()
        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    d3.csv(`assets/data/${modelName}.csv`, function(d, i, columns) {
      for (i = 1, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
      d.total = t;
      return d;
    }, function(error, data) {
      if (error) throw error;

      var keys = data.columns.slice(1);

      // data.sort(function(a, b) { return b.total - a.total; });
      x.domain(data.map(function(d) { return d.Year; }));
      y.domain([0, d3.max(data, function(d) { return d.total; })]).nice();
      z.domain(keys);

      lineChartGroup.append("g")
        .selectAll("g")
        .data(d3.stack().keys(keys)(data))
        .enter().append("g")
          .attr("fill", function(d) { return z(d.key); })
        .selectAll("rect")
        .data(function(d) { return d; })
        .enter().append("rect")
          .attr("x", function(d) { return x(d.data.Year); })
          .attr("y", function(d) { return y(d[1]); })
          .transition()
          .delay((d,i)=> i * 50)
          .attr("height", function(d) { return y(d[0]) - y(d[1]); })
          .attr("width", x.bandwidth());

      lineChartGroup.append("g")
          .attr("class", "axis")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x));

      lineChartGroup.append("g")
          .attr("class", "axis")
          .call(d3.axisLeft(y).ticks(null, "s"))
        .append("text")
          .attr("x", 2)
          .attr("y", y(y.ticks().pop()) + 0.5)
          .attr("dy", "0.32em")
          .attr("fill", "#000")
          .attr("font-weight", "bold")
          .attr("text-anchor", "start")
          .text("True Cost to Own");

        var legend = lineChartGroup.append("g")
          .attr("font-family", "sans-serif")
          .attr("font-size", 10)
          .attr("text-anchor", "end")
        .selectAll("g")
        .data(keys.slice().reverse())
        .enter().append("g")
          .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
    
      legend.append("rect")
          .attr("x", width - 19)
          .attr("width", 19)
          .attr("height", 19)
          .attr("fill", z);
    
      legend.append("text")
          .attr("x", width - 24)
          .attr("y", 9.5)
          .attr("dy", "0.32em")
          .text(function(d) { return d; });
    })
 
  });

  // time slider
  var data = d3.range(0, 5).map(function (d) { return new Date(2018 + d, 5, 3); });
  console.log(data);
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

  // dropdown select model year then update time slider
  d3.select('#inds')
    .on("change", function () {
      var modelYear = d3.select('select').property('value')
      // var modelYear = sect.options[sect.selectedIndex].value;
      console.log(modelYear);
      var data = d3.range(0, 5).map(function (d) { return new Date(parseInt(modelYear) + d, 5, 3); });
      console.log(data);

      var slider = d3.sliderHorizontal()
      .min(d3.min(data))
      .max(d3.max(data))
      .step(1000 * 60 * 60 * 24 * 365)
      .width(400)
      .tickFormat(d3.timeFormat('%Y'))
      .tickValues(data)
      .on('onchange', val => {
          // d3.select("p#value").text(d3.timeFormat('%Y')(val));
          var carYear = d3.timeFormat('%Y')(slider.value());
          console.log(carYear);
          d3.selectAll("image").transition().duration(1000).attr("y", d => yLinearScale(d["price"+carYear]));
      });

      d3.selectAll("image").transition().duration(1000).attr("y", d => yLinearScale(d["price"+modelYear]));

      // remove previous time slider
      d3.select("#slider").selectAll("*").remove();
      // append new time slider
      var g = d3.select("div#slider").append("svg")
      .attr("width", 500)
      .attr("height", 100)
      .append("g")
      .attr("transform", "translate(30,30)");

      g.call(slider);    
    });
   
});
