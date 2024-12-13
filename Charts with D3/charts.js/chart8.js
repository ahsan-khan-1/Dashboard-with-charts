function createPieChart2(dataUrl, chartPieId, chartLegendId) {
    const width = 800; 
    const height = 450; 
    const pieChartRadius = 150; 

    // SVG container for the pie chart
    const svgPie = d3.select(`#${chartPieId}`)
                     .append("svg")
                     .attr("viewBox", `0 0 ${width / 2} ${height}`)
                     .attr("preserveAspectRatio", "xMidYMid meet");

    // Pie chart group
    const pieGroup = svgPie.append("g")
                           .attr("transform", `translate(${width / 4}, ${height / 2 - 40})`);

    // SVG container for the legend
    const svgLegend = d3.select(`#${chartLegendId}`)
                        .append("svg")
                        .attr("viewBox", "0 0 300 450")
                        .attr("preserveAspectRatio", "xMidYMid meet")
                        .style("width", "100%"); 

    // Legend group
    const legendGroup = svgLegend.append("g")
                                 .attr("transform", `translate(10, 10)`);

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
        // Count the occurrences of each country
        const countryCount = d3.rollups(data, v => v.length, d => d.Country); 
        const totalCount = d3.sum(countryCount, d => d[1]);

        if (totalCount === 0) {
            console.error("Total count is 0, which means no valid data was found.");
            return;
        }

        const pie = d3.pie().value(d => d[1]).sort(null);
        const arc = d3.arc().outerRadius(pieChartRadius).innerRadius(0);
        const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

        // Draw pie chart
        const slices = pieGroup.selectAll(".slice")
                               .data(pie(countryCount))
                               .enter()
                               .append("g")
                               .attr("class", "slice");

        slices.append("path")
              .attr("d", arc)
              .style("fill", d => colorScale(d.data[0]))
              .style("stroke", "white")
              .style("stroke-width", "2px")
              .attr("data-country", d => d.data[0])
              .on("mouseover", function(event, d) {
                  highlightSlice(d.data[0]);
                  tooltip.style("display", "block")
                         .html(` 
                             <strong>${d.data[0]}</strong><br/>
                             Count: ${d.data[1]}<br/>
                             Percentage: ${((d.data[1] / totalCount) * 100).toFixed(1)}%
                         `);
              })
              .on("mousemove", function(event) {
                  tooltip.style("left", `${event.pageX + 10}px`)
                         .style("top", `${event.pageY + 10}px`);
              })
              .on("mouseout", function(event, d) {
                  resetHighlight();
                  tooltip.style("display", "none");
              });

        // Draw legend
        legendGroup.append("text")
                   .attr("x", 0)
                   .attr("y", 0)
                   .text("Legend")
                   .style("font-size", "14px")
                   .style("font-weight", "bold");

        legendGroup.append("text")
                   .attr("x", 0)
                   .attr("y", 20)
                   .text("Format: country name - count - percentage")
                   .style("font-size", "12px")
                   .style("fill", "#555")
                   .style("font-style", "italic");

        const legendItems = legendGroup.selectAll(".legendItem")
                                       .data(countryCount)
                                       .enter()
                                       .append("g")
                                       .attr("class", "legendItem")
                                       .attr("transform", (d, i) => `translate(0, ${i * 25 + 40})`)
                                       .on("mouseover", function(event, d) {
                                           highlightSlice(d[0]);
                                           d3.select(this).select("text")
                                             .transition()
                                             .duration(200)
                                             .style("fill", "blue");
                                       })
                                       .on("mouseout", function(event, d) {
                                           resetHighlight();
                                           d3.select(this).select("text")
                                             .transition()
                                             .duration(200)
                                             .style("fill", "#333");
                                       });

        legendItems.append("rect")
            .attr("width", 20) 
            .attr("height", 20) 
            .style("fill", d => colorScale(d[0]));

        legendItems.append("text")
            .attr("x", 30) 
            .attr("y", 15) 
            .text(d => `${d[0]} - ${d[1]} - ${((d[1] / totalCount) * 100).toFixed(1)}%`)
            .style("font-size", "14px") 
            .style("fill", "#333");


        function highlightSlice(country) {
            slices.selectAll("path")
                  .filter(d => d.data[0] === country)
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

createPieChart2("data.csv", "chart8Pie", "chart8Legend");
