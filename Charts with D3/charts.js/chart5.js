function createQuarterlyIncomeChart(dataUrl, chartId) {
    // Load CSV data
    d3.csv(dataUrl).then(function(data) {
        // Step 1: Prepare data for the grouped bar chart
        const quarters = ['Income q1', 'Income q2', 'Income q3', 'Income q4'];

        // Step 2: Filter top 5 YouTubers based on their follower count
        data.forEach(d => {
            d.totalIncome = +d['Income q1'] + +d['Income q2'] + +d['Income q3'] + +d['Income q4'];
            d.followerCount = +d['Follower Count'];  
        });

        // Sort YouTubers by follower count and take top 5
        const topYouTubers = data.sort((a, b) => b.followerCount - a.followerCount).slice(0, 5);

        // Step 3: Set up chart dimensions and scales
        const margin = { top: 40, right: 100, bottom: 60, left: 160 };
        const width = 800 - margin.left - margin.right;
        const height = 450 - margin.top - margin.bottom; 

        const x = d3.scaleLinear()
            .domain([0, d3.max(topYouTubers, d => d3.max(quarters, quarter => +d[quarter]))])
            .range([0, width]);

        const y = d3.scaleBand()
            .domain(topYouTubers.map(d => d.ChannelName))
            .range([0, height])
            .padding(0.15);  

        const color = d3.scaleOrdinal()
            .domain(quarters)
            .range(["#ff8c00", "#6b8e23", "#1e90ff", "#ff4500"]);

        // Step 4: Create SVG element
        const svg = d3.select(`#${chartId}`)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Step 5: Create a tooltip
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("background", "#fff")
            .style("padding", "10px")
            .style("border", "1px solid #ddd")
            .style("border-radius", "5px")
            .style("opacity", 0);

        // Step 6: Add bars for each YouTuber and quarter
        const barGroups = svg.selectAll(".bar-group")
            .data(topYouTubers)
            .enter().append("g")
            .attr("class", "bar-group")
            .attr("transform", d => `translate(0,${y(d.ChannelName)})`);

        // Add bars for each quarter
        barGroups.selectAll(".bar")
            .data(d => quarters.map(quarter => ({ quarter, value: +d[quarter], channel: d.ChannelName })))
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => x(0))
            .attr("y", (d, i) => i * (y.bandwidth() / 4)) 
            .attr("width", d => x(d.value))
            .attr("height", y.bandwidth() / 4)
            .attr("fill", d => color(d.quarter))
            .on("mouseover", function(event, d) {
                // Show the tooltip with the channel name, quarter, and income
                tooltip.transition().duration(200).style("opacity", 1);
                
                // Build the tooltip content for the specific quarter income
                tooltip.html(`<strong>${d.channel}</strong><br><strong>${d.quarter}:</strong> $${d.value}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 30) + "px");

                // Apply hover effect: make other bars transparent
                d3.selectAll(".bar")
                    .style("opacity", 0.2);  
                d3.select(this).style("opacity", 1);  
            })
            .on("mouseout", function() {
                // Hide the tooltip and reset opacity
                tooltip.transition().duration(200).style("opacity", 0);
                
                d3.selectAll(".bar").style("opacity", 1);  
            });

        // Step 7: Add X and Y axes
        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x));

        svg.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(y));

        // Step 8: Add labels for the axes
        svg.append("text")
            .attr("class", "x-label")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom - 10)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .text("Income (in $)");

        svg.append("text")
            .attr("class", "y-label")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 10)
            .attr("x", -height / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .text("Channel");

        // Step 9: Add legend for quarters with title
        const legend = svg.append("g")
            .attr("transform", `translate(${width + 20},0)`);

        // Add legend title
        legend.append("text")
            .attr("x", 0)
            .attr("y", -10)
            .style("font-size", "14px")
            .text("Quarters");

        const legendItems = legend.selectAll(".legend-item")
            .data(quarters)
            .enter().append("g")
            .attr("class", "legend-item")
            .attr("transform", (d, i) => `translate(0,${i * 20})`);

        legendItems.append("rect")
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", d => color(d))
            .on("mouseover", function(event, d) {
                // Highlight bars corresponding to hovered legend item
                d3.selectAll(".bar")
                    .style("opacity", 0.2); 
                
                // Highlight the bars for the hovered quarter
                d3.selectAll(".bar")
                    .filter(bar => bar.quarter === d)
                    .style("opacity", 1);  
            })
            .on("mouseout", function() {
                d3.selectAll(".bar").style("opacity", 1);
            });

        legendItems.append("text")
            .attr("x", 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("font-size", "12px")
            .text(d => d)
            .on("mouseover", function(event, d) {
                // Change the text color to blue when hovering
                d3.select(this).transition().duration(200).style("fill", "blue");

                // Highlight the bars corresponding to the hovered legend item (quarter)
                d3.selectAll(".bar")
                    .style("opacity", 0.2);  

                // Highlight the bars for the hovered quarter
                d3.selectAll(".bar")
                    .filter(bar => bar.quarter === d)
                    .style("opacity", 1);  
            })
            .on("mouseout", function() {
                d3.select(this).transition().duration(200).style("fill", "black");
                d3.selectAll(".bar").style("opacity", 1);
            });
    });
}

createQuarterlyIncomeChart("data.csv", "chart5");
