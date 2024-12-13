function createBarChart(dataUrl, chartId) {
    const width = 800; 
    const height = 500; 
    const margin = { top: 40, right: 40, bottom: 150, left: 150 };
    const barWidth = width - margin.left - margin.right;
    const barHeight = height - margin.top - margin.bottom;

    
    const chartContainer = d3.select(`#${chartId}`)
        .append("div")
        .style("width", `${width}px`)
        .style("height", `${height}px`)
        .style("overflow-y", "auto"); 

    // SVG container inside the scrollable div
    const svg = chartContainer.append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("overflow-y", "scroll"); 

    // Scrollable group
    const scrollGroup = svg.append("g")
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
    d3.csv(dataUrl).then(data => {
        const processedData = data.map(d => ({
            channels: d.ChannelName,
            followers: +d.followers 
        }));

        // Dynamic height for long data
        const scrollHeight = processedData.length * 25;
        svg.attr("height", scrollHeight + margin.top + margin.bottom); 

        const x = d3.scaleLinear()
            .domain([0, d3.max(processedData, d => d.followers)])
            .range([0, barWidth]);

        const y = d3.scaleBand()
            .domain(processedData.map(d => d.channels))
            .range([0, scrollHeight]) // Dynamically extend range for scroll
            .padding(0.1);

        // Draw bars
        scrollGroup.selectAll(".bar")
            .data(processedData)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", 0)
            .attr("y", d => y(d.channels))
            .attr("width", d => x(d.followers))
            .attr("height", y.bandwidth())
            .style("fill", "steelblue")
            .on("mouseover", function (event, d) {
                // Add transition on hover to change color to orange
                d3.select(this)
                    .transition()
                    .duration(300) 
                    .style("fill", "orange");

                tooltip.style("display", "block")
                    .html(`
                        <strong>${d.channels}</strong><br/>
                        Followers: ${d.followers.toLocaleString()}
                    `);
            })
            .on("mousemove", function (event) {
                tooltip.style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY - 20}px`);
            })
            .on("mouseout", function () {
                // Revert the color back to steelblue with a smooth transition
                d3.select(this)
                    .transition()
                    .duration(300)
                    .style("fill", "steelblue");

                tooltip.style("display", "none");
            });

        // X Axis
        scrollGroup.append("g")
            .attr("transform", `translate(0, ${scrollHeight})`) 
            .call(d3.axisBottom(x).tickFormat(d3.format(".2s")))
            .selectAll("text")
            .style("font-size", "12px")
            .style("text-anchor", "middle");

        // Add x-axis title
        svg.append("text")
            .attr("x", margin.left + barWidth / 2)
            .attr("y", scrollHeight + margin.top + 40)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .text("Number of Followers");

        // Y Axis (position it outside the scrollable section)
        const yAxisGroup = svg.append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`)
            .call(d3.axisLeft(y))
            .selectAll("text")
            .style("font-size", "12px")
            .style("text-anchor", "end");

        // Add y-axis title at the top, horizontally
        svg.append("text")
            .attr("x", margin.left + barWidth - barWidth -40)  
            .attr("y", margin.top - 10)  
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .text("Channels");
    }).catch(error => {
        console.error("Error loading data:", error);
    });
}

createBarChart("data.csv", "chart9");
