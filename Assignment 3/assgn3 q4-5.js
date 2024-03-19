data = FileAttachment("archive (5).zip").arrayBuffer()
  .then(JSZip.loadAsync)
  .then(zip => zip.file("US_Chronic_Disease_Indicators.csv").async("string"))
  .then(d3.csvParse);

  JSZip = require('jszip@3.6.0/dist/jszip.min.js')
  diseaseData = {};
  processedData = data.reduce((accumulator, item) => {
    // Skip the item if the DataValue is null, not a number, or DataValueUnit is not "%"
    if (item.DataValue === null || item.DataValue === "" || isNaN(+item.DataValue) || item.DataValueUnit !== "cases per 100,000") {
      return accumulator;
    }
  
    const year = item.YearStart;
    const state = item.LocationDesc;
    const disease = item.Topic;
    const cases = +item.DataValue; // Convert DataValue to a number
    const coordsMatch = item.GeoLocation.match(/\(([^)]+)\)/);
    const coords = coordsMatch ? coordsMatch[1].split(' ') : null;
  
    // Skip the item if coordinates are not available
    if (!coords) return accumulator;
  
    const latitude = +coords[1];
    const longitude = +coords[0];
  
    // If the disease doesn't exist in the accumulator, add it
    if (!accumulator[disease]) {
      accumulator[disease] = {};
    }
  
    // If the year-state key doesn't exist for this disease, add it
    const yearStateKey = `${year}-${state}`;
    if (!accumulator[disease][yearStateKey]) {
      accumulator[disease][yearStateKey] = {
        year: year,
        state: state,
        cases: 0,
        latitude: latitude,
        longitude: longitude,
      };
    }
  
    // Aggregate the cases
    accumulator[disease][yearStateKey].cases += cases;
  
    return accumulator;
  }, {});
  aggregatedData = Object.entries(processedData).flatMap(([disease, yearStates]) => {
    return Object.entries(yearStates).map(([yearState, data]) => ({
      disease: disease,
      yearState: yearState,
      year: data.year,
      state: data.state,
      cases: data.cases,
      latitude: data.latitude,
      longitude: data.longitude
    }));
  });
  function filterDataByDisease(processedData, diseaseName) {
    // Check if the disease name is in the processed data
    if (!processedData.hasOwnProperty(diseaseName)) {
      console.warn(`No data found for disease: ${diseaseName}`);
      return [];
    }
  
    // Retrieve the year-state data for the specified disease
    const diseaseData = processedData[diseaseName];
  
    // Transform the year-state data into a flattened array suitable for plotting
    const filteredData = Object.entries(diseaseData).map(([yearState, data]) => ({
      disease: diseaseName,
      yearState: yearState,
      year: data.year,
      state: data.state,
      cases: data.cases,
      latitude: data.latitude,
      longitude: data.longitude
    }));
  
    return filteredData;
  }
  aggregatedArray = Object.values(processedData);
  Chart3 = {
    const width = 928;
    const height = 581;
    const projection = d3.geoAlbersUsa().scale(4 / 3 * width).translate([width / 2, height / 2]);
    const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height])
      .attr("width", width)
      .attr("height", height)
      .attr("style", "max-width: 100%; height: auto;");
  
    svg.append("path")
      .datum(stateMesh)
      .attr("fill", "none")
      .attr("stroke", "#777")
      .attr("stroke-width", 0.5)
      .attr("stroke-linejoin", "round")
      .attr("d", d3.geoPath(projection));
  
    // Preprocess the data to sum up cases per state per year
    let stateYearlyCases = {};
    aggregatedArray.forEach(item => {
      Object.entries(item).forEach(([yearState, data]) => {
        if (!stateYearlyCases[yearState]) {
          stateYearlyCases[yearState] = {
            year: data.year,
            state: data.state,
            cases: 0,
            latitude: data.latitude,
            longitude: data.longitude
          };
        }
        stateYearlyCases[yearState].cases += data.cases;
      });
    });
  
    // Flatten the stateYearlyCases object into an array for D3
    let flatData = Object.values(stateYearlyCases);
  
    const maxCases = d3.max(flatData, d => d.cases);
    const radiusScale = d3.scaleSqrt().domain([d3.min(flatData, d => d.cases), maxCases]).range([0, 25]);
  
    // Use flatData to draw the circles
    const circles = svg.selectAll("circle")
      .data(flatData, d => `${d.year}-${d.state}`)
      .enter().append("circle")
        .attr("transform", d => {
          const coords = projection([d.longitude, d.latitude]);
          return coords ? `translate(${coords})` : null;
        })
        .attr("r", d => radiusScale(d.cases))
        .attr("fill", "yellow")
        .attr("stroke", "white")
        .attr("stroke-width", 1.5)
        .append("title")
        .text(d => `${d.year}-${d.state}: ${d.cases} total cases`);
  
    // Immediately set the radius of the circles based on cases without transition
    function update(year) {
      const yearData = flatData.filter(d => d.year === String(year));
      svg.selectAll("circle")
        .data(yearData, d => `${d.year}-${d.state}`)
        .attr("r", d => radiusScale(d.cases));
    }
  
    // Initial update to show the circles for the first year
    const initialYear = d3.min(flatData, d => d.year);
    update(initialYear);
  
    return Object.assign(svg.node(), { update });
  };
  processedData3 = data.reduce((accumulator, item) => {
    // Skip the item if the DataValue is null, not a number, or DataValueUnit is not "cases per 100,000"
    if (item.DataValue === null || item.DataValue === "" || isNaN(+item.DataValue) || item.DataValueUnit !== "cases per 100,000") {
      return accumulator;
    }
  
    // Skip the item if the stratification category is not "Gender"
    if (item.StratificationCategory1 !== "Gender") {
      return accumulator;
    }
  
    // Skip the item if the disease is not "Diabetes"
    if (item.Topic !== "Cardiovascular Disease") {
      return accumulator;
    }
  
    const year = item.YearStart;
    const state = item.LocationDesc;
    const disease = item.Topic;
    const gender = item.Stratification1;
    const cases = +item.DataValue; // Convert DataValue to a number
    const coordsMatch = item.GeoLocation.match(/\(([^)]+)\)/);
    const coords = coordsMatch ? coordsMatch[1].split(' ') : null;
  
    // Skip the item if coordinates are not available
    if (!coords) return accumulator;
  
    const latitude = +coords[1];
    const longitude = +coords[0];
  
    // If the disease doesn't exist in the accumulator, add it
    if (!accumulator[disease]) {
      accumulator[disease] = {};
    }
  
    // If the year-state-gender key doesn't exist for this disease, add it
    const yearStateGenderKey = `${year}-${state}-${gender}`;
    if (!accumulator[disease][yearStateGenderKey]) {
      accumulator[disease][yearStateGenderKey] = {
        year: year,
        state: state,
        gender: gender,
        cases: 0,
        latitude: latitude,
        longitude: longitude,
      };
    }
  
    // Aggregate the cases
    accumulator[disease][yearStateGenderKey].cases += cases;
  
    return accumulator;
  }, {});

  Chart4 = {
    const width = 928;
    const height = 581;
    const projection = d3.geoAlbersUsa().scale(4 / 3 * width).translate([width / 2, height / 2]);
  
    const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height])
      .attr("width", width)
      .attr("height", height)
      .attr("style", "max-width: 100%; height: auto;");
  
    svg.append("path")
      .datum(stateMesh)
      .attr("fill", "none")
      .attr("stroke", "#aaa")
      .attr("stroke-width", 1)
      .attr("stroke-linejoin", "round")
      .attr("d", d3.geoPath(projection));
  
    // Preprocess the data to sum up cases per state per year per gender
    let stateYearlyGenderCases = {};
  
    Object.entries(processedData3).forEach(([disease, diseaseData]) => {
      Object.entries(diseaseData).forEach(([yearStateGender, data]) => {
        const [year, state, gender] = yearStateGender.split("-");
        const key = `${year}-${state}-${gender}`;
  
        if (!stateYearlyGenderCases[key]) {
          stateYearlyGenderCases[key] = {
            year,
            state,
            gender,
            cases: 0,
            latitude: data.latitude,
            longitude: data.longitude,
          };
        }
  
        stateYearlyGenderCases[key].cases += data.cases;
      });
    });
  
    // Flatten the stateYearlyGenderCases object into an array for D3
    let flatData = Object.values(stateYearlyGenderCases);
  
    const maxCases = d3.max(flatData, d => d.cases);
    const radiusScale = d3.scaleSqrt().domain([d3.min(flatData, d => d.cases), maxCases]).range([0, 25]);
  
    // Define a color scale with distinct colors for male and female
    const colorScale = d3.scaleOrdinal()
      .domain(["Male", "Female"])
      .range(["#ff7f00", "#377eb8"]);
  
    // Use flatData to draw the circles
    const circles = svg.selectAll("circle")
      .data(flatData, d => `${d.year}-${d.state}-${d.gender}`)
      .enter().append("circle")
      .attr("transform", d => {
        const coords = projection([d.longitude, d.latitude]);
        return coords ? `translate(${coords})` : null;
      })
      .attr("r", d => radiusScale(d.cases))
      .attr("fill", d => colorScale(d.gender))
      // .attr("stroke", d => d.gender === "Male" ? "#377eb8" : "#ff7f00") // Darker stroke for better visibility
      // .attr("stroke-width", 3)
      .append("title")
      .text(d => `${d.year}-${d.state}-${d.gender}: ${d.cases} total cases`);
  
    // Add legend
    const legend = svg.selectAll(".legend")
      .data(colorScale.domain())
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", (d, i) => `translate(0,${i * 20})`);
  
    legend.append("rect")
      .attr("x", width - 180)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", colorScale);
  
    legend.append("text")
      .attr("x", width - 156)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "start")
      .text(d => d);
  
    // Immediately set the radius of the circles based on cases without transition
    function update(year) {
      const yearData = flatData.filter(d => d.year === String(year));
  
      svg.selectAll("circle")
        .data(yearData, d => `${d.year}-${d.state}-${d.gender}`)
        .attr("r", d => radiusScale(d.cases));
    }
  
    // Initial update to show the circles for the first year
    const initialYear = d3.min(flatData, d => d.year);
    update(initialYear);
  
    return Object.assign(svg.node(), { update });
  };
  stateMesh = FileAttachment("us-counties-10m.json").json().then(us => topojson.mesh(us, us.objects.states))
  import {legend} from "@d3/color-legend"
  import {Scrubber} from "@mbostock/scrubber"
  
  