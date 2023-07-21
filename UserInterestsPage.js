var width = 500; // Width of the SVG element
var height = 500; // Height of the SVG element
margin = { top: 20, right: 20, bottom: 150, left: 40 };

 // Load the CSV data
d3.csv("Spotify_data.csv").then(function(data) {

var counts = {
    music: 0,
    podcast: 0
  };

  data.forEach(function(d) {
    if (d.preferred_listening_content === "Music") {
      counts.music++;
    } else if (d.preferred_listening_content === "Podcast") {
      counts.podcast++;
    }
  });
 

  // Calculate counts by MusicGenre
  const MusicGenreCounts = d3.rollup(
    data.filter((d) => d.preferred_listening_content === "Music"),
    (v) => v.length,
    (d) => d.fav_music_genre
  );

  // Calculate counts by MusicGenre
  const PodcastGenreCounts = d3.rollup(
    data.filter((d) => d.preferred_listening_content === "Podcast" && d.preffered_pod_format != 'None'),
    (v) => v.length,
    (d) => d.preffered_pod_format
  );

  MusicGenreArray = Array.from(MusicGenreCounts, ([genre, count]) => ({ genre, count }))
  PodcastGenreArray = Array.from(PodcastGenreCounts, ([genre, count]) => ({ genre, count }))

  // Sort both arrays in descending order based on count
  MusicGenreArray.sort((a, b) => b.count - a.count); 
  PodcastGenreArray.sort((a, b) => b.count - a.count); 

  ////////////////////////////////////////////////////////////////////////////////////////////////////////

// Create the Music SVG container
var svg = d3
.select('#musicbarchart')
//.append('svg')
.attr('width', width + margin.left + margin.right)
.attr('height', height + margin.top + margin.bottom)
.append('g')
.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// Define the x and y scales
var x = d3
.scaleBand()
.domain(MusicGenreArray.map(function(d) {  return d.genre; }))
.range([0, width])
.padding(0.1);

var y = d3
.scaleLinear()
.domain([0, d3.max(MusicGenreArray, function(d) { return d.count; })])
.range([height, 0]);

// Create the bars
svg
.selectAll('.bar')
.data(MusicGenreArray)
.enter()
.append('rect')
.attr('class', 'bar')
.attr('x', function(d) { return x(d.genre); })
.attr('width', x.bandwidth())
.attr('y', function(d) { return y(d.count); })
.attr('height', function(d) { return height - y(d.count); })
.attr("fill","#1ed760")
.on('mouseover', function(d, event) {
    // Store mouse coordinates
    var mouseX = event.pageX || event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    var mouseY = event.pageY || event.clientY + document.body.scrollTop + document.documentElement.scrollTop;

    // Show tooltip on mouseover
    tooltip.transition().duration(200).style('opacity', 0.9);
    tooltip
      .html('Total Count: ' + d.count)
      .style('left', mouseX + 'px')
      .style('top', mouseY - 28 + 'px');
  })
  .on('mouseout', function(d) {
    // Hide tooltip on mouseout
    tooltip.transition().duration(500).style('opacity', 0);
  });

// Create a tooltip element
var tooltip = d3
  .select('body')
  .append('div')
  .attr('class', 'tooltip')
  .style('opacity', 0);

// Create x axis
svg.append("g")
.attr("transform", 'translate(0,' + height + ')')
.call(d3.axisBottom(x))
.selectAll("text")
.style("text-anchor", "end")
.attr("transform", "rotate(-45)")
.attr("fill", "white");


// Add y-axis
svg.append('g').call(d3.axisLeft(y))
.selectAll("text")
.attr("fill", "white");

// Add x-axis label
svg.append("g")
.attr("transform", "translate(250,600)")
.append("text")
  .attr("class", "x label")
  .attr("text-anchor", "end")
  .text("Genre")
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

var highestBar = MusicGenreArray[0]; // Assuming the first bar has the highest count

// Add swoopydrag annotation to musicbarchart
var swoopyAnnotation = d3.annotation()
  .type(d3.annotationLabel)
  .accessors({
    x: function(d) { return x(d.genre) + x.bandwidth() / 2; },
    y: function(d) { return y(d.count); }
  })
  .annotations([
    {
      note: {
        
        label: "Melody music is the most popular genre on Spotify."
      },
      connector: {
        end: "arrow" // Add an arrow at the end of the connector line
      },
      x: 50,
      y: 100,
      dx: 100, // Adjust the x-offset of the annotation
      dy: 100, // Adjust the y-offset of the annotation
      color: "white", // Set the color of the annotation and line
      subject: {
        radius: 4 // Adjust the radius of the subject circle
      },
      connector: {
        end: "dot", // Use a dot at the end of the connector line
        type: "line", // Use a straight line for the connector
        lineType: "horizontal" // Align the line horizontally
      }
    }
  ]);

svg.append("g")
  .attr("class", "annotation-group")
  .call(swoopyAnnotation);

// Add labels on top of the bars
svg
.selectAll(".devbar-label")
.data(MusicGenreArray)
.enter()
.append("text")
.attr("class", "bar-label")
.attr("x", function(d) { return x(d.genre)+20; })
.attr("y", function(d) { return y(d.count)-10; })
.attr("text-anchor", "middle")
.text((d) => d.count)
.attr("fill", "white");

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Create the Podcast SVG container
    var svg = d3
    .select('#podcastbarchart')
    //.append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    
    // Define the x and y scales
    var x = d3
    .scaleBand()
    .domain(PodcastGenreArray.map(function(d) {  return d.genre; }))
    .range([0, width])
    .padding(0.1);
    
    var y = d3
    .scaleLinear()
    .domain([0, d3.max(PodcastGenreArray, function(d) { return d.count; })])
    .range([height, 0]);
    
    // Create the bars
    svg
    .selectAll('.bar')
    .data(PodcastGenreArray)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', function(d) { return x(d.genre); })
    .attr('width', x.bandwidth())
    .attr('y', function(d) { return y(d.count); })
    .attr('height', function(d) { return height - y(d.count); })
    .attr("fill","#1ed760")
    
    // Create x axis
    svg.append("g")
    .attr("transform", 'translate(0,' + height + ')')
    .call(d3.axisBottom(x))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("transform", "rotate(-45)")
    .attr("fill", "white");
    
    
    // Add y-axis
    svg.append('g').call(d3.axisLeft(y))
    .selectAll("text")
    .attr("fill", "white");

    // Add x-axis label
svg.append("g")
.attr("transform", "translate(250,600)")
.append("text")
  .attr("class", "x label")
  .attr("text-anchor", "end")
  .text("Podcast Format")
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

    var podcasthighestBar = PodcastGenreArray[0]; // Assuming the first bar has the highest count

// Add swoopydrag annotation to musicbarchart

console.log(highestBar);
var swoopyAnnotation = d3.annotation()
  .type(d3.annotationLabel)
  .accessors({
    x: function(d) { return x(d.genre) + x.bandwidth() / 2; },
    y: function(d) { return y(d.count); }
  })
  .annotations([
    {
      note: {
        
        label: "Melody music is the most popular genre on Spotify."
      },
      connector: {
        end: "arrow" // Add an arrow at the end of the connector line
      },
      x: 80,
      y: 100,
      dx: 250, // Adjust the x-offset of the annotation
      dy: -30, // Adjust the y-offset of the annotation
      color: "white", // Set the color of the annotation and line
      subject: {
        radius: 4 // Adjust the radius of the subject circle
      },
      connector: {
        end: "dot", // Use a dot at the end of the connector line
        type: "line" // Use a curved line for the connector
      }
    }
  ]);

svg.append("g")
  .attr("class", "annotation-group")
  .call(swoopyAnnotation);
    
    // Add labels on top of the bars
    svg
    .selectAll(".devbar-label")
    .data(podcasthighestBar)
    .enter()
    .append("text")
    .attr("class", "bar-label")
    .attr("x", function(d) { return x(d.genre)+20; })
    .attr("y", function(d) { return y(d.count)-10; })
    .attr("text-anchor", "middle")
    .text((d) => d.count)
    .attr("fill", "white");







}).catch(function(error) {
    // Handle error if any
    console.log(error);
    }); 
    