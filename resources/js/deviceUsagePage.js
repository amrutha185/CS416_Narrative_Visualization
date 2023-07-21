var width = 500; // Width of the SVG element
var height = 500; // Height of the SVG element
margin = { top: 20, right: 20, bottom: 150, left: 40 };
var counts = {
  totalusers: 0
};


 // Load the CSV data
d3.csv("resources/dataset/Spotify_data.csv").then(function(data) {

     //Split the listening devices columns- this will split original data into multiple rows.
    var listeningDevices = data.map(function(d) {
        return d.spotify_listening_device.split(',').map(function(device) {
          return device.trim();
        });
      });
    
    // Flatten the array of arrays
    var listeningDevicesArray = [].concat.apply([], listeningDevices);

    listeningDevicesArray.forEach(function(d) {
        counts.totalusers++;
    })
    
    // Count the occurrences of each value
    var deviceCountsMap = d3.rollup(
    listeningDevicesArray,
    v => v.length,
    device => device
    );


    // Convert the map to an array of objects
    var deviceCountsArray = Array.from(deviceCountsMap, ([device, count]) => ({
    device,
    count,
     }));

// Define a nested rollup function to calculate the counts by device and age group
var deviceCountsByAgeGroup = d3.rollups(
    data,
    v => {
// Count device types by age group
const countsByDevice = {};
data.forEach(entry => {
  const ageGroup = entry.Age;
  const devices = entry.spotify_listening_device.split(",").map(device => device.trim());
  devices.forEach(device => {
    if (!countsByDevice[device]) {
      countsByDevice[device] = {};
    }
    if (countsByDevice[device][ageGroup]) {
      countsByDevice[device][ageGroup]++;
    } else {
      countsByDevice[device][ageGroup] = 1;
    }
  });
})
//sort by counts in descending order.
deviceCountsArray.sort((a, b) => b.count - a.count);    


// Convert nested map to array of objects
const deviceCountsByAgeGroupArray = Object.entries(countsByDevice).map(([device, ageGroupCounts]) => ({
    device,
    ageGroupCounts: Object.entries(ageGroupCounts).map(([ageGroup, count]) => ({
      ageGroup,
      count
    }))
  }));

 //set the device with highest number of users as default value 
  var initialdevice = deviceCountsArray.map(function(d) { return d.device; })[0];

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Device Usage bar chart

// Create the SVG container
var svg = d3
  .select('#devicebarchart')
  //.append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// Define the x and y scales
var x = d3
  .scaleBand()
  .domain(deviceCountsArray.map(function(d) { return d.device; }))
  .range([0, width])
  .padding(0.1);

var y = d3
  .scaleLinear()
  .domain([0, d3.max(deviceCountsArray, function(d) { return d.count; })])
  .range([height, 0]);

// Create the bars
svg
  .selectAll('.bar')
  .data(deviceCountsArray)
  .enter()
  .append('rect')
  .attr('class', 'bar')
  .attr('x', function(d) { return x(d.device); })
  .attr('width', x.bandwidth()-40)
  .attr('y', function(d) { return y(d.count); })
  .attr('height', function(d) { return height - y(d.count); })
  .attr("fill","#1ed760")
  .on('click', function(e,d) {
    displayAgeBarChart(d.device);
  });
  ;  

// Create x axis
xAxisGroup = svg.append("g")
.attr("transform", 'translate(0,' + height + ')')
.attr("class","axiscolor")
.call(d3.axisBottom(x))
.selectAll("text")
.style("text-anchor", "end")
.attr("transform", "rotate(-45)")
.attr("fill","white");


// Add y-axis
yAxisGroup= svg.append('g').call(d3.axisLeft(y))
.selectAll("text")
.attr("class","axiscolor")
.attr("fill","white");

// Add x-axis label
svg.append("g")
.attr("transform", "translate(210,600)")
.append("text")
  .attr("class", "x label")
  .attr("text-anchor", "end")
  .text("Device")
  .attr("fill", "#1ed760")
  .style("font-weight", "bold");

  // Add y-axis label
svg.append("g")
.attr("transform", "translate(-10,200)")
.append("text")
.attr("class", "y label")
.attr("text-anchor", "end")
.attr("y", -margin.left + 10)
.attr("dy", ".75em")
.attr("transform", "rotate(-90)")
.text("No. of Users")
.attr("fill", "#1ed760")
.style("font-weight", "bold");


// Add y-axis grid lines
svg
  .append('g')
  .attr('class', 'grid')
  .call(d3.axisLeft(y)
  .tickSize(-width)
  .tickSizeOuter(0)
  .tickFormat(''));

// Style the grid lines
svg.selectAll('.grid line')
.style('stroke', 'gray')
.style('stroke-dasharray', '3 3')
.style('opacity', '0.7');



//Add tooltips to the chart

var devicediv = d3.select("body").append("div")   
    .attr("class", "tooltip")               
    .style("opacity", 0);
    

  // A function that change this tooltip when the user hover a bar.
 
  var showdeviceTooltip = function(event,d) {
    devicediv.transition()
    .duration(200)
    .style("opacity", 1);

    devicediv.html("Among " + counts.totalusers+" users there can be a user who uses more  than 1 electronic device")
    .style("left", (event.pageX)+20 + "px")
    .style("top", (event.pageY - 50) + "px");
  }
  var movedeviceTooltip = function(event,d) {
    //console.log("moveTooltip is triggered");
    devicediv
    .style("left", (event.PageX+20) + "px")
    .style("top", (event.pageY - 50) + "px")
  } 
  // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
  var hidedeviceTooltip = function(d) {
    //console.log("hideTooltip is triggered");
    devicediv
      .transition()
      .duration(100)
      .style("opacity", 0)
  }

  d3.select("#devicebarchart")
    .on("mouseover", function(event,d) {
      showdeviceTooltip(event,d)
      })
    .on("mousemove", movedeviceTooltip )
    .on("mouseleave", hidedeviceTooltip )

// Add labels on top of the bars
svg
.selectAll(".devbar-label")
.data(deviceCountsArray)
.enter()
.append("text")
.attr("class", "bar-label")
.attr("x", function(d) { return x(d.device)+45; })
.attr("y", function(d) { return y(d.count)-10; })
.attr("text-anchor", "middle")
.text((d) => d.count)
.attr("fill", "white");

//Add annotation to the chart

const annotations = [
  {
    note: {
      label: "is the most popularly used device to use the Spotify app ",
      title: "Smartphone"
    },
    connector: {
      end: "none",        // Can be none, or arrow or dot
      type: "line",      // ?? don't know what it does
      lineType : "vertical",    // ?? don't know what it does
      endScale: 3     // dot size
    },
    color: ["white"],
    x: 120,
    y: 70,
    dy: 70,
    dx: 70
  }
]

// Add annotation to the chart
const makeAnnotations = d3.annotation()
  .annotations(annotations)
d3.select("#devicebarchart")
  .append("g")
  .call(makeAnnotations)


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Begin Creating Bar chart

var selectedDeviceData = deviceCountsByAgeGroupArray.find(function(d) {
  return  d.device === initialdevice;
})

selectedDeviceData.ageGroupCounts.sort((a,b) => b.count - a.count);

// Create the age bar chart
var ageSvg = d3
.select('#agebarchart')
.attr('width', width + margin.left + margin.right)
.attr('height', height + margin.top + margin.bottom)
.append('g')
.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// Define the x and y scales
var x = d3
.scaleBand()
.domain(selectedDeviceData.ageGroupCounts.map(function(d) { return d.ageGroup; }))
.range([0, width])
.padding(0.1);

var y = d3
.scaleLinear()
.domain([0, d3.max(selectedDeviceData.ageGroupCounts, function(d) { return d.count; })])
.range([height, 0]);

// Create x axis
ageSvg.append("g")
.attr("transform", `translate(30,${height})`)
 .attr("class","axes")
.call(d3.axisBottom(x))
.selectAll("text")
.style("text-anchor", "end")
.attr("transform", "rotate(-45)")
.attr("fill","white");

// Create y axis
ageSvg.append("g")
.attr("transform", `translate(${margin.left},0)`)
.attr("class","axes")
.call(d3.axisLeft(y))
.selectAll("text")
.attr("fill","white");

// Create the bars
ageSvg
.selectAll('.bar')
.data(selectedDeviceData.ageGroupCounts)
.enter()
.append('rect')
.attr('class', 'bar')
.attr('x', function(d) { return x(d.ageGroup)+30; })
.attr('width', x.bandwidth()-40)
.attr('y', function(d) { return y(d.count); })
.attr('height', function(d) { return height  - y(d.count); })
.attr("fill","#1ed760");

// Add x-axis label
ageSvg.append("g")
.attr("transform", "translate(300,600)")
.append("text")
.attr("class", "x label")
.attr("text-anchor", "end")
.text("AgeGroup")
.attr("fill", "#1ed760")
.style("font-weight", "bold");

// Add y-axis label
ageSvg.append("g")
.attr("transform", "translate(0,200)")
.append("text")
.attr("class", "y label")
.attr("text-anchor", "end")
.attr("y", -margin.left + 10)
.attr("dy", ".75em")
.attr("transform", "rotate(-90)")
.text("No. of Users")
.attr("fill", "#1ed760")
.style("font-weight", "bold");

// Add y-axis grid lines
ageSvg
  .append('g')
  .attr('class', 'grid')
  .attr("transform", "translate(40,0)")
  .call(d3.axisLeft(y)
  .tickSize(-width - margin.left)
  .tickSizeOuter(0)
  .tickFormat(''));

// Style the grid lines
ageSvg.selectAll('.grid line')
.style('stroke', 'gray')
.style('stroke-dasharray', '3 3')
.style('opacity', '0.7');


// Add labels on top of the bars
ageSvg
.selectAll(".bar-label")
.data(selectedDeviceData.ageGroupCounts)
.enter()
.append("text")
.attr("class", "bar-label")
.attr("x", function(d) { return x(d.ageGroup)+ 60; })
.attr("y", function(d) { return y(d.count)-8; })
.attr("text-anchor", "middle")
.text(function(d) { return d.count;})
.attr("fill", "white"); 

//Add annotation to the chart

const ageannotations = [
  {
    note: {
      label: "is the target group that uses Spotify on all electronic devices",
      title: "Age group 20-35"
    },
    connector: {
      end: "none",        // Can be none, or arrow or dot
      type: "line",      // ?? don't know what it does
      lineType : "vertical",    // ?? don't know what it does
      endScale: 3     // dot size
    },
    color: ["white"],
    x: 150,
    y: 100,
    dy: 70,
    dx: 70
  }
]

//Add tooltips to the chart

var agediv = d3.select("body").append("div")   
    .attr("class", "tooltip")               
    .style("opacity", 0);
    

  // A function that change this tooltip when the user hover a bar.
 
  var showageTooltip = function(event,d) {
    agediv.transition()
    .duration(200)
    .style("opacity", 1);
    agediv.html("6-12 age group users are also using Spotify but not on Smartphones")
    .style("left", (event.pageX)+20 + "px")
    .style("top", (event.pageY - 50) + "px");
  }
  var moveageTooltip = function(event,d) {
    //console.log("moveTooltip is triggered");
    agediv
    .style("left", (event.PageX+20) + "px")
    .style("top", (event.pageY - 50) + "px")
  } 
  // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
  var hideageTooltip = function(d) {
    //console.log("hideTooltip is triggered");
    agediv
      .transition()
      .duration(100)
      .style("opacity", 0)
  }

  d3.select("#agebarchart")
    .on("mouseover", function(event,d) {
      showageTooltip(event,d)
      })
    .on("mousemove", moveageTooltip )
    .on("mouseleave", hideageTooltip )

// Add annotation to the chart
const makeageAnnotations = d3.annotation()
  .annotations(ageannotations)
d3.select("#agebarchart")
  .append("g")
  .call(makeageAnnotations)

function displayAgeBarChart(device) {
  // Clear the previous bars, labels and grids
  d3.select("#agebarchart").selectAll(".bar").remove();
  d3.select("#agebarchart").selectAll(".bar-label").remove();
  d3.select("#agebarchart").selectAll(".axes").remove();
  d3.select("#agebarchart").selectAll(".grid").remove();
  // Filter the data for the selected device
  var selectedDeviceData = deviceCountsByAgeGroupArray.find(function(d) {
      return  d.device === device;
  })


//sort by counts
  selectedDeviceData.ageGroupCounts.sort((a,b) => b.count - a.count);

// Create the age bar chart
var ageSvg = d3
.select('#agebarchart')
.attr('width', width + margin.left + margin.right)
.attr('height', height + margin.top + margin.bottom)
.append('g')
.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// Define the x and y scales
var x = d3
.scaleBand()
.domain(selectedDeviceData.ageGroupCounts.map(function(d) { return d.ageGroup; }))
.range([0, width])
.padding(0.1);

var y = d3
.scaleLinear()
.domain([0, d3.max(selectedDeviceData.ageGroupCounts, function(d) { return d.count; })])
.range([height, 0]);

// Create x axis
ageSvg.append("g")
.attr("transform", `translate(30,${height})`)
 .attr("class","axes")
.call(d3.axisBottom(x))
.selectAll("text")
.style("text-anchor", "end")
.attr("transform", "rotate(-45)")
.attr("fill","white");

// Create y axis
ageSvg.append("g")
.attr("transform", `translate(${margin.left},0)`)
.attr("class","axes")
.call(d3.axisLeft(y))
.selectAll("text")
.attr("fill","white");

// Create the bars
ageSvg
.selectAll('.bar')
.data(selectedDeviceData.ageGroupCounts)
.enter()
.append('rect')
.attr('class', 'bar')
.attr('x', function(d) { return x(d.ageGroup)+30; })
.attr('width', x.bandwidth()-40)
.attr('y', function(d) { return y(d.count); })
.attr('height', function(d) { return height  - y(d.count); })
.attr("fill","#1ed760");

// Add y-axis grid lines
ageSvg
  .append('g')
  .attr('class', 'grid')
  .attr("transform", "translate(40,0)")
  .call(d3.axisLeft(y)
  .tickSize(-width - margin.left)
  .tickSizeOuter(0)
  .tickFormat(''));

// Style the grid lines
ageSvg.selectAll('.grid line')
.style('stroke', 'gray')
.style('stroke-dasharray', '3 3')
.style('opacity', '0.7');

// Add labels on top of the bars
ageSvg
.selectAll(".bar-label")
.data(selectedDeviceData.ageGroupCounts)
.enter()
.append("text")
.attr("class", "bar-label")
.attr("x", function(d) { return x(d.ageGroup)+ 60; })
.attr("y", function(d) { return y(d.count)-8; })
.attr("text-anchor", "middle")
.text(function(d) { return d.count;})
.attr("fill", "white"); 

}
 });

   }).catch(function(error) {
    // Handle error if any
    console.log(error);
    }); 
    