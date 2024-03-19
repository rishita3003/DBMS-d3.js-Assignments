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

  // Append the state mesh.
  svg.append("path")
      .datum(stateMesh)
      .attr("fill", "none")
      .attr("stroke", "#777")
      .attr("stroke-width", 0.5)
      .attr("stroke-linejoin", "round")
      .attr("d", d3.geoPath(projection));

  svg.append("g")
  .selectAll("circle")
  .data(walmarts)
  .join("circle")
    .attr("cx",d=>projection([d.longitude,d.latitude])[0])
    .attr("cy",d=>projection([d.longitude,d.latitude])[1])
    .attr("r",d=>{
      const age = (new Date()).getFullYear()-(new Date(d.date)).getFullYear();
       return age*0.12;
    })
    .attr("fill","lightpink")
    .attr("stroke","#000")
  .append("title")
  .text(d=>`(${(new Date()).getFullYear() - (new Date(d.date)).getFullYear()}  years old)`);

  return svg.node();
}

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