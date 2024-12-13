function createDonutChart(dataUrl, chartId) {
    const width = 800; 
    const height = 500; 
    const donutRadius = 150; 
    const legendWidth = 200; 
    const margin = { top: 10, right: 40, bottom: 40, left: 40 }; // Reduced top margin

    // SVG container
    const svg = d3.select(`#${chartId}`)
                  .append("svg")
                  .attr("width", width)
                  .attr("height", height);

    // Donut chart group (adjust vertical translation to move the chart closer to the top)
    const donutGroup = svg.append("g")
                          .attr("transform", `translate(${width / 3}, ${height / 2 - 40})`); 
    // Legend group
    const legendGroup = svg.append("g")
                           .attr("transform", `translate(${(2 * width) / 3 + 10}, ${margin.top})`);

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
    d3.csv(dataUrl).then(data => {
        // Aggregate followers by category
        const categoryFollowers = d3.rollups(data, v => d3.sum(v, d => +d.followers), d => d.Category);
        const totalFollowers = d3.sum(categoryFollowers, d => d[1]);

        if (totalFollowers === 0) {
            console.error("Total followers count is 0, which means no valid data was found.");
            return;
        }

        const pie = d3.pie().value(d => d[1]).sort(null);
        const arc = d3.arc().outerRadius(donutRadius).innerRadius(donutRadius * 0.6);  
        const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

        // Draw donut chart
        const slices = donutGroup.selectAll(".slice")
                               .data(pie(categoryFollowers))  
                               .enter()
                               .append("g")
                               .attr("class", "slice");

        slices.append("path")
              .attr("d", arc)
              .style("fill", d => colorScale(d.data[0]))
              .style("stroke", "white")
              .style("stroke-width", "2px")
              .attr("data-category", d => d.data[0])  
              .on("mouseover", function(event, d) {
                  highlightSlice(d.data[0]);

                  // Show tooltip with followers and percentage
                  tooltip.style("display", "block")
                         .html(`
                             <strong>${d.data[0]}</strong><br/>
                             Followers: ${d.data[1]}<br/>
                             Percentage: ${((d.data[1] / totalFollowers) * 100).toFixed(1)}%
                         `);
              })
              .on("mousemove", function(event) {
                  // Update tooltip position
                  tooltip.style("left", `${event.pageX + 10}px`)
                         .style("top", `${event.pageY + 10}px`);
              })
              .on("mouseout", function(event, d) {
                  resetHighlight();

                  // Hide tooltip
                  tooltip.style("display", "none");
              });

        // Draw legend
        legendGroup.append("text")
                   .attr("x", 0)
                   .attr("y", 0)
                   .text("Legend")
                   .style("font-size", "14px")
                   .style("font-weight", "bold");

        // Add the note explaining the format
        legendGroup.append("text")
                   .attr("x", 0)
                   .attr("y", 20)
                   .text("Format: category name - followers - percentage")
                   .style("font-size", "12px")
                   .style("fill", "#555")
                   .style("font-style", "italic");

        const legendItems = legendGroup.selectAll(".legendItem")
                                       .data(categoryFollowers)  
                                       .enter()
                                       .append("g")
                                       .attr("class", "legendItem")
                                       .attr("transform", (d, i) => `translate(0, ${i * 25 + 40})`)  
                                       .on("mouseover", function(event, d) {
                                           highlightSlice(d[0]);

                                           // Change text color
                                           d3.select(this).select("text")
                                             .transition()
                                             .duration(200)
                                             .style("fill", "blue");
                                       })
                                       .on("mouseout", function(event, d) {
                                           resetHighlight();

                                           // Reset text color
                                           d3.select(this).select("text")
                                             .transition()
                                             .duration(200)
                                             .style("fill", "#333");
                                       });

        legendItems.append("rect")
                   .attr("width", 15)
                   .attr("height", 15)
                   .style("fill", d => colorScale(d[0]));

        // Modify the legend text to show category name, followers, and percentage
        legendItems.append("text")
                   .attr("x", 20)
                   .attr("y", 12)
                   .text(d => `${d[0]} - ${d[1]} - ${((d[1] / totalFollowers) * 100).toFixed(1)}%`)  // Modified text format
                   .style("font-size", "12px")
                   .style("fill", "#333");

        // Add total followers text beneath the legend
        legendGroup.append("text")
                   .attr("x", 0)
                   .attr("y", categoryFollowers.length * 25 + 60)  
                   .text(`Total Followers: ${totalFollowers}`)
                   .style("font-size", "14px")
                   .style("font-weight", "bold")
                   .style("fill", "#333");

        // Functions to handle highlighting
        function highlightSlice(category) {  
            slices.selectAll("path")
                  .filter(d => d.data[0] === category) 
                  .transition()
                  .duration(300)
                  .attr("transform", "scale(1.1)");
        }

        function resetHighlight() {
            slices.selectAll("path")
                  .transition()
                  .duration(300)
                  .attr("transform", "scale(1)");
        }
    }).catch(error => {
        console.error("Error loading data:", error);
    });
}

createDonutChart("data.csv", "chart7");
