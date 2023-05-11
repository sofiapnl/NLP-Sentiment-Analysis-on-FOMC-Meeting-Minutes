
function add_svg(wrapper)
{
  var svg = d3.select(wrapper).select("svg");

  if (svg.empty())
    svg = d3.select(wrapper).append("svg");
  else
    svg.selectAll("*").remove();

  return svg.attr("width", 700).attr("height", 550);
}

function set_update(div_id, _)
{

  comm.call({n: 5})
  setInterval(function(){ comm.call({n: 5}) }, 2000);
}

function draw_circle(wrapper, data)
{
  let svg = add_svg(wrapper);

  svg.append('circle')
    .attr('cx', 100) 
    .attr('cy', 100)
    .attr('r', 10)
    .attr('stroke', 'black')
    .attr('stroke-width', 1)
    .attr('fill', '#69a3b2')
    .transition()
    .duration(2500)
    .attr("r", 50)
    .attr("fill", "#b26d69");
}

function draw_barplot(wrapper, data) {
  let svg = add_svg(wrapper);
  let width = 300;
  let height = 300;
  data = data['data'];
  //data = [{ 'features': 0, 'value': 0 }];
  

  var x = d3.scaleLinear()
    .domain([-1, 1])
    .range([0, width]);
  svg.append("g")
    .attr("transform", "translate(0," + height-5+ ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

  var y = d3.scaleBand()
    .range([0, height])
    .domain(data.map(function (d) { return d.feature; }))
    .padding(.1);
  svg.append("g")
    .call(d3.axisLeft(y));


  svg.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", function (d) { return d.value > 0 ? x(0) : x(d.value) })
    .attr("y", function (d) { return y(d.feature); })
    .attr("width", function (d) { return Math.abs(x(0) - x(d.value)); })
    .attr("height", y.bandwidth())
    .attr("fill", function (d) { return d.value >= 0 ? "#0000B9" : "#FF8300" });

}

function draw_boxplot(wrapper, data)
{
  //registering function
  py_callback = new CommAPI("python_callback",
    function (data)
    {
      alert(data['y']);
    });


  var boxplot_width = 30;
  var boxplot_x     = 100;
  var outlier_r     = 3;

  data = data["data"]
  data = data.sort(d3.ascending);

  var q1 = d3.quantile(data, .25);
  var median = d3.quantile(data, .5);
  var q3 = d3.quantile(data, .75);
  var interQuantileRange = q3 - q1;
  var limI = q1 - 1.5 * interQuantileRange;
  var limS = q3 + 1.5 * interQuantileRange;

  var min  = d3.min(data);
  var max  = d3.max(data);
  var mean = d3.mean(data);

  console.log(min, max)

  var x0 = data.find(function(v) {return v >= limI });
  var xf = data.reverse().find(function(v) {return v <= limS });
  var outlier = [];
  outlier = outlier.concat(data.filter(function(v) {return v < limI}));
  outlier = outlier.concat(data.reverse().filter(function(v) {return v > limS}));

  var scaley = d3.scaleLinear().domain([min, max]).range([195, outlier_r]);  
  var y_axis = d3.axisLeft().scale(scaley);  
  var svg    = add_svg(wrapper)

  svg.append('g')
    .attr("class", "y_axis")
    .attr("transform", "translate(30, 0)")
    .call(y_axis); 
    
  var b1 = svg.append('g').attr('class', 'b1');

  b1.append('line')
      .attr('x1', boxplot_x + boxplot_width / 2)              //no centro do rect
      .attr('y1', scaley(xf))
      .attr('x2', boxplot_x + boxplot_width / 2)              //no centro do rect
      .attr('y2', scaley(x0))
      .attr('stroke', 'black')
      .attr('stroke-width', 1)          
  b1.append('rect')
      .attr('x', boxplot_x)
      .attr('y', scaley(q3))
      .attr('width', boxplot_width)
      .attr('height', scaley(q1) - scaley(q3))
      .attr('class', 'box-rect')
      .on('click', function ()
      {
        py_callback.call({ n: 5 })
      });
  b1.selectAll('line.values')
     .data([x0, median, mean, xf])
     .enter()
     .append('line')
     .attr('class', 'values')
     .attr('x1', boxplot_x)             //no inicio do rect
     .attr('y1', function(obj) { return scaley(obj); })
     .attr('x2', boxplot_x + boxplot_width)            //no final do rect
     .attr('y2', function(obj) { return scaley(obj); })
     .attr('stroke',  'black')
     .attr('stroke-width', 1) 
     .attr('stroke-dasharray',  function(obj, index) { return index == 2 ? '2,2' : null; });
  b1.selectAll('circle.outlier')
     .data(outlier)
     .enter()
     .append('circle')
     .attr('class', 'outlier')
     .attr('cx', boxplot_x + boxplot_width / 2)  //no centro do rect
     .attr('cy', function(obj) { return scaley(obj); })
     .attr('r', outlier_r)
     .attr('stroke', 'black')
     .attr('stroke-width', 1)
     .attr('fill', 'none')  
}




function draw_histogram(wrapper, data)
{
  data = data["data"]
  data = data.sort(d3.ascending);

  let svg  = add_svg(wrapper);  
  let min = d3.min(data);
  let max  = d3.max(data);    

  let scalex = d3.scaleLinear().domain([min, max]).range([0, svg.attr("width")]);  
  let x_axis = d3.axisBottom().scale(scalex);  

  svg.append('g')
    .attr("class", "x_axis")
    .attr("transform", "translate(30, " + (svg.attr("height") - 20) + ")")
    .call(x_axis);       

  let histogram = d3.histogram()
      .domain(scalex.domain()) 
      .thresholds(10);

  let bins = histogram(data);
  
  let scaley = d3.scaleLinear()
    .domain([0, d3.max(bins, function (d) { return d.length; })])
    .range([svg.attr("height") - 22, 3]);
  let y_axis = d3.axisLeft().scale(scaley);  

  svg.append('g')
    .attr("class", "y_axis")
    .attr("transform", "translate(30, 0)")
    .call(y_axis);

  svg.selectAll("rect")
      .data(bins)
      .enter()
      .append("rect")
        .attr("x", 32)
        .attr("transform", function(d) { return "translate(" + scalex(d.x0) + "," + scaley(d.length) + ")"; })
        .attr("width", function(d) { return scalex(d.x1) - scalex(d.x0) -1 ; })
        .attr("height", function(d) { return (svg.attr("height") - 20) - scaley(d.length); })
        .attr("class", "hist-rect")
}

function tabulate(data, columns) {
    table = add_svg(wrapper);
		var thead = table.append('thead')
		var	tbody = table.append('tbody');
    
		// append the header row
		thead.append('tr')
		  .selectAll('th')
		  .data(columns).enter()
		  .append('th')
		    .text(function (column) { return column; });

		// create a row for each object in the data
		var rows = tbody.selectAll('tr')
		  .data(data)
		  .enter()
		  .append('tr');

		// create a cell in each row for each column
		var cells = rows.selectAll('td')
		  .data(function (row) {
		    return columns.map(function (column) {
		      return {column: column, value: row[column]};
		    });
		  })
		  .enter()
		  .append('td')
		    .text(function (d) { return d.value; });

	  return table;
}

function draw_regression(wrapper, data)
{
  let svg = add_svg(wrapper);

  let y = data["y"]
  let y_pred = data["y_pred"]
  let coef = data["coef"]

  let x_min = d3.min(y)
  let x_max = d3.max(y)

  let scalex = d3.scaleLinear().domain([x_min, x_max]).range([0, svg.attr("width")]);  
  let x_axis = d3.axisBottom().scale(scalex);  

  svg.append('g')
    .attr("class", "x_axis")
    .attr("transform", "translate(30, " + (svg.attr("height") - 20) + ")")
    .call(x_axis);

  let y_min = d3.min(y_pred)
  let y_max = d3.max(y_pred)    

  let scaley = d3.scaleLinear()
    .domain([y_min, y_max])
    .range([svg.attr("height") - 22, 3]);
  let y_axis = d3.axisLeft().scale(scaley);  

  svg.append('g')
    .attr("class", "y_axis")
    .attr("transform", "translate(30, 0)")
    .call(y_axis);

  let points = y.map(function (value, index) {
    return [value, y_pred[index]];
  });

  svg.selectAll("dot")
    .data(points)
    .enter()
    .append("circle")
    .attr("r", 3.5)
    .attr("cx", function (d) { return Number(scalex(d[0])) + 30; })
    .attr("cy", function (d) { return Number(scaley(d[1])); })
    .style("fill", "#69b3a2");

  svg.append('line')
    .attr('x1', Number(scalex(x_min)) + 30) 
    .attr('y1', Number(scaley(y_min)))
    .attr('x2', Number(scalex(x_max)) + 30)
    .attr('y2', Number(scaley(y_max)))
    .attr('stroke', '#ff6d69')
    .attr('stroke-width', 3)  
}



function draw_scatterplot(wrapper, data)
{
  let svg = add_svg(wrapper);

  let y = data["y"]
  let y_pred = data["y_pred"]
  let coef = data["coef"]

  let x_min = d3.min(y)
  let x_max = d3.max(y)

  let scalex = d3.scaleLinear().domain([x_min, x_max]).range([0, svg.attr("width")]);  
  let x_axis = d3.axisBottom().scale(scalex);  

  svg.append('g')
    .attr("class", "x_axis")
    .attr("transform", "translate(30, " + (svg.attr("height") - 20) + ")")
    .call(x_axis);

  let y_min = d3.min(y_pred)
  let y_max = d3.max(y_pred)    

  let scaley = d3.scaleLinear()
    .domain([y_min, y_max])
    .range([svg.attr("height") - 22, 3]);
  let y_axis = d3.axisLeft().scale(scaley);  

  svg.append('g')
    .attr("class", "y_axis")
    .attr("transform", "translate(30, 0)")
    .call(y_axis);

  let points = y.map(function (value, index) {
    return [value, y_pred[index]];
  });

  svg.selectAll("dot")
    .data(points)
    .enter()
    .append("circle")
    .attr("r", 3.5)
    .attr("cx", function (d) { return Number(scalex(d[0])) + 30; })
    .attr("cy", function (d) { return Number(scaley(d[1])); })
    .style("fill", "#69b3a2");
}




function draw_stacked_plot(wrapper, data) {
  var svg = add_svg(wrapper);
  var color = d3.scaleOrdinal(d3.schemeCategory10);

  // Define data array
  var topics = ['Inflation', 'Consumption', 'Market', 'Policy'];
  var data_array = [];

  data.forEach(function(d) {
    var obj = {};
    obj.date = d.date;
    topics.forEach(function(topic) {
      obj[topic] = +d[topic];
    });
    data_array.push(obj);
  });

  // Define stack layout
  var stack = d3.stack().keys(topics).order(d3.stackOrderNone).offset(d3.stackOffsetNone);

  // Generate stacked data
  var stacked_data = stack(data_array);

  // Define x and y scales
  var x_scale = d3.scaleTime().domain(d3.extent(data_array, function(d) { return new Date(d.date); })).range([0, 690]);
  var y_scale = d3.scaleLinear().domain([0, d3.max(stacked_data[stacked_data.length - 1], function(d) { return d[1]; })]).range([490, 0]);

  // Define area function
  var area = d3.area()
    .x(function(d) { return x_scale(new Date(d.data.date)); })
    .y0(function(d) { return y_scale(d[0]); })
    .y1(function(d) { return y_scale(d[1]); })
    .curve(d3.curveLinear);

  // Add path elements
  svg.selectAll("path")
    .data(stacked_data)
    .enter().append("path")
    .attr("d", area)
    .style("fill", function(d) { return color(d.key); })
    .style("opacity", 1)
    // Add hover feature
    .on("mouseover", function(d) {
      d3.select(this).style("opacity", 1.0);
      tooltip.style("visibility", "visible").text(d.key);
    })
    .on("mousemove", function(d) {
      tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
    })
    .on("mouseout", function(d) {
      d3.select(this).style("opacity", 0.5);
      tooltip.style("visibility", "hidden");
    });

  // Add y-axis
  var x_scale = d3.scaleTime().domain(d3.extent(data_array, function(d) { return new Date(d.date); })).range([0, 690]);
  var y_scale = d3.scaleLinear().domain([0, d3.max(stacked_data[stacked_data.length - 1], function(d) { return d[1]; })]).range([490, 0]);

  // Add x-axis
  var x_axis = d3.axisBottom(x_scale).tickFormat(d3.timeFormat("%Y-%m-%d")).ticks(15);
  var y_axis = d3.axisLeft(y_scale).ticks(10);

  svg.append("g")
    .attr("transform", "translate(0,490)")
    .call(x_axis)
    .selectAll("text")
    .attr("transform", "rotate(-90)")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .style("text-anchor", "end");

  svg.append("g")
    .call(y_axis);


  svg.selectAll("path")
  .data(stacked_data)
  .enter().append("path")
  .attr("d", area)
  .style("fill", function(d) { return color(d.key); })
  .style("opacity", 1)
  .style("stroke", "none"); // Add this line to remove the gridlines


  // Add legend
   var legend = svg.selectAll(".legend")
    .data(topics.slice().reverse())
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
    .attr("x", 690)
    .attr("y", 9)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", color);

  legend.append("text")
    .attr("x", 680)
    .attr("y", 18)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text(function(d) { return d; });
      return svg;
}


function draw_graph_color(wrapper, data) {
  var margin = {top: 20, right: 20, bottom: 50, left: 50};
  let svg = add_svg(wrapper);
  const width = svg.attr('width');
  const height = svg.attr('height');

  const x = d3.scaleUtc()
    .domain(d3.extent(data, d => new Date(d.date)))
    .range([margin.left, width - margin.right]);

  const y = d3.scaleLinear()
    .domain([d3.min(data, d => d.DFF), d3.max(data, d => d.DFF)])
    .range([height - margin.bottom, margin.top]);

  const xAxis = g => g
    .attr('transform', `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));

  const yAxis = g => g
    .attr('transform', `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .call(g => g.select('.domain').remove())
    .call(g => g.select('.tick:last-of-type text').clone()
      .attr('x', 3)
      .attr('text-anchor', 'start')
      .attr('font-weight', 'bold')
      .text('DFF'));

  const line = d3.line()
    .defined(d => !isNaN(d.DFF))
    .x(d => x(new Date(d.date)))
    .y(d => y(d.DFF));

  const newline = d3.line()
    .defined(d => !isNaN(d.value))
    .x(d => x(new Date(d.date)))
    .y(d => y(d.value));

  const newdata = data.map((p, index) => index === data.length - 1 ? [p] : [p, data[index + 1]]);
  const bounds = d3.extent(data, d => d.sentiment_score);
  const interval = bounds[1] - bounds[0];

  const gradientColor = (p) => {
    return d3.interpolateHslLong('red', 'blue')((p[0].sentiment_score - bounds[0]) / interval);
  };

  svg.append('g')
    .call(xAxis);

  svg.append('g')
    .call(yAxis);

  svg.selectAll('path')
    .data(newdata)
    .enter().append('path')
    .attr('d', p => newline(p))
    .attr('stroke', p => gradientColor(p))
    .attr('fill', 'none')
    .attr('stroke-width', 1.5)
    .attr('stroke-linejoin', 'round')
    .attr('stroke-linecap', 'round');

  return svg.node();
}

function draw_line_graph(data, wrapper) {
  const svg = add_svg(wrapper);
  const margin = {top: 20, right: 30, bottom: 30, left: 60};
  const width = 700 - margin.left - margin.right;
  const height = 550 - margin.top - margin.bottom;
  
  
  const x = d3.scaleTime()
    .domain(d3.extent(data, d => new Date(d.date)))
    .range([margin.left, width - margin.right]);
  
  const y = d3.scaleLinear()
    .domain(d3.extent(data, d => d.DFF))
    .range([height - margin.bottom, margin.top]);
  
  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x));
  
  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));
  
  const line = d3.line()
    .x(d => x(new Date(d.date)))
    .y(d => y(d.DFF));
  
  svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("d", line);
  
  return svg.node();
}

function draw_scatter_plot_color(wrapper, data) {
  const margin = { top: 50, right: 80, bottom: 50, left: 50 };
  const width = 700 - margin.left - margin.right;
  const height = 550 - margin.top - margin.bottom;

  var svg = add_svg(wrapper);
  svg = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const xScale = d3.scaleTime()
    .domain(d3.extent(data, d => new Date(d.date)))
    .range([0, width])
    .nice();

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.DFF)])
    .range([height, 0])
    .nice();

  var gradientColor = (p) => {
    return d3.interpolateRainbow(p.sentiment_score);
  };

  const colorScale = d3.scaleLinear()
    .domain([0, 1])
    .range([0, height]);

  const colorbar = svg.append("g")
    .attr("class", "colorbar")
    .attr("transform", `translate(${width + 10}, 0)`);

  const colorbarGradient = colorbar.append("defs")
    .append("linearGradient")
    .attr("id", "colorbar-gradient")
    .attr("x1", "0%")
    .attr("x2", "0%")
    .attr("y1", "0%")
    .attr("y2", "100%");

  colorbarGradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", d3.interpolateRainbow(0));
  colorbarGradient.append("stop")
    .attr("offset", "25%")
    .attr("stop-color", d3.interpolateRainbow(0.25));

  colorbarGradient.append("stop")
    .attr("offset", "50%")
    .attr("stop-color", d3.interpolateRainbow(0.5));
colorbarGradient.append("stop")
    .attr("offset", "75%")
    .attr("stop-color", d3.interpolateRainbow(0.75));


  colorbarGradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", d3.interpolateRainbow(1));

  colorbar.append("rect")
    .attr("width", 20)
    .attr("height", height)
    .style("fill", "url(#colorbar-gradient)");

  const colorbarAxis = d3.axisRight(colorScale)
    .tickFormat(d3.format(".1f"))
    .ticks(10);

  colorbar.append("g")
    .attr("transform", `translate(20, 0)`)
    .call(colorbarAxis);

  colorbar.append("text")
    .attr("transform", `translate(${margin.right - 20}, ${-10})`)
    .style("text-anchor", "end")
    .text("sentiment_score");

  svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xScale(new Date(d.date)))
    .attr("cy", d => yScale(d.DFF))
    .attr("r", 5)
    .style("fill", d => gradientColor(d));

  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);

  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  svg.append("g")
    .call(yAxis);

  return svg.node();
}
