var width = 600; // Width of the SVG element
var height = 500; // Height of the SVG element
margin = { top: 20, right: 20, bottom: 150, left: 40 };

 // Load the CSV data
d3.csv("Spotify_data.csv").then(function(data) {

     //Split the listening devices columns- this will split original data into multiple rows.
    var listeningDevices = data.map(function(d) {
        return d.spotify_listening_device.split(',').map(function(device) {
          return device.trim();
        });
      });
    
    // Flatten the array of arrays
    var listeningDevicesArray = [].concat.apply([], listeningDevices);
    
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

deviceCountsArray.sort((a, b) => b.count - a.count); 
    

// Convert nested map to array of objects
const deviceCountsByAgeGroupArray = Object.entries(countsByDevice).map(([device, ageGroupCounts]) => ({
    device,
    ageGroupCounts: Object.entries(ageGroupCounts).map(([ageGroup, count]) => ({
      ageGroup,
      count
    }))
  }));
  //console.log(deviceCountsByAgeGroupArray);



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
  .on('mouseover',function(e,d){
     // Calculate the tooltip position
    // var xPosition = parseFloat(d3.select(this).attr('x')) + x.bandwidth() / 2;
     //var yPosition = parseFloat(d3.select(this).attr('y')) - 10;
     var xPosition = e.clientX + margin.left + 10;
  var yPosition = e.clientY + margin.top + 10;
   
     // Get the device and count information
     var vardevice = d.device;
     var varcount = d.count;

     //console.log(vardevice);
   
     // Find the ageGroupData for the current device
     var ageGroupData = deviceCountsByAgeGroupArray.find(function(item) {
        //console.log(item);
        return item.device === vardevice
      });
 
    
   
     if (ageGroupData) {
       var ageGroupCounts = ageGroupData.ageGroupCounts;
   
       // Create the tooltip rectangle
       svg.append('rect')
      .attr('class', 'tooltip')
      .attr('x', xPosition)
      .attr('y', yPosition)
      .attr('width', 200)
      .attr('height', 40 + ageGroupCounts.length * 30) // Adjust the height based on the number of age groups
      .attr('fill', '#fff')
      .attr('stroke', '#000')
      .attr('stroke-width', 1);
   
       // Add text to the tooltip
        svg.append('text')
        .attr('class', 'tooltip-text')
        .attr('x', xPosition)
        .attr('y', yPosition)
        .attr('text-anchor', 'middle')
        .attr('fill', '#000')
        .text('Device: ' + vardevice);
   
        svg.selectAll('.ageGroup-text')
        .data(ageGroupCounts)
        .enter()
        .append('text')
        .attr('class', 'tooltip-text ageGroup-text')
        .attr('x', xPosition)
        .attr('y', function(d, i) { return yPosition + (i * 50); })
        .attr('text-anchor', 'middle')
        .attr('fill', '#000')
        .text(function(d) { return d.ageGroup + ': ' + d.count; });
 
        
     }

  }) // Call showTooltip on mouseover
  .on('mouseout', function(e,d){    
    d3.selectAll('.tooltip').style('opacity', 0);
    d3.selectAll('.tooltip-text').style('opacity', 0);
    }); // Call hideTooltip on mouseout;


// Create x axis
svg.append("g")
.attr("transform", 'translate(0,' + height + ')')
.call(d3.axisBottom(x))
.selectAll("text")
.style("text-anchor", "end")
.attr("transform", "rotate(-45)")
.attr("fill","white");


// Add y-axis
svg.append('g').call(d3.axisLeft(y))
.selectAll("text")
.attr("fill","white");

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


});

   }).catch(function(error) {
    // Handle error if any
    console.log(error);
    }); 
    