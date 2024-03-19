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

//mapped data in a pre defined time scale
const filteredData = mapped
  .filter(d => d.longitude != null && d.latitude != null) // Check for non-null coordinates
  .filter(d=>d.cases> 0 && d.deaths/d.cases>0) // Exclude entries without cases or deaths
  .map(d => ({
    ...d,
    projectedCoord: projection([d.longitude, d.latitude]) // Project the coordinates
  }))
  .filter(d => d.projectedCoord != null); // Exclude entries that can't be projected

  

  const deathRatio=filteredData.map(d=>({
    ...d,
    deathRate: (d.deaths/d.cases)*100 //percentage
  }));

  const radiusScale=d3.scaleSqrt().domain(d3.extent(deathRatio,d=>d.deathRate)).range([0,8]);
  

  // Create the color and radius scales.
  /*const radius = d3.scaleSqrt([0, d3.max(bins, d => d.length)], [0, hexbin.radius() * Math.SQRT2]);*/

  // Append the color legend.
  /*svg.append("g")
      .attr("transform", "translate(580,20)")
      .append(() => legend({
        color, 
        title: "Median opening year", 
        width: 260, 
        tickValues: d3.utcYear.every(5).range(...color.domain()),
        tickFormat: d3.utcFormat("%Y")
      }));*/

  // Append the state mesh.
  // for the state borders
  svg.append("path")
      .datum(stateMesh)
      .attr("fill", "none")
      .attr("stroke", "#777")
      .attr("stroke-width", 0.5)
      .attr("stroke-linejoin", "round")
      .attr("d", d3.geoPath(projection));

  // Create and append the circles to the SVG
svg.selectAll("circle")
  .data(deathRatio)
  .join("circle")
    .attr("cx", d => projection([d.longitude, d.latitude])[0])
    .attr("cy", d => projection([d.longitude, d.latitude])[1])
    .attr("r", d => radiusScale(d.deathRate)) // Size circles based on death rate
    .attr("fill", "red") // Choose your color
    .attr("opacity", 0.6) // Optional: make the circles semi-transparent
    .attr("stroke","black")
    .append("title")
    .text(d => `${d.region}: ${d.deaths} deaths, ${d.cases} cases, Death rate: ${d.deathRate.toFixed(2)}%`);

    const legendMargin = { right:20, top: 150 };

  const legend = svg.append("g")
  .attr("transform", `translate(${width - legendMargin.right}, ${height - legendMargin.top})`);
const exampleDeathRates = [d3.min(deathRatio, d => d.deathRate), 
                           d3.mean(deathRatio, d => d.deathRate), 
                           d3.max(deathRatio, d => d.deathRate)];

// Create a group for the size legend
const sizeLegend = svg.append("g")
  .attr("transform", "translate(680, 60)");  // Adjust position to fit your chart

// Add legend title for size
sizeLegend.append("text")
  .attr("class", "legend-size-title")
  .attr("x", 0)
  .attr("y", -20)
  .style("text-anchor", "left")
  .text("Death Rate Circle Size");

// Append circles for each example size
exampleDeathRates.forEach((rate, i) => {
  const yPosition = i * 40;  // Adjust vertical spacing to fit your chart

  sizeLegend.append("circle")
    .attr("cx", 0)
    .attr("cy", yPosition)
    .attr("r", radiusScale(rate))
    .attr("fill", "red")
    .attr("stroke", "black");

  sizeLegend.append("text")
    .attr("x", 20 + radiusScale(rate))
    .attr("y", yPosition)
    .style("alignment-baseline", "middle")
    .text(`${rate.toFixed(2)}%`);
});
  

  return svg.node();
}
mapped={
    const start = new Date('2021-01-01');
    const end = new Date('2021-03-05');
    
    // Assuming 'covid' is an array of COVID data objects
    // and 'countyy' is an array of county data objects with 'lat' and 'long' properties.
    const countymap = new Map(countyy.map(d => [d.fips, d]));
    
    // Filter COVID data by date
    const covidFiltered = covid.filter(d => {
      const date = new Date(d.date);
      return date >= start && date <= end;
    });
    
    // Enrich the filtered COVID data with latitude and longitude from county data
    const covidData = covidFiltered.map(d => {
      const countyData = countymap.get(d.fips);
      if (countyData) {
        return {
          ...d,
          latitude: countyData.lat,
          longitude: countyData.long,
        };
      }
      return d;
    });
      return covidData;
    }

    covid= {
    const parseDate=d3.utcParse("%Y-%m-%d");
    return d3.csv("https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv")
    .then(data=>data.map(d=>({
        county:d.county,
        state:d.state,
        cases:d.cases,
        fips:d.fips,
        deaths:d.deaths,
        date:parseDate(d.date)
    })));
    }

    countyy={
    return d3.csv("https://gist.githubusercontent.com/russellsamora/12be4f9f574e92413ea3f92ce1bc58e6/raw/3f18230058afd7431a5d394dab7eeb0aafd29d81/us_county_latlng.csv")
    .then(data=>data.map(d=>({
        county:d.name,
        fips:d.fips_code,
        long:d.lng,
        lat:d.lat
    })))
    }

    stateMesh = FileAttachment("us-counties-10m.json").json().then(us => topojson.mesh(us, us.objects.states))
    d3 = require("d3@7", "d3-hexbin@0.2")
    import {legend} from "@d3/color-legend"