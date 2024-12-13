function createScatterPlot(dataUrl, chartId) {
    const margin = { top: 10, right: 40, bottom: 40, left: 100 }; 
    const width = 800;
    const height = 500;

    // SVG container
    const svg = d3.select(`#${chartId}`)
                  .append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom);

    // Chart group (positioned with margin)
    const chartGroup = svg.append("g")
                          .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Tooltip container
    const tooltip = d3.select("body")
                      .append("div")
                      .attr("id", "tooltip")
                      .style("position", "absolute")
                      .style("background", "rgba(0, 0, 0, 0.8)")
                      .style("color", "white")
                      .style("padding", "8px")
                      .style("border-radius", "5px")
                      .style("display", "none")
                      .style("pointer-events", "none");

    // Load and process data
    d3.csv(dataUrl).then(function(data) {
        
        data.forEach(function(d) {
            d.Likes = +d.Likes;
            d.followers = +d.followers;
        });

        // Set scales
        const x = d3.scaleLinear()
                    .domain([0, d3.max(data, d => d.followers)])
                    .range([0, width]);

        const y = d3.scaleLinear()
                    .domain([0, d3.max(data, d => d.Likes)])
                    .range([height, 0]);

        // Add x-axis
        chartGroup.append("g")
                  .attr("class", "x-axis")
                  .attr("transform", `translate(0, ${height})`)
                  .call(d3.axisBottom(x));

        // Add y-axis
        chartGroup.append("g")
                  .attr("class", "y-axis")
                  .call(d3.axisLeft(y));

        // Add x-axis label
        chartGroup.append("text")
                  .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
                  .style("text-anchor", "middle")
                  .text("Subscribers");

        // Add y-axis label with rotation
        chartGroup.append("text")
                  .attr("transform", "rotate(-90)") 
                  .attr("y", -margin.left + 20)     
                  .attr("x", 0 - (height / 2))      
                  .style("text-anchor", "middle")
                  .text("Likes");

        // Add dots (scatter plot points)
        const dots = chartGroup.selectAll(".dot")
                              .data(data)
                              .enter()
                              .append("circle")
                              .attr("class", "dot")
                              .attr("cx", d => x(d.followers))
                              .attr("cy", d => y(d.Likes))
                              .attr("r", 5)
                              .style("fill", "blue")
                              .style("opacity", 0.7)
                              .on("mouseover", function(event, d) {
                                  // Change color on hover
                                  d3.select(this).style("fill", "orange");
                                  showTooltip(event, d);
                              })
                              .on("mouseout", function() {
                                  // Reset color when mouse leaves
                                  d3.select(this).style("fill", "blue");
                                  hideTooltip();
                              });

        // Show tooltip function
        function showTooltip(event, d) {
            tooltip.style("display", "block")
                   .html(`
                       <strong>${d.ChannelName}</strong><br/>
                       Subscribers: ${d.followers}<br/>
                       Likes: ${d.Likes}
                   `)
                   .style("left", `${event.pageX + 10}px`)
                   .style("top", `${event.pageY + 10}px`);
        }

        // Hide tooltip function
        function hideTooltip() {
            tooltip.style("display", "none");
        }
    }).catch(function(error) {
        console.error("Error loading data:", error);
    });
}

createScatterPlot("data.csv", "chart2");
