function createBarChart(dataUrl, chartId) {
    // Load the CSV data
    d3.csv(dataUrl).then(function(data) {

        // Default country (IN)
        let selectedCountry = 'IN';

        // Function to filter data by selected country
        function filterByCountry(country) {
            return data.filter(d => d.Country === country);
        }

        // Function to count the number of channels by category using d3.group and d3.rollup
        function countChannelsByCategory(countryData) {
            const categoryCounts = d3.rollup(
                countryData, 
                v => v.length, 
                d => d.Category
            );
            return Array.from(categoryCounts, ([key, value]) => ({ key, value }));
        }

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

        // Create dropdown menu for country selection inside #inputContainer
        function populateCountryDropdown() {
            const countries = [...new Set(data.map(d => d.Country))]; // Get unique countries
            const dropdown = d3.select('#inputContainer').append('select')
                .attr('id', chartId + '-dropdown')
                .style("padding", "8px")
                .style("border-radius", "5px")
                .style("font-size", "14px")
                .style("background-color", "#f0f0f0")
                .style("border", "1px solid #ccc");

            dropdown
                .selectAll('option')
                .data(countries)
                .enter()
                .append('option')
                .attr('value', d => d)
                .text(d => d);

            // Set the default selected country
            dropdown.property('value', selectedCountry);
            dropdown.on('change', updateChart);
        }

        // Update the chart when the user selects a different country
        function updateChart() {
            selectedCountry = d3.select('#' + chartId + '-dropdown').property('value');
            const countryData = filterByCountry(selectedCountry);
            const categoryCounts = countChannelsByCategory(countryData);

            // Update chart title based on the selected country
            d3.select('#chartTitle').html('Number of YouTube Channels in <span id="countryCode" style="color: #00f; stroke: #000; stroke-width: 2px;">' + selectedCountry + '</span>');

            // Call function to create/update the chart and legend
            renderLegend(categoryCounts);
            renderBarChart(categoryCounts);
        }

        // Create or update the legend
        function renderLegend(categoryCounts) {
            let legendContainer = d3.select('#chart6Legend');
            // Clear any previous legend items
            legendContainer.html('');

            // Add heading to the legend
            legendContainer.append('h3')
                .style('font-size', '14px')
                .style('font-weight', 'bold')
                .text('Legend');

            // Create the legend items
            const legendItems = legendContainer
                .selectAll('div')
                .data(categoryCounts)
                .enter()
                .append('div')
                .style('cursor', 'pointer')
                .style('padding-top', '5px')
                .style('padding-bottom', '5px')
                .style('font-size', '14px')
                .text(d => `${d.key}: ${d.value} Channels`);

            // Add hover effect to the legend
            legendItems.on("mouseover", function(event, d) {
                tooltip.style("display", "none");

                d3.selectAll('rect')
                    .filter(dd => dd.key === d.key)
                    .style("fill", "#f5a623");

                // Change text color to blue on hover
                d3.select(this).style("color", "blue");
            })
            .on("mouseout", function(event, d) {
                d3.selectAll('rect')
                    .filter(dd => dd.key === d.key)
                    .style("fill", "steelblue");

                // Reset text color back to default
                d3.select(this).style("color", "black");
            });

            // Add instruction text for the format
            legendContainer.append("text")
                .attr("x", 0)
                .attr("y", 20 + legendItems.nodes().length * 20)
                .text("Format: category name - channel count")
                .style("font-size", "12px")
                .style("fill", "#555")
                .style("font-style", "italic");
        }

        // Create or update the bar chart
        function renderBarChart(categoryCounts) {
            const margin = { top: 20, right: 30, bottom: 60, left: 130 };

            // Set a constant height for the chart
            const height = 500; // Fixed height

            // Dynamically set the width of the SVG based on the screen size
            const width = window.innerWidth * 0.8;  
            const maxWidth = 600; 
            const barWidth = 0.8;

            // Adjust width to respect maxWidth
            const adjustedWidth = Math.min(width, maxWidth);

            // Clear any existing chart
            d3.select('#' + chartId).selectAll('svg').remove();

            const svg = d3.select('#' + chartId)
                .append('svg')
                .attr('width', adjustedWidth)
                .attr('height', height);

            const x = d3.scaleLinear()
                .domain([0, d3.max(categoryCounts, d => d.value)])
                .range([margin.left, adjustedWidth - margin.right]);

            const y = d3.scaleBand()
                .domain(categoryCounts.map(d => d.key))
                .range([margin.top, height - margin.bottom])
                .padding(0.1);

            const bars = svg.append('g')
                .selectAll('rect')
                .data(categoryCounts)
                .enter()
                .append('rect')
                .attr('x', x(0))
                .attr('y', d => y(d.key))
                .attr('width', d => Math.max(0, x(d.value) - x(0)))  
                .attr('height', y.bandwidth())
                .attr('fill', 'steelblue')
                .style("transition", "fill 0.3s ease");

            bars.on("mouseover", function(event, d) {
                d3.select(this).style("fill", "#f5a623");
                tooltip.style("display", "block")
                    .html(`
                        <strong>${d.key}</strong><br/>
                        Count: ${d.value}
                    `);
            })
            .on("mousemove", function(event) {
                tooltip.style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY + 10}px`);
            })
            .on("mouseout", function(event, d) {
                d3.select(this).style("fill", "steelblue");
                tooltip.style("display", "none");
            });

            svg.append('g')
                .selectAll('text')
                .data(categoryCounts)
                .enter()
                .append('text')
                .attr('x', d => x(d.value) + 5)
                .attr('y', d => y(d.key) + y.bandwidth() / 2)
                .attr('dy', '.35em')
                .text(d => d.value)
                .style('fill', 'white');

            svg.append('g')
                .attr('class', 'x-axis')
                .attr('transform', `translate(0,${height - margin.bottom})`)
                .call(d3.axisBottom(x).ticks(5));

            svg.append('g')
                .attr('class', 'y-axis')
                .attr('transform', `translate(${margin.left},0)`)
                .call(d3.axisLeft(y));

            svg.append('text')
                .attr('x', (margin.left + adjustedWidth) / 2)
                .attr('y', height - margin.bottom + 45)
                .attr('text-anchor', 'middle')
                .style('font-size', '14px')
                .text('Channel Count');

            svg.append('text')
                .attr('transform', 'rotate(-90)')
                .attr('x', -height / 2)
                .attr('y', margin.left - 110)
                .attr('text-anchor', 'middle')
                .style('font-size', '14px')
                .text('Channel Categories');
        }

        // Initialize the dropdown and chart
        populateCountryDropdown();
        updateChart();

        // Resize event handler
        window.addEventListener('resize', function() {
            renderBarChart(countChannelsByCategory(filterByCountry(selectedCountry)));
        });
    });
}


// Call the function to create the chart
createBarChart("data.csv", "chart6");
