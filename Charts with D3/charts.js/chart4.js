function createLineChart(dataUrl, chartId) {
	const svg = d3
		.select(`#${chartId}`)
		.append('svg')
		.attr('viewBox', '0 0 800 400')
		.attr('preserveAspectRatio', 'xMidYMid meet')
		.style('width', '100%')
		.style('height', 'auto');

	const margin = { top: 20, right: 80, bottom: 50, left: 90 };
	const width = 800 - margin.left - margin.right;
	const height = 400 - margin.top - margin.bottom;

	const chartGroup = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

	d3.json(dataUrl).then((data) => {
		const years = data.map((d) => d.year);
		const channels = Object.keys(data[0]).filter((key) => key !== 'year');

		const x = d3.scaleLinear().domain(d3.extent(years)).range([0, width]);

		const y = d3
			.scaleLinear()
			.domain([0, d3.max(data, (d) => Math.max(...channels.map((channel) => d[channel])))])
			.range([height, 0]);

		const line = d3
			.line()
			.x((d) => x(d.year))
			.y((d) => y(d.value));

		const color = d3.scaleOrdinal(d3.schemeCategory10);

		chartGroup
			.append('g')
			.attr('transform', `translate(0,${height})`)
			.call(d3.axisBottom(x).tickFormat(d3.format('d')));

		chartGroup.append('g').call(d3.axisLeft(y));

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

		const lines = new Map();
		const points = new Map();

		channels.forEach((channel) => {
			const channelData = data.map((d) => ({
				year: d.year,
				value: d[channel],
			}));

			const path = chartGroup
				.append('path')
				.datum(channelData)
				.attr('class', `line-${channel.replace(/\s+/g, '-')}`)
				.attr('fill', 'none')
				.attr('stroke', color(channel))
				.attr('stroke-width', 2)
				.attr('d', line)
				.style('opacity', 1);

			lines.set(channel, path);

			const circles = chartGroup
				.selectAll(`.point-${channel.replace(/\s+/g, '-')}`)
				.data(channelData)
				.enter()
				.append('circle')
				.attr('class', `point-${channel.replace(/\s+/g, '-')}`)
				.attr('cx', (d) => x(d.year))
				.attr('cy', (d) => y(d.value))
				.attr('r', 5)
				.attr('fill', color(channel))
				.style('opacity', 1);

			points.set(channel, circles);

			circles
				.on('mouseover', function (event, d) {
					d3.select(this).transition().duration(200).attr('r', 8);

					tooltip.transition().duration(200).style('opacity', 0.9);
					tooltip
						.html(`${channel}<br>Year: ${d.year}<br>Views: ${d.value.toLocaleString()}`)
						.style('left', event.pageX + 10 + 'px')
						.style('top', event.pageY - 10 + 'px');
				})
				.on('mouseout', function () {
					d3.select(this).transition().duration(200).attr('r', 5);

					tooltip.transition().duration(500).style('opacity', 0);
				});
		});

		const legendGroup = chartGroup.append('g').attr('transform', `translate(${width - 80}, 0)`);

		legendGroup
			.append('text')
			.attr('class', 'legend-title')
			.attr('x', 0)
			.attr('y', -10)
			.attr('font-size', '12px')
			.attr('font-weight', 'bold')
			.text('Legend');

		const legendItems = legendGroup
			.selectAll('g')
			.data(channels)
			.enter()
			.append('g')
			.attr('transform', (d, i) => `translate(0,${i * 20 + 15})`)
			.style('cursor', 'pointer');

		legendItems.append('rect').attr('x', 0).attr('width', 19).attr('height', 19).attr('fill', color);

		legendItems
			.append('text')
			.attr('x', 24)
			.attr('y', 9.5)
			.attr('dy', '0.32em')
			.text((d) => d)
			.style('font-size', '10px');

		legendItems
			.on('mouseover', function (event, channel) {
				lines.forEach((line, ch) => {
					if (ch !== channel) {
						line.transition().duration(200).style('opacity', 0.2);
						points.get(ch).transition().duration(200).style('opacity', 0.2);
					}
				});

				lines.get(channel).transition().duration(200).style('opacity', 1).attr('stroke-width', 4);
				points.get(channel).transition().duration(200).style('opacity', 1).attr('r', 8);
			})
			.on('mouseout', function () {
				lines.forEach((line) => {
					line.transition().duration(200).style('opacity', 1).attr('stroke-width', 2);
				});
				points.forEach((pointSet) => {
					pointSet.transition().duration(200).style('opacity', 1).attr('r', 5);
				});
			});

		chartGroup
			.append('text')
			.attr('x', width / 2)
			.attr('y', height + margin.bottom - 10)
			.style('text-anchor', 'middle')
			.text('Year');

		chartGroup
			.append('text')
			.attr('transform', 'rotate(-90)')
			.attr('x', -height / 2)
			.attr('y', -margin.left + 15)
			.style('text-anchor', 'middle')
			.text('Average Views');
	});

	function handleResize() {
		const containerWidth = document.getElementById(chartId).clientWidth;
		svg.style('width', containerWidth + 'px');
	}

	window.addEventListener('resize', handleResize);
	handleResize();
}

createLineChart('data.json', 'chart4');