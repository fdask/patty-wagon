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
