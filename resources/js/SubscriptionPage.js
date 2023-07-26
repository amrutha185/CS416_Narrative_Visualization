var w = 500; // Width of the SVG element
var h = 500; // Height of the SVG element
//var enablePolylines = true;
// Define the initial plan
var initialPlan = "Premium (paid subscription)";
var width = 500; // Width of the SVG element
var height = 500; // Height of the SVG element
margin = { top: 20, right: 20, bottom: 60, left: 80 };

// Load the CSV data
d3.csv("resources/dataset/Spotify_data.csv").then(function(data) {

  var counts = {
    free: 0,
    paid: 0
  };

    // Calculate counts by usage period and subscription
    const rollupcounts = d3.rollup(
        data,
        (v) => v.length,
        (d) => d.spotify_usage_period,
        (d) => d.spotify_subscription_plan
      );

  data.forEach(function(d) {
    if (d.spotify_subscription_plan === "Free (ad-supported)") {
      counts.free++;
    } else if (d.spotify_subscription_plan === "Premium (paid subscription)") {
      counts.paid++;
    }
  });

  // Extract unique subscriptions
  const plans = Array.from(new Set(data.map((d) => d.spotify_subscription_plan)));

  // Create an array of spotify_usage_period
  //const period = Array.from(rollupcounts.keys());
  const usagePeriod = Array.from(rollupcounts.keys());


  //Begin Creating Pie chart
  // Create a pie chart
  var radius = Math.min(w, h) / 3;

  var svg = d3
    .select("#piechart") // Select the correct SVG element using the ID
    .attr("width", w)
    .attr("height", h)
	;

  var g = svg
    .append("g")
    .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")");

	var color = d3.scaleOrdinal()
    .domain(Object.keys(counts))
    .range(["#1ed760", "white"]); // Colors for pie slices

	var pie = d3.pie().value(function(d) {
		return d[1];
	  });

  var dataPie = pie(Object.entries(counts));


  //Add tooltips to the chart

  var piediv = d3.select("body").append("div")   
  .attr("class", "tooltip")               
  .style("opacity", 0);

  var arc = d3.arc()
    .innerRadius(80)
    .outerRadius(radius);

  var arcOver = d3.arc()
  .innerRadius(90)
  .outerRadius(radius+5);

  var arcs = g.selectAll("arc")
    .data(pie(Object.entries(counts)))
    .enter()
    .append("g")
	.attr("class", "arc");


  arcs
    .append("path")
    .attr("d", arc)
    .attr("fill", function(d) {
      return color(d);
    })
     .on("click", function(e,d) {
      var selectedPlan = d.data[0];
      filterBarChart(selectedPlan);
    })
     .on("mouseover", function (event,d) {
      d3.select(this)
      .transition()
      .duration(200)
      .attr("d",arcOver)
      .attr("stroke-width",1)

      d3.select(".tooltip")
          .style("left", event.pageX + "px")
          .style("top", event.pageY + "px")
          .style("opacity", 1)
          .text(
                  d.data[1] + " users with "+d.data[0] +" subscription"                                        
           );
  })
    .on("mouseout", function () {
      d3.select(this)
      .transition()
      .duration(200)
      .attr("d",arc)
      .attr("stroke",none)
    // Hide the tooltip
    d3.select("#tooltip")
        .style("opacity", 0);
  }) 
  ; 



	var pos = d3.arc().innerRadius(radius / 2).outerRadius(radius);
	arcs
    .append("text")
    .attr("transform", function(d) { return "translate(" + pos.centroid(d) + ")"; }) 
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .attr("fill","#000000")
    .text(function(d) {
      var percentage = (d.data[1] / (counts.free + counts.paid) * 100).toFixed(2);
      return percentage + "%";
    });

  // Add labels and annotation lines outside the pie chart
  var labelRadius = radius + 30;

  var labels = g.selectAll("label")
    .data(pie(Object.entries(counts)))
    .enter()
    .append("g")
    .attr("class", "label");



  labels
    .append("text")
    .attr("transform", function(d) {
      var centroid = arc.centroid(d);
      var x = centroid[0] *1.8; // Adjust the x-position of the label
      var y = centroid[1] *1.8; // Adjust the y-position of the label
      return "translate(" + x + "," + y + ")";
    })
    .attr("text-anchor", "middle")
    .text(function(d) {
      if (d.data[0] === 'free') {
        return "Free (ad-supported)";
      } else if (d.data[0] === 'paid') {
        return "Premium (paid subscription)";
      }
    })
    .attr("fill","white");



    labels.each(function(d) {
      var centroid = arc.centroid(d);
      var angle = Math.atan2(centroid[1], centroid[0]);
      var x1 = Math.cos(angle) * (radius +20); // Adjust the starting x-position of the polyline
      var y1 = Math.sin(angle) * (radius -10); // Adjust the starting y-position of the polyline
      var x2 = Math.cos(angle) * (radius +60); // Adjust the ending x-position of the polyline
      var y2 = Math.sin(angle) * (radius + 30); // Adjust the ending y-position of the polyline

      var points = [
        [x1, y1],
        [x2, y2]
      ];

      var line = d3.line();
      //var circle = d3.circle();

      d3.select(this)
        .append("polyline")
        .attr("class", "annotation-line")
        .attr("points", points.map(function(point) {
          return point.join(",");
        }))
        .attr("fill", "none")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5);
    });



  //End of Pie chart creation

//Begin Creating Bar chart

// Filter the data based on the selected plan
const initialPlanData = usagePeriod.map((period) => {
  const count = rollupcounts.get(period).get(initialPlan) || 0;
  const periodArray = {period, count}
   return (periodArray);
});
//const initialPlanData1 = initialPlanData.sort(function(a, b){ return d3.descending(a[1], b[1]); })

initialPlanData.sort((a, b) => b.count - a.count); 
console.log(initialPlanData);

// Create an SVG element
const barsvg = d3.select("#subbarchart")
.attr("width", width)
.attr("height", height + 30);

// Define the scales for x and y axes
const xScale = d3.scaleBand()
    .domain(initialPlanData.map(d=>d.period))
    .range([margin.left, width - margin.right])
    .padding(0.1);

const yScale = d3.scaleLinear()
    .domain([0, d3.max(initialPlanData, d => d.count)])
    .range([height - margin.bottom, margin.top]);


// Create x axis
barsvg.append("g")
.attr("class","axis")
.attr("transform", `translate(0,${height - margin.bottom})`)
.call(d3.axisBottom(xScale))
.selectAll("text")
.style("text-anchor", "end")
.attr("transform", "rotate(-45)")
.attr("fill","white");

// Create y axis
barsvg.append("g")
.attr("class","axis")
.attr("transform", `translate(${margin.left},0)`)
.call(d3.axisLeft(yScale))
.selectAll("text")
.attr("fill","white");

// Add x-axis label
barsvg.append("g")
.attr("transform", "translate(275,500)")
.append("text")
  .attr("class", "x label")
  .attr("text-anchor", "end")
  .text("Period")
  .attr("fill", "#1ed760")
  .style("font-weight", "bold");

  // Add y-axis label
barsvg.append("g")
.attr("transform", "translate(70,200)")
.append("text")
.attr("class", "y label")
.attr("text-anchor", "end")
.attr("y", -margin.left + 10)
.attr("dy", ".75em")
.attr("transform", "rotate(-90)")
.text("No. of Users")
.attr("fill", "#1ed760")
.style("font-weight", "bold");



// Create bars
barsvg
    .selectAll("rect")
    .data(initialPlanData)
    .enter()
    .append("rect")
    .attr("x", (d) => xScale(d.period))
    .attr("y", (d) => yScale(d.count)) 
    .attr("width", xScale.bandwidth()-20)
    .attr("height", (d) => height - margin.bottom - yScale(d.count))
    .attr("fill",  "white");
  
  // Add y-axis grid lines
barsvg
.append('g')
.attr("transform", "translate(80,0)")
.attr('class', 'grid')
.call(d3.axisLeft(yScale)
.tickSize(-420)
.tickSizeOuter(0)
.tickFormat(''));

// Style the grid lines
barsvg.selectAll('.grid line')
.style('stroke', 'gray')
.style('stroke-dasharray', '3 3')
.style('opacity', '0.7');

  // Add labels on top of the bars
  barsvg
  .selectAll(".bar-label")
  .data(initialPlanData)
  .enter()
  .append("text")
  .attr("class", "bar-label")
  .attr("x", (d) => xScale(d.period) + xScale.bandwidth() / 2 - 10)
  .attr("y", (d) => yScale(d.count) - 5)
  .attr("text-anchor", "middle")
  .text((d) => d.count)
  .attr("fill", "white");   

//Add annotation to the chart

const ageannotations = [
  {
    note: {
      label: "is a popular app for more than 2 years",
      title: "Spotify"
    },
    connector: {
      end: "none",        // Can be none, or arrow or dot
      type: "line",      
      lineType : "vertical"
    },
    color: ["white"],
    x: 150,
    y: 200,
    dy: -120,
    dx: 220
  }
]

// Add annotation to the chart
const makeageAnnotations = d3.annotation()
  .annotations(ageannotations)
d3.select("#subbarchart")
  .append("g")
  .call(makeageAnnotations)


// Function to filter the bar chart based on the selected subscription plan
function filterBarChart(selectedPlan) {

  // Remove the old bars
  barsvg.selectAll("rect").remove();
  barsvg.selectAll(".bar-label").remove();
  barsvg.selectAll(".axis").remove();

  if (selectedPlan === 'free') {
    selectedPlan = "Free (ad-supported)";
  } else if (selectedPlan === 'paid') {
    selectedPlan = "Premium (paid subscription)";
  }

  // Filter the data based on the selected plan
  const filteredData = usagePeriod.map((period) => {
    const count = rollupcounts.get(period).get(selectedPlan) || 0;
    const periodArray = {period, count}
    return (periodArray);
  });
  filteredData.sort((a, b) => b.count - a.count); 

  console.log(filteredData)

  // Define the scales for x and y axes
const xScale = d3.scaleBand()
.domain(filteredData.map(d=>d.period))
.range([margin.left, width - margin.right])
.padding(0.1);

const yScale = d3.scaleLinear()
.domain([0, d3.max(filteredData, d => d.count)])
.range([height - margin.bottom, margin.top]);


// Create x axis
barsvg.append("g")
.attr("class","axis")
.attr("transform", `translate(0,${height - margin.bottom})`)
.call(d3.axisBottom(xScale))
.selectAll("text")
.style("text-anchor", "end")
.attr("transform", "rotate(-45)")
.attr("fill","white");

// Create y axis
barsvg.append("g")
.attr("class","axis")
.attr("transform", `translate(${margin.left},0)`)
.call(d3.axisLeft(yScale))
.selectAll("text")
.attr("fill","white");


 if(selectedPlan == "Free (ad-supported)" ){
  // Create new bars based on the filtered data
  barsvg
    .selectAll("rect")
    .data(filteredData)
    .enter()
    .append("rect")
    .attr("x", (d) => xScale(d.period))
    .attr("y", (d) => yScale(d.count))
    .attr("width", xScale.bandwidth()-20)
    .attr("height", (d) => height - margin.bottom - yScale(d.count))
    .attr("fill", (d, i) => "#1ed760");
 }
 else {
  // Create new bars based on the filtered data
  barsvg
    .selectAll("rect")
    .data(filteredData)
    .enter()
    .append("rect")
    .attr("x", (d) => xScale(d.period))
    .attr("y", (d) => yScale(d.count))
    .attr("width", xScale.bandwidth()-20)
    .attr("height", (d) => height - margin.bottom - yScale(d.count))
    .attr("fill", (d, i) => "white");

 }

 // Add y-axis grid lines
 barsvg
 .append('g')
 .attr("transform", "translate(80,0)")
 .attr('class', 'grid')
 .call(d3.axisLeft(yScale)
 .tickSize(-420)
 .tickSizeOuter(0)
 .tickFormat(''));
 
 // Style the grid lines
 barsvg.selectAll('.grid line')
 .style('stroke', 'gray')
 .style('stroke-dasharray', '3 3')
 .style('opacity', '0.7');

    // Add labels on top of the bars
  barsvg
  .selectAll(".bar-label")
  .data(filteredData)
  .enter()
  .append("text")
  .attr("class", "bar-label")
  .attr("x", (d) => xScale(d.period) + xScale.bandwidth() / 2 - 10)
  .attr("y", (d) => yScale(d.count) - 5)
  .attr("text-anchor", "middle")
  .text((d) => d.count)
  .attr("fill", "white");
}
}).catch(function(error) {
  // Handle error if any
  console.log(error);
});