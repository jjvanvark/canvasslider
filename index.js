(function() {
  // General

  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');

  // Circle button

  var circleRadius = 100;
  var circleArc = Math.PI * 2;
  var centerX = canvas.width / 2;
  var centerY = canvas.height / 2;

  var buttonRadius = 10;

  var value = 0.45;

  // Plotter

  var spectrum = 40;
  var data = generateData(60);
  var plotted = null;

  var animator = 0;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Spectrum bg

    ctx.beginPath();
    ctx.arc(centerX, centerY, circleRadius + spectrum, 0, circleArc);
    ctx.fillStyle = 'lightBlue';
    ctx.fill();

    // Plotter

    if (plotted !== null) {
      function toGraph(startX, startY) {
        rads = -0.5 * Math.PI + circleArc * startX;
        radius = circleRadius + spectrum * (startY * animator);
        return {
          x: radius * Math.cos(rads) + centerX,
          y: radius * Math.sin(rads) + centerY,
        };
      }

      ctx.beginPath();

      graph = toGraph(plotted.start.x, plotted.start.y);
      ctx.moveTo(graph.x, graph.y);

      plotted.result.forEach(function(item) {
        cp1 = toGraph(item.cp1x, item.cp1y);
        cp2 = toGraph(item.cp2x, item.cp2y);
        it = toGraph(item.x2, item.y2);
        ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, it.x, it.y);
      });

      ctx.lineTo(graph.x, graph.y);

      ctx.strokeStyle = 'black';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fill();
    }

    // Background circle
    ctx.beginPath();
    ctx.arc(
      centerX,
      centerY,
      circleRadius,
      -0.25 * circleArc,
      circleArc * 0.75,
    );
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Button
    var rads = -0.5 * Math.PI + value * circleArc;

    ctx.beginPath();
    ctx.arc(centerX, centerY, circleRadius, -0.5 * Math.PI, rads);
    ctx.strokeStyle = 'purple';
    ctx.lineWidth = 10;
    ctx.stroke();

    var buttonX = circleRadius * Math.cos(rads) + centerX;
    var buttonY = circleRadius * Math.sin(rads) + centerY;

    ctx.beginPath();
    ctx.arc(buttonX, buttonY, buttonRadius, 0, circleArc);
    ctx.fillStyle = 'red';
    ctx.fill();
  }

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    centerX = canvas.width / 2;
    centerY = canvas.height / 2;

    draw();
  }

  resizeCanvas();
  plotted = plotter(data);
  draw();
  window.addEventListener('resize', resizeCanvas, false);

  // Events

  var dragging = false;

  canvas.addEventListener(
    'mousemove',
    function(event) {
      if (dragging) {
        var rads = Math.atan2(event.clientY - centerY, event.clientX - centerX);

        var r2 = rads + 0.5 * Math.PI;
        if (r2 < 0) {
          r2 += 2 * Math.PI;
        }

        newValue = r2 / (2 * Math.PI);
        if (newValue - value >= 0.9) {
          newValue = 0;
        } else if (value - newValue >= 0.9) {
          newValue = 1;
        }

        value = newValue;
        draw();
      }
    },
    false,
  );

  canvas.addEventListener(
    'mousedown',
    function(event) {
      var rads = -0.5 * Math.PI + value * circleArc;
      var buttonX = circleRadius * Math.cos(rads) + centerX;
      var buttonY = circleRadius * Math.sin(rads) + centerY;

      if (
        Math.sqrt(
          (event.clientX - buttonX) * (event.clientX - buttonX) +
            (event.clientY - buttonY) * (event.clientY - buttonY),
        ) < buttonRadius
      ) {
        dragging = true;
      }
    },
    false,
  );

  canvas.addEventListener(
    'mouseup',
    function() {
      dragging = false;
    },
    false,
  );

  canvas.addEventListener(
    'mouseout',
    function() {
      dragging = false;
    },
    false,
  );

  // Random data generator

  function generateData(amount) {
    var result = [];
    for (var i = 0; i < amount; i++) {
      result.push(Math.random());
    }
    return result;
  }

  //

  function plotter(data) {
    var k = 1;
    var size = data.length;
    var last = size - 2;

    var rData = data.map(function(item, index) {
      return {
        x1: index / (data.length - 1),
        y1: item,
      };
    });

    var result = [];

    for (var i = 0; i < size - 1; i++) {
      var x0 = i ? rData[i - 1].x1 : rData[i].x1;
      var y0 = i ? rData[i - 1].y1 : rData[i].y1;

      var x1 = rData[i].x1;
      var y1 = rData[i].y1;

      var x2 = rData[i + 1].x1;
      var y2 = rData[i + 1].y1;

      var x3 = i !== last ? rData[i + 2].x1 : x2;
      var y3 = i !== last ? rData[i + 2].y1 : y2;

      var cp1x = x1 + ((x2 - x0) / 6) * k;
      var cp1y = y1 + ((y2 - y0) / 6) * k;

      var cp2x = x2 - ((x3 - x1) / 6) * k;
      var cp2y = y2 - ((y3 - y1) / 6) * k;

      result[i] = {
        x0,
        y0,
        x1,
        y1,
        x2,
        y2,
        x3,
        y3,
        cp1x,
        cp1y,
        cp2x,
        cp2y,
      };
    }

    return {start: {x: rData[0].x1, y: rData[0].y1}, result};
  }

  // Simple animation

  setTimeout(function() {
    var counter = 0;

    const inter = setInterval(function() {
      counter += 0.02;
      if (counter >= 1) {
        animator = 1;
        clearInterval(inter);
        window.requestAnimationFrame(draw);
      } else {
        //animator = counter * counter;
        animator =
          counter < 0.5
            ? 4 * counter * counter * counter
            : (counter - 1) * (2 * counter - 2) * (2 * counter - 2) + 1;
        window.requestAnimationFrame(draw);
      }
    }, 16);
  }, 2000);
})();
