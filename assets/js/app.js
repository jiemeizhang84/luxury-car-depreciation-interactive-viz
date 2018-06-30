var svgWidth = 650;
var svgHeight = 400;

var margin = {
  top: 20,
  right: 40,
  bottom: 60,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// initiate with 2018 car data
renderLineChart(2018);
renderPercentageChart(2018);

// dropdown select model year then update all charts
d3.select('#inds')
  .on("change", function () {
    var modelYear = d3.select('select').property('value')
    // var modelYear = sect.options[sect.selectedIndex].value;
    console.log(modelYear);

    d3.select(".chart").selectAll("*").remove();
    renderPercentageChart(modelYear);

    d3.select(".line_chart").selectAll("*").remove();
    renderLineChart(modelYear);

    d3.select(".bar_chart").selectAll("*").remove();
  });


function renderPercentageChart(modelYear) {
  var svg = d3.select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

  var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  d3.csv(`assets/data/car/${modelYear}car.csv`, function(err, carData) {
    if (err) throw err;
    console.log(carData);
    var keys = d3.keys(carData[0]);
    console.log(keys);
    keys = keys.slice(1,keys.length-1);
    console.log(keys);
  
    //  Parse Data/Cast as numbers
    carData.forEach(function(data) {
      for (var i=0; i<keys.length; i++) {
        data[keys[i]] = + data[keys[i]];
      }
    });
  
    //  Create scale functions
    var xLinearScale = d3.scaleBand()
      .domain(carData.map(d => d.car))
      .range([0, width]);
  
    var yLinearScale = d3.scaleLinear()
      .domain([0, 1])
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
    .attr("class","carIcone")
    .attr("xlink:href", d => d.src)
    .attr("alt", d=>d.car)
    .attr("x", d => xLinearScale(d.car)+15)
    .attr("y", d => yLinearScale(d["price"+modelYear]))
    .attr("width", "30")
    .attr("height", "30")
    .style("cursor", "pointer")
    .on("click", function() {
      console.log(this.getAttribute("alt"));
      var modelName = this.getAttribute("alt")
  
      stackedBar(modelYear,modelName);
    });

    renderTimeSlider(modelYear,carData,yLinearScale);     
  });

}


function stackedBar(modelYear,modelName) {
  var barSvg = d3.select(".bar_chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

  var barChartGroup = barSvg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  var x = d3.scaleBand()
    .rangeRound([0, width])
    .paddingInner(0.05)
    .align(0.1);

    var y = d3.scaleLinear()
        .rangeRound([height, 0]);

    var z = d3.scaleOrdinal()
        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    d3.csv(`assets/data/bar/${modelYear}${modelName}.csv`, function(d, i, columns) {
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

      barChartGroup.append("g")
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

      barChartGroup.append("g")
          .attr("class", "axis")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x));

      barChartGroup.append("g")
          .attr("class", "axis")
          .call(d3.axisLeft(y).ticks(null, "s"))
        .append("text")
          .attr("x", 2)
          .attr("y", y(y.ticks().pop()) + 0.5)
          .attr("dy", "0.32em")
          .attr("fill", "#000")
          .attr("font-weight", "bold")
          .attr("text-anchor", "start")
          .text("True Cost to Own of "+modelName);

        var legend = barChartGroup.append("g")
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
}

// line chart function
function renderLineChart(modelYear) {
  var lineSvg = d3.select(".line_chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

  var lineChartGroup = lineSvg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  var parseTime = d3.timeParse("%Y");

  d3.csv(`assets/data/line/${modelYear}car_line.csv`, function(error, carData) {

    if (error) throw error;

    var keys = d3.keys(carData[0]);
    console.log(keys);
    keys = keys.slice(1);
    console.log(keys);
  
    //  Parse Data/Cast as numbers
    carData.forEach(function(data) {
      data.Year = parseTime(data.Year);
      for (var i=0; i<keys.length; i++) {
        data[keys[i]] = + data[keys[i]];
      }
    });
  
    var xTimeScale = d3.scaleTime()
      .domain(d3.extent(carData, data => data.Year))
      .range([0, width]);

    var yLinearScale = d3.scaleLinear()
      // .domain([0, d3.max(carData, data => data.BMWX3)])
      .domain([20000,65000])
      .range([height, 0]);

    var bottomAxis = d3.axisBottom(xTimeScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    var lineColors = ["#784a1c", "#007070", "#c70076", "#8f62cc", "#45bdbd", "#e996c8"];

    for (var i=0; i<keys.length; i++) {
      var drawLine = d3.line()
      .x(data => xTimeScale(data.Year))
      .y(data => yLinearScale(data[keys[i]]));

      lineChartGroup.append("path")
      .attr("d", drawLine(carData))
      .attr("fill", "none")
      .attr("stroke", lineColors[i])
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 4);

      lineChartGroup.selectAll(".brands")
        .data(carData)
        .enter()
        .append("image")
        .attr("class",data => "carIconeLine Y"+ data.Year.getFullYear() )
        .attr("xlink:href", `assets/data/${keys[i]}.png`)
        .attr("x", data => xTimeScale(data.Year)-15)
        .attr("y", data => yLinearScale(data[keys[i]])-15)
        .attr("width", "30")
        .attr("height", "30")
        .style("visibility", "hidden");
    }

    lineChartGroup.selectAll("path").call(transition);

    lineChartGroup.append("g")
      .classed("axis", true)
      .call(leftAxis);

    lineChartGroup.append("g")
      .classed("axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);


    d3.selectAll(`.Y${modelYear}`)
    .style("visibility", "visible");

    function transition(path) {
      path.transition()
          .duration(2000)
          .attrTween("stroke-dasharray", tweenDash);
    }

    function tweenDash() {
        var l = this.getTotalLength(),
            i = d3.interpolateString("0," + l, l + "," + l);
        return function (t) { return i(t); };
    }
  });
}

function renderTimeSlider(modelYear,carData,yLinearScale){
  var data = d3.range(0, 6).map(function (d) { return new Date(parseInt(modelYear) + d, 5, 3); });
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
      d3.selectAll(".carIcone").data(carData).transition().duration(1000).attr("y", d => yLinearScale(d["price"+carYear]));
      d3.selectAll(".carIconeLine").style("visibility", "hidden");
      d3.selectAll(".Y"+carYear).style("visibility", "visible");
      
  });

  // remove previous time slider
  d3.select("#slider").selectAll("*").remove();
  // append new time slider
  var g = d3.select("div#slider").append("svg")
  .attr("width", 500)
  .attr("height", 100)
  .append("g")
  .attr("transform", "translate(30,30)");

  g.call(slider); 

}


