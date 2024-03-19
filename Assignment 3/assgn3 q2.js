viewof date = Scrubber(d3.utcWeek.every(2).range(...d3.extent(data, d => d.date)), {format: d3.utcFormat("%Y %b %-d"), loop: false})
chart = {
    // Assuming the existence of 'data', 'svg', 'topojson', and other necessary variables
  
    // Prepare the SVG container
    const svg = d3.create("svg")
        .attr("viewBox", [0, 0, 960, 600]);
  
    // Base map and outlines (assuming 'us' is defined appropriately)
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
  
    // Adjust the data structure
    const adjustedData = data.map(d => ({
      coordinates: [d[0], d[1]],
      date: new Date(d.date) // Ensure date is in Date object form
    }));
  
    /*const outletCircles = svg.append("g")
      .attr("class", "outlets")
      .selectAll("circle")
      .data(adjustedData)
      .join("circle")
        .attr("transform", d => `translate(${d.coordinates})`)
        .attr("r", 3)
        .attr("fill", "blue");*/
  
    const midpointGroup = svg.append("g");
  
    // Function to find the nearest outlet
    function findNearestOutlet(filteredData, targetOutlet) {
      let nearestOutlet = null;
      let shortestDistance = Infinity;
      filteredData.forEach(outlet => {
        if (outlet === targetOutlet) return; // Skip comparing outlet to itself
        const distance = Math.sqrt(
          Math.pow(outlet.coordinates[0] - targetOutlet.coordinates[0], 2) +
          Math.pow(outlet.coordinates[1] - targetOutlet.coordinates[1], 2)
        );
        if (distance < shortestDistance) {
          shortestDistance = distance;
          nearestOutlet = outlet;
        }
      });
      return nearestOutlet;
    }
  
    // Function to calculate midpoints
    function calculateMidpoints(filteredData) {
      return filteredData.map(outlet => {
        const nearestOutlet = findNearestOutlet(filteredData, outlet);
        if (!nearestOutlet) return null; // In case there's no nearest outlet
        const midpoint = [
          (outlet.coordinates[0] + nearestOutlet.coordinates[0]) / 2,
          (outlet.coordinates[1] + nearestOutlet.coordinates[1]) / 2,
        ];
        return { midpoint }; // Structure to include midpoint coordinates
      }).filter(d => d !== null); // Filter out any null entries
    }
  
    // Update function to handle transitions and updates
    function update(selectedDate) {
      const parsedSelectedDate = new Date(selectedDate);
      const filteredData = adjustedData.filter(d => d.date <= parsedSelectedDate);
  
      const midpointsData = calculateMidpoints(filteredData);
  
      // Midpoint update logic
      const midpoints = midpointGroup.selectAll("circle")
        .data(midpointsData, d => d.midpoint.join(","));
  
      midpoints.enter().append("circle")
        .attr("transform", d => `translate(${d.midpoint})`)
        .attr("r", 0)
        .attr("fill", "None")
        .attr("stroke","black")
      .transition().duration(500)
        .attr("r", 5);
  
      midpoints.exit()
        .transition().duration(500)
        .attr("r", 0)
        .remove();
    }
  
    // Initialize with the latest date or another trigger mechanism
    const latestDate = d3.max(adjustedData, d => d.date);
    update(latestDate.toISOString());
  
    return Object.assign(svg.node(), { update });
  };

  update = chart.update(date)

  data = (await FileAttachment("walmart.tsv").tsv())
  .map(d => {
    const p = projection(d);
    p.date = parseDate(d.date);
    return p;
  })
  .sort((a, b) => a.date - b.date)
  
  parseDate = d3.utcParse("%m/%d/%Y")
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