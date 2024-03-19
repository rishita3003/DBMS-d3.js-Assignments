chart = {
  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, 960, 600]);

  svg.append("path")
      .datum(topojson.merge(us, us.objects.lower48.geometries))
      .attr("fill", "#ddd")
      .attr("d", d3.geoPath());

  svg.append("path")
      .datum(topojson.mesh(us, us.objects.lower48, (a, b) => a !== b))
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-linejoin", "round")
      .attr("d", d3.geoPath());

  const g = svg.append("g")
      .attr("fill", "none")
      .attr("stroke", "black");

  const dot = g.selectAll("circle")
    .data(processedData)
     .join("circle")
      .attr("transform", d => `translate(${projection([d.longitude, d.latitude])})`)
      .attr("r", d=>Math.pow(d.cases,1/4))
      .attr("fill", "pink");
    


    let previousDate = 2000;

  return Object.assign(svg.node(), {
    update(date) {
      dot // enter
        .filter(d => d.year > previousDate && d.year <= date)
        .transition().attr("r", d=>Math.pow(d.cases,1/4));
      dot // exit
        .filter(d => d.year <= previousDate && d.year > date)
        .transition().attr("r", 0);
      previousDate = date;
    }
  });
}
aggregatedData = processedData.reduce((acc, {diseases}) => {
  Object.entries(diseases).forEach(([disease, cases]) => {
    if (!acc[disease]) {
      acc[disease] = 0; // Initialize if not present
    }
    acc[disease] += cases; // Add cases
  });
  return acc;
}, {});

processedData = data.reduce((accumulator, item) => {
  // Check for invalid data values
  if (item.DataValue === null || item.DataValue === "" || isNaN(+item.DataValue)) {
    return accumulator; // Make sure to return the accumulator as is
  }

  // Extract the longitude and latitude from the GeoLocation string
  const pointRegex = /POINT \((-?\d+\.\d+) (-?\d+\.\d+)\)/;
  const match = item.GeoLocation.match(pointRegex);

  // Skip the item if there's no match for coordinates
  if (!match) {
    return accumulator; // Make sure to return the accumulator as is
  }

  // Parse longitude and latitude from the matched groups
  const longitude = parseFloat(match[1]);
  const latitude = parseFloat(match[2]);

  const year = +item.YearStart;
  const state = item.LocationDesc;
  const disease = item.Topic;
  const cases = +item.DataValue;

  // Create a unique key for each state, year, and disease combination
  const key = `${state}-${year}-${disease}`;

  let entryIndex = accumulator.findIndex(entry => entry.key === key);

  // If an entry doesn't exist, create it
  if (entryIndex === -1) {
    accumulator.push({
      cases:cases,
      key: key,
      state: state,
      year: year,
      diseases: { [disease]: cases },
      longitude: longitude,
      latitude: latitude
    });
  } else {
    // If an entry exists, update it
    let existingEntry = accumulator[entryIndex];
    existingEntry.diseases[disease] = (existingEntry.diseases[disease] || 0) + cases;
  }

  // It's crucial to return the accumulator for the next iteration
  return accumulator;
}, []); // Start with an empty array as the accumulator

update = chart.update(date)
JSZip = require("jszip@3.6/dist/jszip.min.js");
// Assuming JSZip is already loaded in your environment
data = FileAttachment("archive (5)@1.zip").arrayBuffer()
  .then(JSZip.loadAsync)
  .then(zip => zip.file("US_Chronic_Disease_Indicators.csv").async("string"))
  .then(d3.csvParse);

  stateMesh = FileAttachment("us-counties-10m.json").json().then(us => topojson.mesh(us, us.objects.states))

  parseDate = d3.utcParse("%Y")
  projection = d3.geoAlbersUsa().scale(1280).translate([480, 300])
  us = {
    const us = await d3.json("https://cdn.jsdelivr.net/npm/us-atlas@1/us/10m.json");
    us.objects.lower48 = {
      type: "GeometryCollection",
      geometries: us.objects.states.geometries.filter(d => d.id !== "02" && d.id !== "15")
    };
    return us;
  }

  import {Scrubber} from "@mbostock/scrubber"
