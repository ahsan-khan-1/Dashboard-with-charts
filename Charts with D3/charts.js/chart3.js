function createBarChart(dataUrl, chartId) {
	const svg = d3
		.select(`#${chartId}`)
		.append('svg')
		.attr('viewBox', '0 0 800 400')
		.attr('preserveAspectRatio', 'xMidYMid meet')
		.style('width', '100%')
		.style('height', 'auto');

	const margin = { top: 20, right: 80, bottom: 60, left: 60 };
	const width = 800 - margin.left - margin.right;
	const height = 400 - margin.top - margin.bottom;

	const chartGroup = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

	d3.csv(dataUrl).then((data) => {
		const countryCount = d3
			.rollups(
				data,
				(v) => v.length,
				(d) => d.Country
			)
			.sort((a, b) => b[1] - a[1]);

		const x = d3.scaleBand().range([0, width]).padding(0.1);

		const y = d3.scaleLinear().range([height, 0]);

		const color = d3
			.scaleOrdinal()
			.domain(countryCount.map((d) => d[0]))
			.range(d3.schemeCategory10);

		x.domain(countryCount.map((d) => d[0]));
		y.domain([0, d3.max(countryCount, (d) => d[1])]);

		chartGroup
			.append('g')
			.attr('transform', `translate(0,${height})`)
			.call(d3.axisBottom(x))
			.selectAll('text')
			.style('text-anchor', 'end')
			.attr('dx', '-.8em')
			.attr('dy', '.15em')
			.attr('transform', 'rotate(-45)');

		chartGroup.append('g').call(d3.axisLeft(y));

		const bars = chartGroup
			.selectAll('rect')
			.data(countryCount)
			.enter()
			.append('rect')
			.attr('x', (d) => x(d[0]))
			.attr('y', (d) => y(d[1]))
			.attr('width', x.bandwidth())
			.attr('height', (d) => height - y(d[1]))
			.attr('fill', (d) => color(d[0]))
			.attr('class', (d) => `bar-${d[0]}`);

		const tooltip = d3
			.select('body')
			.append('div')
			.attr('class', 'tooltip')
			.style('opacity', 0)
			.style('position', 'absolute')
			.style('background-color', 'white')
			.style('border', 'solid')
			.style('border-width', '1px')
			.style('border-radius', '5px')
			.style('padding', '10px');

		const legend = chartGroup
			.append('g')
			.attr('font-family', 'sans-serif')
			.attr('font-size', 10)
			.attr('class', 'legend');

		const legendGroup = chartGroup.append('g').attr('transform', `translate(${width - 80}, 0)`);

		legendGroup
			.append('text')
			.attr('class', 'legend-title')
			.attr('x', 0)
			.attr('y', -10)
			.attr('font-size', '12px')
			.attr('font-weight', 'bold')
			.text('Legend');

		legendGroup
			.append('text')
			.attr('class', 'legend-format')
			.attr('x', 0)
			.attr('y', 5)
			.text('Format: country name - count')
			.style('font-size', '10px')
			.style('fill', '#555')
			.style('font-style', 'italic');

		const legendItems = legendGroup
			.selectAll('.legend-item')
			.data(countryCount)
			.enter()
			.append('g')
			.attr('class', 'legend-item')
			.attr('transform', (d, i) => `translate(0,${i * 20 + 15})`)
			.style('cursor', 'pointer');

		legendItems
			.append('rect')
			.attr('x', 0)
			.attr('width', 19)
			.attr('height', 19)
			.attr('fill', (d) => color(d[0]));

		legendItems
			.append('text')
			.attr('x', 24)
			.attr('y', 9.5)
			.attr('dy', '0.32em')
			.text((d) => `${d[0]} (${d[1]} channels)`)
			.style('font-size', '10px');

		function highlightBar(country) {
			bars
				.transition()
				.duration(200)
				.style('opacity', (d) => (d[0] === country ? 1 : 0.2));

			const selectedBar = d3.select(`.bar-${country}`);
			const barData = selectedBar.data()[0];

			tooltip.transition().duration(200).style('opacity', 0.9);

			tooltip
				.html(`Country: ${country}<br>Channels: ${barData[1]}`)
				.style(
					'left',
					parseFloat(selectedBar.attr('x')) + parseFloat(selectedBar.attr('width')) / 2 + margin.left + 'px'
				)
				.style('top', parseFloat(selectedBar.attr('y')) + margin.top - 28 + 'px');
		}

		function resetBars() {
			bars.transition().duration(200).style('opacity', 1);

			tooltip.transition().duration(500).style('opacity', 0);
		}

		legendItems
			.on('mouseover', function (event, d) {
				highlightBar(d[0]);
			})
			.on('mouseout', resetBars);

		bars
			.on('mouseover', function (event, d) {
				highlightBar(d[0]);
			})
			.on('mouseout', resetBars);

		chartGroup
			.append('text')
			.attr('x', width / 2)
			.attr('y', height + margin.bottom - 5)
			.style('text-anchor', 'middle')
			.text('Country');

		chartGroup
			.append('text')
			.attr('transform', 'rotate(-90)')
			.attr('x', -height / 2)
			.attr('y', -margin.left + 15)
			.style('text-anchor', 'middle')
			.text('Number of YouTubers');
	});

	function handleResize() {
		const containerWidth = document.getElementById(chartId).clientWidth;

		svg.style('width', containerWidth + 'px');
	}

	window.addEventListener('resize', handleResize);
	handleResize();
}

createBarChart('data.csv', 'chart3');
