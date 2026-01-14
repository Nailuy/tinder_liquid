// State management for charts
export function initChart(canvas, trend) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.parentElement.offsetWidth;
    const height = canvas.height = canvas.parentElement.offsetHeight;

    // Grid
    drawGrid(ctx, width, height);

    // Initial Data
    const candleWidth = 8;
    const gap = 4;
    // Fill 70% of screen initially so we have room to animate
    const initialCandles = Math.floor((width * 0.75) / (candleWidth + gap));

    let currentPrice = height / 2;
    let candles = [];

    for (let i = 0; i < initialCandles; i++) {
        let move = (Math.random() - 0.5) * 15;
        // Bias based on scenario trend
        if (trend === 'LONG') move += Math.random() * 2;
        if (trend === 'SHORT') move -= Math.random() * 2;

        let open = currentPrice;
        let close = currentPrice - move;

        // Bounds
        if (close < 20) close = 20 + Math.random() * 10;
        if (close > height - 20) close = height - 20 - Math.random() * 10;

        let high = Math.min(open, close) - Math.random() * 8;
        let low = Math.max(open, close) + Math.random() * 8;

        candles.push({ x: i * (candleWidth + gap) + 10, open, close, high, low });
        currentPrice = close;
    }

    drawCandles(ctx, candles, candleWidth);
    drawPriceLine(ctx, width, currentPrice);

    return { ctx, width, height, candles, currentPrice, candleWidth, gap };
}

export function appendCandle(state, direction) {
    const { ctx, width, height, candles, candleWidth, gap } = state;

    // Calculate new candle based on result direction
    // direction > 0 = PUMP (Green), direction < 0 = DUMP (Red)
    let move = (Math.random() * 15 + 5) * (direction > 0 ? 1 : -1);

    let open = state.currentPrice;
    let close = state.currentPrice - move; // Y inverted

    // Keep largely within bounds but allow breakouts
    if (close < 10) close = 10;
    if (close > height - 10) close = height - 10;

    let high = Math.min(open, close) - Math.random() * 5;
    let low = Math.max(open, close) + Math.random() * 5;

    const nextX = candles[candles.length - 1].x + candleWidth + gap;

    // Shift if out of view
    if (nextX > width - 10) {
        candles.shift();
        candles.forEach(c => c.x -= (candleWidth + gap));
    }

    const newCandle = { x: candles.length > 0 ? candles[candles.length - 1].x + candleWidth + gap : 10, open, close, high, low };
    candles.push(newCandle);
    state.currentPrice = close;

    // Redraw
    ctx.clearRect(0, 0, width, height);
    drawGrid(ctx, width, height);
    drawCandles(ctx, candles, candleWidth);
    drawPriceLine(ctx, width, close, direction > 0 ? '#00FFA3' : '#FF2A6D');

    return state;
}

function drawGrid(ctx, w, h) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < w; x += 40) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
    for (let y = 0; y < h; y += 40) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
    ctx.stroke();
}

function drawCandles(ctx, candles, w) {
    candles.forEach(c => {
        const isGreen = c.close < c.open;
        ctx.fillStyle = isGreen ? '#00FFA3' : '#FF2A6D';
        ctx.strokeStyle = isGreen ? '#00FFA3' : '#FF2A6D';

        ctx.beginPath();
        ctx.moveTo(c.x + w / 2, c.high);
        ctx.lineTo(c.x + w / 2, c.low);
        ctx.stroke();

        const bodyY = Math.min(c.open, c.close);
        const bodyH = Math.abs(c.close - c.open) || 1;
        ctx.fillRect(c.x, bodyY, w, bodyH);
    });
}

function drawPriceLine(ctx, w, price, color = '#fff') {
    ctx.strokeStyle = color;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, price);
    ctx.lineTo(w, price);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = color;
    ctx.font = '10px JetBrains Mono';
    ctx.fillText('LIVE', w - 30, price - 5);
}
