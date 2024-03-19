covid = d3.csv("https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv")
data = await d3.csv("https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv");
parsedData = data.map( d => (
  {
    ...d,
    date: d.date,
    county: d.county,
    code: d.fips,
    state: d.state,
    cases: +d.cases,
    deaths: +d.deaths
  }
));
startDate = new Date("2020-12-25");
endDate = new Date("2021-01-01");
filteredData = parsedData.filter(d => {
  const date = new Date(d.date);
  return (date >= startDate && date <= endDate)
});
startDateData = filteredData.filter(d => new Date(d.date).getTime() === startDate.getTime());
aggData1 = d3.rollup(startDateData, v => ({
  totalCases: d3.sum(v, d => d.cases),
  totalDeaths: d3.sum(v, d => d.deaths),
  deathPercentage: (d3.sum(v, d => d.deaths) / d3.sum(v, d => d.cases)) * 100
}));
endDateData = filteredData.filter(d => new Date(d.date).getTime() === endDate.getTime());
aggData2 = d3.rollup(endDateData, v => ({
  totalCases: d3.sum(v, d => d.cases),
  totalDeaths: d3.sum(v, d => d.deaths),
  deathPercentage: (d3.sum(v, d => d.deaths) / d3.sum(v, d => d.cases)) * 100
}));
nationalaverage_case = (aggData2.totalCases-aggData1.totalCases)*100/(aggData1.totalCases)
nationalaverage_death= (aggData2.totalDeaths-aggData1.totalDeaths)*100/(aggData1.totalDeaths)
g1Data = d3.rollups(startDateData,
  (group) => ({
    totalCases: d3.sum(group, d => d.cases),
    totalDeaths: d3.sum(group, d => d.deaths),
    deathPercentage: (d3.sum(group, d => d.deaths)/d3.sum(group, d => d.cases))*100
  }),
  d => d.county, d => d.fips // Group by county and fips
);
g2Data = d3.rollups(endDateData,
  (group) => ({
    totalCases: d3.sum(group, d => d.cases),
    totalDeaths: d3.sum(group, d => d.deaths),
    deathPercentage: (d3.sum(group, d => d.deaths)/d3.sum(group, d => d.cases))*100
  }),
  d => d.county, d => d.fips // Group by county and fips
);
gData1 = d3.rollup(startDateData, v => ({
  totalCases: d3.sum(v, d => d.cases),
  totalDeaths: d3.sum(v, d => d.deaths),
  deathPercentage: (d3.sum(v, d => d.deaths) / d3.sum(v, d => d.cases)) * 100
}), d => d.fips);
gData2 = d3.rollup(endDateData, v => ({
  totalCases: d3.sum(v, d => d.cases),
  totalDeaths: d3.sum(v, d => d.deaths),
  deathPercentage: (d3.sum(v, d => d.deaths) / d3.sum(v, d => d.cases)) * 100
}), d => d.fips);

gData3 = new Map();
// Iterate over the keys of gData2
gData2.forEach((value, key) => {
  const oldCases = gData1.has(key) ? gData1.get(key).totalCases : 0; // Get the old cases or default to 0
  const newCases = value.totalCases;
  const oldDeaths = gData1.has(key) ? gData1.get(key).totalDeaths : 0; // Get the old cases or default to 0
  const newDeaths = value.totalDeaths;
  // Compute the percentage increase
  const increase = oldCases ? ((newCases - oldCases) / oldCases) * 100 : 0;
  const inc = oldDeaths ? ((newDeaths - oldDeaths) / oldDeaths) * 100 : 0;
  // Set the increase in the new map
  gData3.set(key, {
    totalCases: newCases,
    totalDeaths: value.totalDeaths,
    deathPercentage: value.deathPercentage,
    caseIncreasePercentage: increase,
    deathIncreasePercentage: inc
  });
});
lat_log = d3.csv("https://gist.githubusercontent.com/russellsamora/12be4f9f574e92413ea3f92ce1bc58e6/raw/3f18230058afd7431a5d394dab7eeb0aafd29d81/us_county_latlng.csv");
geo_data = await d3.csv("https://gist.githubusercontent.com/russellsamora/12be4f9f574e92413ea3f92ce1bc58e6/raw/3f18230058afd7431a5d394dab7eeb0aafd29d81/us_county_latlng.csv");

geoMapping = geo_data.reduce((acc, cur) => {
  acc[cur.fips_code] = { lat: +cur.lat, lon: +cur.lng, name: cur.name };
  return acc;
}, {});
mergedData = [...gData3].map(([county, dataArray]) => {
  const fipsCode = county;
  const data = dataArray;

  const geoInfo = geoMapping[fipsCode] || {};

  return {
    ...data, 
    fips_code: fipsCode,
    name: geoInfo.name,
    latitude: geoInfo.lat,
    longitude: geoInfo.lon
  };
});

chart1 = {
  const width = 928;
  const height = 581;
  const projection = d3.geoAlbersUsa().scale(4 / 3 * width).translate([width / 2, height / 2]);
  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height])
      .attr("width", width)
      .attr("height", height)
      .attr("style", "max-width: 100%; height: auto;");

  const color = d3.scaleThreshold()
    .domain([nationalaverage_case])
    .range(["lightgreen", "darkred"])
  
 const legendLabels = ['Below National Average', 'Above National Average'];

const legendColorScale = d3.scaleOrdinal()
  .domain(legendLabels)
  .range(['lightgreen', 'pink']); // green for below, red for above

const legend = svg.append('g')
  .attr("transform", "translate(580,20)"); 

legend.selectAll(null)
  .data(legendLabels)
  .enter()
  .append('rect')
  .attr('y', (d, i) => i * 25)
  .attr('width', 20)
  .attr('height', 20)
  .attr('fill', d => legendColorScale(d));

legend.selectAll(null)
  .data(legendLabels)
  .enter()
  .append('text')
  .attr('x', 30) // slightly more space for the text
  .attr('y', (d, i) => i * 25 + 15)
  .text(d => d);
  
  const IncScale = d3.scaleSqrt()
    .domain([0, d3.max(mergedData, d => d.caseIncreasePercentage)])
    .range([0, 12]);


  svg.append("path")
      .datum(stateMesh)
      .attr("fill", "none")
      .attr("stroke", "#777")
      .attr("stroke-width", 0.5)
      .attr("stroke-linejoin", "round")
      .attr("d", d3.geoPath(projection));

  svg.selectAll('circle')
    .data(mergedData)
    .enter()
    .append('circle')
      .attr('cx', d => {
        const coords = projection([d.longitude, d.latitude]);
        return coords ? coords[0] : null;
      })
      .attr('cy', d => {
        const coords = projection([d.longitude, d.latitude]);
        return coords ? coords[1] : null;
      })
      .attr('r', d => IncScale(d.caseIncreasePercentage))
      .attr('fill', d => color(d.caseIncreasePercentage))
      .attr('stroke', 'black')
    .append("title")
      .text(d => `${d.caseIncreasePercentage.toLocaleString()}% increase in last 7 days`);

  return svg.node();
}

stateMesh = FileAttachment("us-counties-10m.json").json().then(us => topojson.mesh(us, us.objects.states))

