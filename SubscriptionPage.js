var w = 500; // Width of the SVG element
var h = 500; // Height of the SVG element
//var enablePolylines = true;
// Define the initial plan
var initialPlan = "Premium (paid subscription)";
var width = 500; // Width of the SVG element
var height = 500; // Height of the SVG element
margin = { top: 20, right: 20, bottom: 60, left: 80 };

// Load the CSV data
d3.csv("Spotify_data.csv").then(function(data) {

  var counts = {
    free: 0,
    paid: 0
  };

    // Calculate counts by age group and subscription
    const rollupcounts = d3.rollup(
        data,
        (v) => v.length,
        (d) => d.Age,
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

  // Create an array of age groups
  const ageGroups = Array.from(rollupcounts.keys());


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

  var arc = d3.arc()
    .innerRadius(80)
    .outerRadius(radius);

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
      //console.log(d.data);
    });  

	var pos = d3.arc().innerRadius(radius / 2).outerRadius(radius);
	arcs
    .append("text")
    .attr("transform", function(d) { return "translate(" + pos.centroid(d) + ")"; }) 
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .attr("fill","white")
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
    });

    labels.each(function(d) {
      var centroid = arc.centroid(d);
      var angle = Math.atan2(centroid[1], centroid[0]);
      var x1 = Math.cos(angle) * (radius - 30); // Adjust the starting x-position of the polyline
      var y1 = Math.sin(angle) * (radius -30); // Adjust the starting y-position of the polyline
      var x2 = Math.cos(angle) * (radius + 40); // Adjust the ending x-position of the polyline
      var y2 = Math.sin(angle) * (radius + 30); // Adjust the ending y-position of the polyline

      var points = [
        [x1, y1],
        [x2, y2]
      ];

      var line = d3.line();

      d3.select(this)
        .append("polyline")
        .attr("class", "annotation-line")
        .attr("points", points.map(function(point) {
          return point.join(",");
        }))
        .attr("fill", "none")
        .attr("stroke", "#333")
        .attr("stroke-width", 1.5);
    });

//End of Pie chart creation

//Begin Creating Bar chart

// Create an SVG element
const barsvg = d3.select("#subbarchart")
.append("svg")
.attr("width", width)
.attr("height", height + 30);

// Define the scales for x and y axes
const xScale = d3.scaleBand()
    .domain(ageGroups)
    .range([margin.left, width - margin.right])
    .padding(0.1);

const yScale = d3.scaleLinear()
    .domain([0, d3.max(Array.from(rollupcounts.values()).flatMap((d) => Array.from(d.values())))])
    .range([height - margin.bottom, margin.top]);


// Create x axis
barsvg.append("g")
.attr("transform", `translate(0,${height - margin.bottom})`)
.call(d3.axisBottom(xScale))
.selectAll("text")
.style("text-anchor", "end")
.attr("transform", "rotate(-45)")
.attr("fill","white")
//.style("stroke", "white");;

// Create y axis
barsvg.append("g")
.attr("transform", `translate(${margin.left},0)`)
.call(d3.axisLeft(yScale))
.selectAll("text")
.attr("fill","white")
//.style("stroke", "white");;



// Filter the data based on the selected plan
const initialPlanData = ageGroups.map((ageGroup) => {
  const count = rollupcounts.get(ageGroup).get(initialPlan) || 0;
  return ( [ageGroup, count]);
});

// Create bars
barsvg
    .selectAll("rect")
    .data(initialPlanData)
    .enter()
    .append("rect")
    .attr("x", (d) => xScale(d[0]))
    .attr("y", (d) => yScale(d[1]))
    .attr("width", xScale.bandwidth())
    .attr("height", (d) => height - margin.bottom - yScale(d[1]))
    .attr("fill",  "white");

  // Add labels on top of the bars
  barsvg
  .selectAll(".bar-label")
  .data(initialPlanData)
  .enter()
  .append("text")
  .attr("class", "bar-label")
  .attr("x", (d) => xScale(d[0]) + xScale.bandwidth() / 2)
  .attr("y", (d) => yScale(d[1]) - 5)
  .attr("text-anchor", "middle")
  .text((d) => d[1])
  .attr("fill", "white");   


// Function to filter the bar chart based on the selected subscription plan
function filterBarChart(selectedPlan) {
  if (selectedPlan === 'free') {
    selectedPlan = "Free (ad-supported)";
  } else if (selectedPlan === 'paid') {
    selectedPlan = "Premium (paid subscription)";
  }

  // Filter the data based on the selected plan
  const filteredData = ageGroups.map((ageGroup) => {
    const count = rollupcounts.get(ageGroup).get(selectedPlan) || 0;
    return ( [ageGroup, count]);
  });

  // Remove the old bars
  barsvg.selectAll("rect").remove();
  barsvg.selectAll(".bar-label").remove();

 if(selectedPlan == "Free (ad-supported)" ){
  // Create new bars based on the filtered data
  barsvg
    .selectAll("rect")
    .data(filteredData)
    .enter()
    .append("rect")
    .attr("x", (d) => xScale(d[0]))
    .attr("y", (d) => yScale(d[1]))
    .attr("width", xScale.bandwidth())
    .attr("height", (d) => height - margin.bottom - yScale(d[1]))
    .attr("fill", (d, i) => "#1ed760");
 }
 else {
  // Create new bars based on the filtered data
  barsvg
    .selectAll("rect")
    .data(filteredData)
    .enter()
    .append("rect")
    .attr("x", (d) => xScale(d[0]))
    .attr("y", (d) => yScale(d[1]))
    .attr("width", xScale.bandwidth())
    .attr("height", (d) => height - margin.bottom - yScale(d[1]))
    .attr("fill", (d, i) => "white");

 }

    // Add labels on top of the bars
  barsvg
  .selectAll(".bar-label")
  .data(filteredData)
  .enter()
  .append("text")
  .attr("class", "bar-label")
  .attr("x", (d) => xScale(d[0]) + xScale.bandwidth() / 2)
  .attr("y", (d) => yScale(d[1]) - 5)
  .attr("text-anchor", "middle")
  .text((d) => d[1])
  .attr("fill", "white");
}
}).catch(function(error) {
  // Handle error if any
  console.log(error);
});