var width = 500; // Width of the SVG element
var height = 500; // Height of the SVG element
margin = { top: 20, right: 20, bottom: 100, left: 40 };

 // Load the CSV data
d3.csv("resources/dataset/Spotify_data.csv").then(function(data) {

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

//Add tooltips to the chart

var musicdiv = d3.select("body").append("div")   
    .attr("class", "tooltip")               
    .style("opacity", 0);


  // A function that change this tooltip when the user hover a bar.
 
  var showmusicTooltip = function(event,d) {
    musicdiv.transition()
    .duration(200)
    .style("opacity", 1);

    musicdiv.html(counts.music+" users use Spotify to listen music")
    .style("left", (event.pageX)+20 + "px")
    .style("top", (event.pageY - 50) + "px");
  }
  var movemusicTooltip = function(event,d) {
    //console.log("moveTooltip is triggered");
    musicdiv
    .style("left", (event.PageX+20) + "px")
    .style("top", (event.pageY - 50) + "px")
  } 
  // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
  var hidemusicTooltip = function(d) {
    //console.log("hideTooltip is triggered");
    musicdiv
      .transition()
      .duration(100)
      .style("opacity", 0)
  }
  


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

d3.select("#musicbarchart")
.on("mouseover", function(event,d) {
  showmusicTooltip(event,d)
  })
.on("mousemove", movemusicTooltip )
.on("mouseleave", hidemusicTooltip )


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
//Add annotation to the chart

const musicannotations = [
  {
    note: {
      label: "is the most popular Music genre on Spotify.",
      title: "Melody"
    },
    connector: {
      end: "none",        // Can be none, or arrow or dot
      type: "line",      
      lineType : "vertical",    
      endScale: 3     // dot size
    },
    color: ["white"],
    x: 90,
    y: 100,
    dy: 70,
    dx: 70
  }
]

// Add annotation to the chart
const makemusicAnnotations = d3.annotation()
  .annotations(musicannotations)
d3.select("#musicbarchart")
  .append("g")
  .call(makemusicAnnotations)

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


    //Add tooltips to the chart

var podcastdiv = d3.select("body").append("div")   
.attr("class", "tooltip")               
.style("opacity", 0);


// A function that change this tooltip when the user hover a bar.

var showpodcastTooltip = function(event,d) {
  podcastdiv.transition()
.duration(200)
.style("opacity", 1);

podcastdiv.html(counts.podcast+" users use Spotify to listen podcasts")
.style("left", (event.pageX)+20 + "px")
.style("top", (event.pageY - 50) + "px");
}
var movepodcastTooltip = function(event,d) {
//console.log("moveTooltip is triggered");
podcastdiv
.style("left", (event.PageX+20) + "px")
.style("top", (event.pageY - 50) + "px")
} 
// A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
var hidepodcastTooltip = function(d) {
//console.log("hideTooltip is triggered");
podcastdiv
  .transition()
  .duration(100)
  .style("opacity", 0)
}

    
    // Create the bars
    svg
    .selectAll('.bar')
    .data(PodcastGenreArray)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', function(d) { return x(d.genre); })
    .attr('width', x.bandwidth()-40)
    .attr('y', function(d) { return y(d.count); })
    .attr('height', function(d) { return height - y(d.count); })
    .attr("fill","#1ed760")

    d3.select("#podcastbarchart")
.on("mouseover", function(event,d) {
  showpodcastTooltip(event,d)
  })
.on("mousemove", movepodcastTooltip )
.on("mouseleave", hidepodcastTooltip )

    

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
    
    // Add labels on top of the bars
    svg
    .selectAll(".devbar-label")
    .data(PodcastGenreArray)
    .enter()
    .append("text")
    .attr("class", "bar-label")
    .attr("x", function(d) { return x(d.genre)+20; })
    .attr("y", function(d) { return y(d.count)-10; })
    .attr("text-anchor", "middle")
    .text((d) => d.count)
    .attr("fill", "white");
  
  //Add annotation to the chart

const podcastannotations = [
  {
    note: {
      label: "is the most popular podcast format on Spotify.",
      title: "Story telling"
    },
    connector: {
      end: "none",        // Can be none, or arrow or dot
      type: "line",      
      lineType : "vertical",    
      endScale: 3     // dot size
    },
    color: ["white"],
    x: 120,
    y: 100,
    dy: 100,
    dx: 200
  }
]

// Add annotation to the chart
const makepodcastAnnotations = d3.annotation()
  .annotations(podcastannotations)
d3.select("#podcastbarchart")
  .append("g")
  .call(makepodcastAnnotations)
 

}).catch(function(error) {
    // Handle error if any
    console.log(error);
    }); 
    