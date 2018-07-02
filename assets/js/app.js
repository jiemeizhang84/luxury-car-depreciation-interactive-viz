

// initiate with 2018 car data
renderLineChart(2018);
renderPercentageChart(2018);
renderScatter(2018);

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

    d3.select(".scatter_chart").selectAll("*").remove();
    renderScatter(modelYear);


  });


function renderPercentageChart(modelYear) {

  var svgWidth = 650;
  var svgHeight = 600;

  var margin = {
    top: 100,
    right: 40,
    bottom: 60,
    left: 60
  };

  var width = svgWidth - margin.left - margin.right;
  var height = svgHeight - margin.top - margin.bottom;

  var svg = d3.select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

  var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  d3.csv(`assets/data/car/${modelYear}.csv`, function(err, carData) {
    if (err) throw err;
    console.log(carData);
    var keys = d3.keys(carData[0]);
    console.log(keys);
    keys = keys.slice(1,keys.length-1);
    console.log(keys);
  
    //  Parse Data/Cast as numbers
    carData.forEach(function(data) {
      for (var i=0; i<keys.length; i++) {
        data[keys[i]] = data[keys[i]]*100;
        // console.log(data[keys[i]]);
      }
    });
  
    //  Create scale functions
    var xLinearScale = d3.scaleBand()
      .domain(carData.map(d => d.car))
      .range([0, width]);
  
    var yLinearScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0,height]);
  
    // Create axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // gridlines in y axis function
    function make_y_gridlines() {		
      return d3.axisLeft(yLinearScale)
          .ticks(10)
    }
     // add the X gridlines
    // add the Y gridlines
    chartGroup.append("g")			
      .attr("class", "grid")
      .call(make_y_gridlines()
          .tickSize(-width)
          .tickFormat("")
      )
  
    //  Append Axes to the chart
    chartGroup.append("g")
      // .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis)
      .selectAll("text")
      .attr("y", 0)
      .attr("x", 9)
      .attr("dy", ".35em")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "start");

    chartGroup.append("g")
      .attr("transform", "rotate(-90)")
      .append("text")
      .attr("class", "axisText")
      .attr("font-weight", "bold")
      .attr("font-size", 12)  
      .attr("y", 0 - margin.left)
      .attr("x", 0 - height/2-50)
      .attr("dy", "1em")
      .text("Depreciation (%)");  
  
    chartGroup.append("g")
      .call(leftAxis);

    chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`)
      .append("text")
      .attr("class", "axisText")
      .attr("x", -25)
      .attr("y", 20)
      .attr("font-weight", "bold")
      .attr("font-size", 12)
      .text(modelYear + " Luxury SUV");
  
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
  
      d3.select(".bar_chart").selectAll("*").remove();
      stackedBar(modelYear,modelName);
    });

    

    renderTimeSlider(modelYear,carData,yLinearScale);     
  });

}


function stackedBar(modelYear,modelName) {

  var svgWidth = 550;
  var svgHeight = 500;

  var margin = {
    top: 60,
    right: 40,
    bottom: 60,
    left: 60
  };

  var width = svgWidth - margin.left - margin.right;
  var height = svgHeight - margin.top - margin.bottom;

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
      // console.log(data.slice(0,5));
      // var data = cardata.slice(0,5);

      // var keys = cardata.columns.slice(1);
      var keys = data.columns.slice(1);
      console.log(keys);

      // data.sort(function(a, b) { return b.total - a.total; });
      x.domain(data.map(function(d) { return d.Year; }));
      y.domain([0, d3.max(data, function(d) { return d.total; })]).nice();
      z.domain(keys);

      var barGroup = barChartGroup.append("g")
        .selectAll("g")
        .data(d3.stack().keys(keys)(data))
        .enter().append("g")
          .attr("fill", function(d) { return z(d.key); });

      var rect = barGroup.selectAll("rect")
        .data(function(d) { return d; })
        .enter().append("rect")
          .attr("x", function(d) { return x(d.data.Year); })
          .attr("y", function(d) { return y(d[1]); })
          // .transition()
          // .delay((d,i)=> i * 50)
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
          .attr("x", 120)
          .attr("y", -20)
          .attr("dy", "0.32em")
          .attr("fill", "#000")
          .attr("font-weight", "bold")
          .attr("font-size", 12)
          .attr("text-anchor", "start")
          .text("True Cost to Own of "+modelYear+" "+modelName);

        var legend = barChartGroup.append("g")
          .attr("font-family", "sans-serif")
          .attr("font-size", 10)
          .attr("text-anchor", "end")
        .selectAll("g")
        .data(keys.slice().reverse())
        .enter().append("g")
          .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
    
      legend.append("rect")
          .attr("x", width - 19-80)
          .attr("width", 19)
          .attr("height", 19)
          .attr("fill", z);
    
      legend.append("text")
          .attr("x", width - 24-80)
          .attr("y", 9.5)
          .attr("dy", "0.32em")
          .text(function(d) { return d; });

      var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([10,0])
      .html(function(d) {
        // console.log(d);
        return (`<strong>$${d[1]-d[0]}<strong>`);
      });
    
        // Step 2: Create the tooltip in chartGroup.
      barChartGroup.call(toolTip);
  
      // Step 3: Create "mouseover" event listener to display tooltip
      rect.on("mouseover", function(d) {
        toolTip.show(d);
      })
      // Step 4: Create "mouseout" event listener to hide tooltip
        .on("mouseout", function(d) {
          toolTip.hide(d);
        });
    })
}

// line chart function
function renderLineChart(modelYear) {

  var svgWidth = 450;
  var svgHeight = 600;

  var margin = {
    top: 30,
    right: 40,
    bottom: 40,
    left: 60
  };

  var width = svgWidth - margin.left - margin.right;
  var height = svgHeight - margin.top - margin.bottom;

  var lineSvg = d3.select(".line_chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

  var lineChartGroup = lineSvg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  var parseTime = d3.timeParse("%Y");

  d3.csv(`assets/data/line/${modelYear}_line.csv`, function(error, carData) {

    if (error) throw error;

    var keys = d3.keys(carData[0]);
    console.log(keys);
    keys = keys.slice(1);
    console.log(keys);

    var price_max = 0;
    var price_min = 50000;
  
    //  Parse Data/Cast as numbers
    carData.forEach(function(data) {
      data.Year = parseTime(data.Year);
      

      for (var i=0; i<keys.length; i++) {
        data[keys[i]] = + data[keys[i]];
        if (data[keys[i]]>price_max) {
          price_max = data[keys[i]];
        } else {price_max = price_max;}
        if (data[keys[i]]<price_min) {
          price_min = data[keys[i]];
        } else {price_min = price_min;}

      }
    });
  
    var xTimeScale = d3.scaleTime()
      .domain(d3.extent(carData, data => data.Year))
      .range([0, width]);

    var yLinearScale = d3.scaleLinear()
      // .domain([0, d3.max(carData, data => data.BMWX3)])
      .domain([price_min,price_max])
      .range([height, 0]);

    var bottomAxis = d3.axisBottom(xTimeScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    var lineColors = ["#784a1c", "#007070", "#c70076", "#8f62cc", "#45bdbd", "#e996c8","#7fc97f","#beaed4","#fdc086","#FF6D00","#386cb0","#f0027f","#bf5b17"];

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
      

      var brands = lineChartGroup.selectAll(".brands")
        .data(carData)
        .enter()
        .append("image")
        .attr("class",data => "carIconeLine Y"+ data.Year.getFullYear() )
        .attr("xlink:href", `assets/data/imagesModel/${keys[i]}.png`)
        .attr("x", data => xTimeScale(data.Year)-15)
        .attr("y", data => yLinearScale(data[keys[i]])-15)
        .attr("width", "30")
        .attr("height", "30")
        .style("visibility", "hidden");

    }

    lineChartGroup.selectAll("path").call(transition);

    lineChartGroup.append("g")
      .classed("axis", true)
      .call(leftAxis)
      .append("text")
          .attr("x", 140)
          .attr("y", -20)
          .attr("dy", "0.32em")
          .attr("fill", "#000")
          .attr("font-weight", "bold")
          .attr("font-size", 12)
          .attr("text-anchor", "start")
          .text(modelYear + " Luxury SUV");

    lineChartGroup.append("g")
          .attr("transform", "rotate(-90)")
          .append("text")
          .attr("class", "axisText")
          .attr("font-weight", "bold")
          .attr("font-size", 12)  
          .attr("y", 0 - margin.left)
          .attr("x", 0 - height/2-50)
          .attr("dy", "1em")
          .text("Cash Price ($)"); 

    lineChartGroup.append("g")
      .classed("axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);


    d3.selectAll(`.Y${modelYear}`)
    .style("visibility", "visible");

    var z = d3.scaleOrdinal()
        .range(lineColors)
        .domain(keys);

    var legend = lineChartGroup.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
      .selectAll("g")
      // .data(keys.slice().reverse())
      .data(keys.slice())
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

function renderScatter(modelYear){
  d3.csv(`assets/data/scatter/${modelYear}_scatter.csv`,function(error,carData){
    if (error) throw error;
     console.log(carData);



  var chartmargin = { top: 80, right:100, bottom: 50, left:50 };
  chartwidth = 1000 - chartmargin.left - chartmargin.right,
  chartheight = 480 - chartmargin.top - chartmargin.bottom;

  var tooltip = d3.select(".scatter_chart").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

  var xCar = "Car Price",
      yCar = "TCTO",
      colorCar="car",
      brand = "Model";

  // var color = d3.scaleOrdinal(d3.schemeCategory10);
  var color = d3.scaleOrdinal(["#784a1c", "#007070", "#c70076", "#8f62cc", "#45bdbd", "#e996c8","#7fc97f","#beaed4","#fdc086","#FF6D00","#386cb0","#f0027f","#bf5b17"]);
        

  var tip = d3.tip()
          .attr("class", "d3-tip")
          .offset([-10, 0])
          .html(function(d) {
          return brand + ": " + d.car + "<br>" + xCar + ": " + d.Hicash + "<br>" + yCar + ": " + d.Hicost;
          });

  var x = d3.scaleLinear()          
        .range([0, chartwidth])
        .nice();


  var y = d3.scaleLinear()
      .range([chartheight, 0]);

  var xAxis = d3.axisBottom(x).ticks(12),
      yAxis = d3.axisLeft(y).ticks(12 * chartheight / chartwidth);

  var brush = d3.brush().extent([[0, 0], [chartwidth, chartheight]]).on("end", brushended),
      idleTimeout,
      idleDelay = 750;

  var svg = d3.select(".scatter_chart").append("svg")
              .attr("width", chartwidth + chartmargin.left + chartmargin.right)
              .attr("height", chartheight + chartmargin.top + chartmargin.bottom)
              .append("g")
              .attr("transform", "translate(" + chartmargin.left + "," + chartmargin.top + ")");
            
  

  var clip = svg.append("defs").append("svg:clipPath")
      .attr("id", "clip")
      .append("svg:rect")
      .attr("width", chartwidth )
      .attr("height", chartheight )
      .attr("x", 0) 
      .attr("y", 0); 

  var xExtent = d3.extent(carData, function (d) { return d.Hicash; });
  var yExtent = d3.extent(carData, function (d) { return d.Hicost; });
  x.domain([-1,1]).nice();
  y.domain([-1,1]).nice();

  var scatter = svg.append("g")
      .attr("id", "scatterplot")
      .attr("clip-path", "url(#clip)");
  scatter.call(tip)
  var xy= scatter.selectAll(".dot")
      .data(carData)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 4)
      .attr("cx", function (d) { return x(d.Hicash); })
      .attr("cy", function (d) { return y(d.Hicost); })
      .style("fill", function(d) { return color(d[colorCar]); })
      .on("mouseover", function(d) {tip.show(d)})
      .on("mouseout", function(d) {tip.hide(d)});

  // x axis
  svg.append("g")
    .attr("class", "x_axis")
    .attr('id', "axis--x")
    .attr("transform", "translate(0," + chartheight/2 + ")")
    .call(xAxis);

  svg.append("text")
  .style("text-anchor", "end")
      .attr("x", chartwidth)
      .attr("y", chartheight - 8)
  .text("Cash Price");

  var legend= svg.selectAll(".legend")
          .data(color.domain())
          .enter().append("g")
          .classed("legend", true)
          .attr("transform", function(d, i) { return "translate(0," + i * 30 + ")"; });

      legend.append("circle")
          .attr("r", 3.5)
          .attr("cx", chartwidth + 10)
          .attr("fill", color);

      legend.append("text")
          .attr("x", chartwidth + 16)
          .attr("dy", ".35em")
          .attr("font-family", "sans-serif")
           .attr("font-size", 9.5)
          .text(function(d) { return d; });
  // x axis gridlines
  function make_x_gridlines() {   
          return d3.axisBottom(x)
              .ticks(10)
  }

  // var xGrid = svg.append("g")
  //         .attr('class', 'grid')     
  //         .attr("id", "grid")
  //         .attr("transform", "translate(0," + chartheight + ")")
  //         .call(make_x_gridlines()
  //             .tickSize(-chartheight+10)
  //             .tickFormat(""));
  // y axis
  svg.append("g")
      .attr("class", "y_axis")
      .attr('id', "axis--y")
      .attr("transform", "translate("+chartwidth/2 + ",0)")
      .call(yAxis);

  svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "1em")
      .style("text-anchor", "end")
      .text("TCTO");

  scatter.append("g")
      .attr("class", "brush")
      .call(brush)
      ;

  function brushended() {

      var s = d3.event.selection;
      if (!s) {
          if (!idleTimeout) return idleTimeout = setTimeout(idled, idleDelay);
          svg.select("#axis--x").attr("transform", "translate(0," +chartheight/2 + ")");
          svg.select("#axis--y").attr("transform", "translate("+chartwidth/2 + ",0)"); 
          x.domain([-1,1]).nice();
          y.domain([-1,1]).nice();
          

      } else {
          
          x.domain([s[0][0], s[1][0]].map(x.invert, x));
          y.domain([s[1][1], s[0][1]].map(y.invert, y));
          if((s[0][0]>(chartwidth/2)) & (s[0][1]<(chartheight/2))){
          svg.select("#axis--x").attr("transform", "translate(0," +chartheight + ")");
          svg.select("#axis--y").attr("transform", "translate("-chartwidth + ",0)");
          }
          else if ((s[0][0]>(chartwidth/2)) & (s[0][1]>(chartheight/2))) {
              svg.select("#axis--x").attr("transform", "translate(0," -chartheight + ")");
              svg.select("#axis--y").attr("transform", "translate("-chartwidth + ",0)");
          }
          else if ((s[0][0]<(chartwidth/2)) & (s[0][1]>(chartheight/2))) {
              svg.select("#axis--x").attr("transform", "translate(0," -chartheight + ")");
              svg.select("#axis--y").attr("transform", "translate("+chartwidth + ",0)");
          }
          else{
              svg.select("#axis--x").attr("transform", "translate(0," +chartheight + ")");
              svg.select("#axis--y").attr("transform", "translate("+chartwidth + ",0)");
          }
        
          scatter.select(".brush").call(brush.move, null);
      }
      
      zoom();
  }

  function idled() {
      idleTimeout = null;
  }

  function zoom() {

      var t = scatter.transition().duration(300);
      svg.select("#axis--x").transition(t).call(xAxis);
      svg.select("#axis--y").transition(t).call(yAxis);
      
      scatter.selectAll("circle").transition(t)
      .attr("cx", function (d) { return x(d.Hicash); })
      .attr("cy", function (d) { return y(d.Hicost); })
      ;
      
      

  }


  });
}


