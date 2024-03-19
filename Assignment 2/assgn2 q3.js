walmarts = {
  const parseDate = d3.utcParse("%m/%d/%Y");
  return FileAttachment("walmart.tsv").tsv()
    .then(data => data.map((d) => ({
      longitude: +d[0],
      latitude: +d[1],
      date: parseDate(d.date)
    })));
}
stateMesh = FileAttachment("us-counties-10m.json").json().then(us => topojson.mesh(us, us.objects.states))
d3 = require("d3@7", "d3-hexbin@0.2")
import {legend} from "@d3/color-legend"

chart = {
  // Specify the map’s dimensions and projection.
  const width = 928;
  const height = 581;
  const projection = d3.geoAlbersUsa().scale(4 / 3 * width).translate([width / 2, height / 2]);

  // Create the container SVG.
  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height])
      .attr("width", width)
      .attr("height", height)
      .attr("style", "max-width: 100%; height: auto;");

  // Create the bins.
  const hexbin = d3.hexbin()
      .extent([[0, 0], [width, height]])
      .radius(10)
      .x(d => d.xy[0])
      .y(d => d.xy[1]);
  
  const bins = hexbin(walmarts.map(d => ({
    xy: projection([d.longitude, d.latitude]),
    date: new Date(d.date) // Convert the date string to a Date object
  })))
  .map(d => {
    // Calculate the median age for the bin
    const meanAge = d3.mean(d, d => (new Date()).getFullYear() - d.date.getFullYear());
    const influencedAge = meanAge*d.length; //total age
    return { length:d.length,x:d.x,y:d.y, meanAge:meanAge,influencedAge: influencedAge }; 
  })
  .sort((a, b) => b.influencedAge - a.influencedAge);

   // Create the color scale.
  const color = d3.scaleSequential(d3.extent(bins, d => d.length), d3.interpolateSpectral);
  
  // Define the radius scale
  const radius = d3.scaleSqrt()
      .domain( d3.extent(bins, d => d.influencedAge))
      .range([0, hexbin.radius() * Math.SQRT2]);


  svg.append("g")
      .attr("transform", "translate(580,20)")
      .append(()=>legend({
        color,
        title: "Number of Stores",
        width: 260
        // Define appropriate tick values and format for the legend
      }));
  // Append the state mesh.
  svg.append("path")
      .datum(stateMesh)
      .attr("fill", "none")
      .attr("stroke", "#777")
      .attr("stroke-width", 0.5)
      .attr("stroke-linejoin", "round")
      .attr("d", d3.geoPath(projection));

  // Append the hexagons (circles in this case).
  svg.append("g")
      .selectAll("circle")
      .data(bins)
      .join("circle")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r", d => radius(d.influencedAge))
      .attr("fill", d => color(d.length))
      .attr("stroke", d => d3.lab(color(d.length)).darker())
      .append("title")
      .text(d => `${d.influencedAge.toFixed(2)} years mean age\n${d.length} stores`);

  // Append the color legend (assuming legend is a properly defined function).

  return svg.node();
}




