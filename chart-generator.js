export function drawChart(canvas, trend) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.parentElement.offsetWidth;
    const height = canvas.height = 150; // Fixed height for chart area

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Grid (Cyberpunk style)
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < width; x += 40) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
    }
    for (let y = 0; y < height; y += 30) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
    }
    ctx.stroke();

    // Generate Candles
    const candleWidth = 10;
    const gap = 4;
    const totalCandles = Math.floor(width / (candleWidth + gap));

    let currentPrice = height / 2;
    let candles = [];

    for (let i = 0; i < totalCandles; i++) {
        // Random volatility
        let move = (Math.random() - 0.5) * 20;

        // Trend bias
        if (trend === 'LONG') {
            move += 2; // Slight upward bias
            if (i > totalCandles * 0.7) move += 3; // Pump at the end
        } else if (trend === 'SHORT') {
            move -= 2; // Slight downward bias
            if (i > totalCandles * 0.7) move -= 3; // Dump at the end
        }

        let open = currentPrice;
        let close = currentPrice - move; // Canvas Y is inverted (0 is top)

        // Keep within bounds
        if (close < 20) close = 20;
        if (close > height - 20) close = height - 20;

        let high = Math.min(open, close) - Math.random() * 10;
        let low = Math.max(open, close) + Math.random() * 10;

        candles.push({ x: i * (candleWidth + gap) + 10, open, close, high, low });
        currentPrice = close;
    }

    // Draw Candles
    candles.forEach(c => {
        const isGreen = c.close < c.open; // Remember Y inverted
        ctx.fillStyle = isGreen ? '#00FFA3' : '#FF2A6D';
        ctx.strokeStyle = isGreen ? '#00FFA3' : '#FF2A6D';

        // Wick
        ctx.beginPath();
        ctx.moveTo(c.x + candleWidth / 2, c.high);
        ctx.lineTo(c.x + candleWidth / 2, c.low);
        ctx.stroke();

        // Body
        const bodyY = Math.min(c.open, c.close);
        const bodyH = Math.abs(c.close - c.open) || 1; // At least 1px
        ctx.fillRect(c.x, bodyY, candleWidth, bodyH);
    });

    // Current Price Line
    const last = candles[candles.length - 1];
    if (last) {
        ctx.strokeStyle = '#fff';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(0, last.close);
        ctx.lineTo(width, last.close);
        ctx.stroke();

        // Price Label
        ctx.fillStyle = '#fff';
        ctx.font = '10px JetBrains Mono';
        ctx.fillText('$' + (10000 + Math.random() * 5000).toFixed(0), width - 40, last.close - 5);
    }
}
