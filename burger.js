function stars(number) {
	$("#starMask").css("width", (number * 42) + "px");
}

function formatDollars(value) {
	var dollars = Math.floor(value / 100);
	var cents = value - (dollars * 100);

	if (cents < 10) {
		cents = "0" + cents;
	}

	return dollars + "." + cents;
}

function progressBar(value, max, width) {
	var percent = value / max;
	var displayPercent = Math.floor(percent * 100);

	var fillWidth = width * percent;

	return {"fillWidth": fillWidth, "percent": displayPercent};
}

function withinBounds(obj1, obj2) {
	var ax1 = obj1.left;
	var ay1 = obj1.top;
	var ax2 = ax1 + 100;
	var ay2 = ay1 + 100;

	var bx1 = obj2.left;
	var by1 = obj2.top;
	var bx2 = bx1 + obj2.width;
	var by2 = by1 + obj2.height;

	var comp0 = ax1 < bx1;
	var comp1 = ax2 > bx2;
	var comp2 = ay1 < by1;
	var comp3 = ay2 > by2;

	return !(comp0 || comp1 || comp2 || comp3);
}

function bindMe(obj, method) {
	return function() {
		return method.apply(obj);
	};
}

function soundBuffer(filename) {
	if (!mechanics.mute) {
		var snd = new Audio(filename);

		snd.addEventListener('ended', function() {
			delete snd;
		}, false);

		snd.play();
	}
}

function getTime(seconds) {
	var minutes = Math.floor(seconds / 60);
	var seconds = Math.floor(seconds - minutes * 60);

	if (minutes < 10) {
		minutes = "0" + minutes;
	}

	if (seconds < 10) {
		seconds = "0" + seconds;
	}

	return minutes + ":" + seconds;
}

// returns true if two objects overlap
// pass in {top: int, left: int} as both objs
// 100px size is assumed
function overlaps(obj1, obj2) {
	var ax1 = obj1.left;
	var ay1 = obj1.top;
	var ax2 = ax1 + obj1.width;
	var ay2 = ay1 + obj1.height;

	var bx1 = obj2.left;
	var by1 = obj2.top;
	var bx2 = bx1 + obj2.width;
	var by2 = by1 + obj2.height;

	var comp0 = ax1 < bx2;
	var comp1 = ax2 > bx1;
	var comp2 = ay1 < by2;
	var comp3 = ay2 > by1;

	return (comp0 && comp1 && comp2 && comp3);
}

function hex2RGB(hex) {
	if (hex.indexOf("#") === 0) {
		hex = hex.slice(1);
	}

	return [parseInt("0x" + hex.slice(0, 2)), parseInt("0x" + hex.slice(2, 4)), parseInt("0x" + hex.slice(4))];
}

function RGB2hex(RGB) {
	var ret = "#";

	for (var x = 0; x < 3; x++) {
		var tmp = Math.round(RGB[x]);
		tmp = tmp.toString(16);
	
		if (tmp.length == 1) {
			tmp = "0" + tmp;
		}

		ret = ret + tmp;
	}

	return ret;
}

function colorGradient(start, stop, curStep, steps) {
	var startRGB = hex2RGB(start);
	var stopRGB = hex2RGB(stop);

	var newRGB = [];

	for (var x = 0; x < 3; x++) {
		if (startRGB[x] > stopRGB[x]) {
			var diff = startRGB[x] - stopRGB[x];

			var step = diff / steps;

			newRGB[x] = startRGB[x] - (step * curStep);
		} else if (startRGB[x] == stopRGB[x]) {
			newRGB[x] = startRGB[x];
		} else {
			var diff = stopRGB[x] - startRGB[x];

			var step = diff / steps;

			newRGB[x] = stopRGB[x] - (step * curStep);
		}
	}

	return RGB2hex(newRGB);
}
