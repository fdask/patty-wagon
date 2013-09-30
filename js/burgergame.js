function getDate() {
	var ret = new Date();

	var month = "" + ret.getMonth();

	if (month.length < 2) {
		month = "0" + month;
	}

	var day = "" + ret.getDay();

	if (day.length < 2) {
		day = "0" + day;
	}

	return ret.getFullYear() + "-" + month + "-" + day;
}

function supports_html5_storage() {
	try {
		return 'localStorage' in window && window['localStorage'] !== null;
	} catch (e) {
		return false;
	}
}

soundManager.setup({
	url: 'swf/',
	flashVersion: 9,
	debugMode: false,
	onready: function() {
		soundManager.createSound({
			id: 'bell',
			url: 'sounds/bell.mp3',
		});

		soundManager.createSound({
			id: 'boo',
			url: 'sounds/boo.mp3',
		});

		soundManager.createSound({
			id: 'churchbell',
			url: 'sounds/churchbell.mp3',
		});

		soundManager.createSound({
			id: 'error',
			url: 'sounds/error.mp3',
		});

		soundManager.createSound({
			id: 'hurray',
			url: 'sounds/hurray.mp3',
		});

		soundManager.createSound({
			id: 'orderup',
			url: 'sounds/orderup.mp3',
		});

		soundManager.createSound({
			id: 'patty',
			url: 'sounds/patty.mp3',
		});

		soundManager.createSound({
			id: 'register',
			url: 'sounds/register.mp3',
		});

		soundManager.createSound({
			id: 'tick',
			url: 'sounds/tick.mp3',
		});
	}
});

function fullStars(value, max) {
	var ret = "";

	for (x = 0; x < value; x++) {
		ret += "<img src='images/star_on.png' />";
	}

	for (; x < max; x++) {
		ret += "<img src='images/star_off.png' />";
	}

	return ret;
}

function stars(number) {
	$("#starMask").css("width", (number * 18) + "px");
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

var mechanics = new function() {
	// holds the timer for when the next order will come in
	this.nextOrder = null;

	// number of seconds a buff lasts
	this.buffDuration = 180;

	// time in ms before we decrement patties on the preptable
	this.heatLampInterval = 1000;

	// how long to wait before first order comes in
	this.initialOrderDelayLower = 8000;
	this.initialOrderDelayUpper = 10000;

	// how often orders come in (in milliseconds)
	this.orderFrequencies = {
		0 : {
			lower: 18000,
			upper: 100000
		},
		1 : {
			lower: 17000,
			upper: 90000
		},
		2 : {
			lower: 15000,
			upper: 80000
		},
		3 : {
			lower: 10000,
			upper: 60000
		}
	};

	this.orderFrequencyLower = 20000;
	this.orderFrequencyUpper = 120000;

	// values in seconds indicating how long a customer will wait for an order (until it expires)
	this.orderMaxAgeUpper = 180; // maximum for order wait time
	this.orderMaxAgeLower = 180; // minimum value for random order wait time

	this.paused = false; // system wide pause setting
	this.overlayPaused = false; // if we've paused by using the popup windows

	this.prepTableSlots = {
		0: 3,
		1: 5,
		2: 8,
		3: 10
	};

	this.prepTableExpire = 120; // number of seconds a patty lives on the prep table
	this.prepTableMaxSlots = 10;

	// ms for each cook() iteration at diff oven temps
	this.griddleSizes = {
		0 : {
			width: 250,
			height: 230
		},
		1 : {
			width: 370,
			height: 230
		},
		2 : {
			width: 370,
			height: 350
		},
		3 : {
			width: 500,
			height: 350
		}
	};

	this.griddleTemps = {
		0 : {
			low: 1500,
			med: 1000,
			high: 500, 
		},
		1 : {
			low: 1400,
			med: 900,
			high: 400 
		},
		2 : {
			low: 1300,
			med: 800,
			high: 300
		},
		3 : {
			low: 1200,
			med: 700,
			high: 200
		}
	};

	this.pattyMaxDone = 120; // max doneness of a side before we blink out
	this.pattyMaxFlips = 3; // number of flips before a patty disentegrates
	this.pattyBurnNegChance = 20;
	this.pattyReUpCost = 10000; // cost in cents of getting another shipment of patties
	this.fireGrowInterval = 8000; // number of ms between each fire grow
	this.fireGrowSize = 20; // number of px a fire grows on each side
	this.fireEndDelay = 10000; // how long a fire burns once it's filled up the griddle
	this.fireDebug = false;
	this.fireCount = 0;

	this.crudShrinkInterval = 10000; // ms between each shrink of crud
	this.crudShrinkSize = 5; // number of pixels on each side the crud shrinks
	this.crudDebug = false;
	this.crudCount = 0;

	// scoring
	this.tipAmountMultiplier = 1; // basically the level of tips you receive
	this.tipAmountPercentageLower = 2;
	this.tipAmountPercentageUpper = 30;

	this.userDebug = false;
	this.dragDebug = false;
	this.placementDebug = false;
	this.orderDebug = false;
	this.scoringDebug = false;

	this.orderSpeedBonus = {
		percent: 10,
		bonus: 10
	};

	this.pattyScores = {
		danger: {
			score: 0,
			range: 25,
			yulp: 1
		},
		bad: {
			score: 0,
			range: 20,
			yulp: 1
		},
		ok: {
			score: 10,
			range: 15,
			yulp: 2
		},
		great: {
			score: 20,
			range: 8,
			yulp: 3
		},
		perfect: {
			score: 50,
			range: 0,
			yulp: 4
		},
		burnt: {
			score: 0,
			yulp: 1
		}
	};		

	this.pattyScoresPrint = function(prefix) {
		prefix = typeof prefix !== 'undefined' ? prefix : "";

		console.log(prefix + "Burger Scoring Chart");
		console.log(prefix + "BURNT: Anything over 100%");
		console.log(prefix + "PERFECT: 100 to " + (100 - this.pattyScores.perfect.range));
		console.log(prefix + "GREAT: " + ((100 - this.pattyScores.perfect.range) - 1) + " to " + (100 - this.pattyScores.great.range));
		console.log(prefix + "OK: " + ((100 - this.pattyScores.great.range) - 1) + " to " + (100 - this.pattyScores.ok.range));
		console.log(prefix + "BAD: " + ((100 - this.pattyScores.ok.range) - 1) + " to " + (100 - this.pattyScores.bad.range));
		console.log(prefix + "DANGER: " + ((100 - this.pattyScores.bad.range) - 1) + " to 0");
	}

	this.heatModifiers = {
		sizzling: {
			range: 20,
			subtract: 0
		},
		warm: {
			range: 50,
			subtract: 10
		},
		cold: {
			range: 75,
			subtract: 40
		},
		stale: {
			subtract: 80 
		} 
	}

	this.heatModifiersPrint = function(prefix) {
		prefix = typeof prefix !== 'undefined' ? prefix : "";

		console.log(prefix + "HeatModifier Scale:");
		console.log(prefix + "SIZZLING: 100 to " + (100 - this.heatModifiers.sizzling.range));
		console.log(prefix + "WARM: " + ((100 - this.heatModifiers.sizzling.range) - 1) + " to " + (100 - this.heatModifiers.warm.range));
		console.log(prefix + "COLD: " + ((100 - this.heatModifiers.warm.range) - 1) + " to " + (100 - this.heatModifiers.cold.range));
		console.log("STALE: " + ((100 - this.heatModifiers.cold.range) - 1) + " to 0");
	};

	// percentage of time an order will be for a yulp reviewer
	this.yulpFrequency = 5;

	// a popularity modifier that factors in to the scoring!
	this.popularity = 1;

	this.pause = function() {
		this.paused = true;

		soundManager.pauseAll();
		prepTable.stopTimer();
		orderCollection.stopTimer();
		griddle.turnOff();

		// disable the garbage icons
		$(".garbageIcon").each(function(k, v) {
			$(v).off("click");
		});

		heatLamp.stopTimer();
		twitter.stopTimer();
		sauce.stopTimer();
		helper.stopTimer();

		window.clearTimeout(this.nextOrder);

		$("[id^=patty]").draggable("disable");
		$("#lowButton, #medButton, #highButton, #fillOrder").attr("disabled", "true");
		$("#pauseButton, #resumeButton").toggle();
	};

	this.resume = function() {
		if (this.paused) {
			this.paused = false;

			soundManager.resumeAll();
			prepTable.startTimer();
			orderCollection.startTimer();

			$(".garbageIcon").each(function(k, v) {
				$(v).on("click", function(e) {
					player.garbage++;
					prepTable.removePatty($(this).parent().attr("id"));
				});
			});

			if (heatLamp.active) {
				heatLamp.startTimer();
			}

			if (twitter.active) {
				twitter.startTimer();
			}

			if (sauce.active) {
				sauce.startTimer();
			}

			if (helper.active) {
				helper.startTimer();
			}

			if (griddle.cookInterval > 0) {
				griddle.turnOn(griddle.cookInterval);
			}

			$("#lowButton, #medButton, #highButton, #fillOrder").removeAttr("disabled");
			$("[id^=patty]").draggable("enable");

			this.nextOrder = window.setTimeout(function() {
				var order = new Order();
				var val = Math.floor(Math.random() * (mechanics.prepTableSlots[player.upgrades.prepTableSize.level] - 1)) + 1;

				if (mechanics.orderDebug) {
					console.log("Setting up the next order timer...");
				}

				order.burgerCount = val;
				order.maxAge = Math.floor(Math.random() * (mechanics.orderMaxAgeUpper - mechanics.orderMaxAgeLower)) + mechanics.orderMaxAgeLower;
				orderCollection.addOrder(order);
			}, Math.floor(Math.random() * (mechanics.orderFrequencies[player.upgrades.truckExterior.level].upper - mechanics.orderFrequencies[player.upgrades.truckExterior.level].lower)) + mechanics.orderFrequencies[player.upgrades.truckExterior.level].lower);

			$("#pauseButton, #resumeButton").toggle();
		}
	};

	this.popUpDefaults = {
		autoOpen: false,
		closeOnEscape: true,
		dialogClass: 'popUp',
		draggable: false,
		modal: true,
		resizable: false,
		height: 500,
		width: 800,	
		maxHeight: 500,
		position: {
			my: 'center top', 
			at: 'center top', 
			of: window
		},
		open: function(e, ui) {
			if (!mechanics.paused) {
				mechanics.pause();
				mechanics.overlayPaused = true;
			}
		},
		close: function(e, ui) {
			if (mechanics.overlayPaused) {
				mechanics.resume();
				mechanics.overlayPaused = false;
			}
		}
	};

	this.upgrades = {
		beefQuality: {
			price: 50,
			name: 'Beef Quality',
			description: 'A higher beef quality gives you more flips before your patties break up, and acts as a multiplier on your final order scores!',
			maxLevel: 3,
			0: {
				beefQuality: 1,
				maxFlips: 3
			},
			1: {
				beefQuality: 1.1,
				maxFlips: 4
			},
			2: {
				beefQuality: 1.25,
				maxFlips: 5
			},
			3: {
				beefQuality: 1.5,
				maxFlips: 6
			}
		},
		griddleSize: {
			price: 50,
			name: 'Griddle Size',
			description: 'Increases the size of your griddle to let you fit more patties on at a time.',
			maxLevel: 3
		},
		griddleTemp: {
			price: 50,
			name: 'Griddle Temperature',
			description: 'Makes all three settings on your griddle just a little hotter, letting you get those patties out faster.',
			maxLevel: 3
		},
		truckExterior: {
			price: 50,
			name: 'Truck Exterior',
			description: 'By improving the look of the outside of your truck, you will increase the flow of customers!',
			maxLevel: 3
		},
		prepTableSize: {
			price: 50,
			name: 'Prep Table Size',
			description: 'Increases the size of your prep table to let you fit more patties on at a time.',
			maxLevel: 3
		},
		buffEnhance: {
			price: 50,
			name: 'Buff Enhance',
			description: 'Upgrades here give you a longer duration on the heat lamp, twitter, special sauce, and assistant buffs!',
			maxLevel: 3,
			0: 120,
			1: 160,
			2: 200,
			3: 240
		},
		pattiesPerDay: {
			price: 50,
			name: 'Patties Per Day',
			description: 'Want more burgers per day?  Upgrade this!',
			maxLevel: 3,
			0: 30,
			1: 40,
			2: 50,
			3: 60
		}
	};

	this.buffs = {
		fireExtinguisher: {
			price: 50,
			id: 'buffFireExtinguisher',
			name: 'Fire Extinguisher',
			description: 'This item can be used to instantly put out grease fires on your griddle.',
			click: function() {
				if (!mechanics.paused) {
					if (mechanics.fireDebug) {
						console.log("using an extinguisher to remove all fires!");
					}

					for (var x = 0; x < griddle.fires.length; x++) {
						griddle.fires[x].destroy();
					}

					soundManager.getSoundById('hurray').play();
					player.buffs.fireExtinguisher.count--;
					mechanics.updateBuffs();
				}
			}
		},
		microwave: {
			price: 50,
			id: 'buffMicrowave',
			name: 'Microwave',
			description: 'Use this buff to instantly fulfill an order.  It takes burgers directly out of your stash, cooks them and sends them out!  Note that microwaved burgers will not get top quality points or tips.',
			click: function() {
				if (!mechanics.paused) {
					if (orderCollection.currentOrder) {
						var orderCount = orderCollection.getOrder(orderCollection.currentOrder).burgerCount;

						if (player.dailyPatties >= orderCount) {
							// create the patties
							var patties = [];

							for (var x = 0; x < orderCount; x++) {
								var patty = new Patty(-50, -50);

								// set the doneness
								patty.curSide = 100 - (mechanics.pattyScores.ok.range - 1);
								patty.flipSide = 100 - (mechanics.pattyScores.ok.range - 1);

								// set the heat
								patty.remain = 100 - (mechanics.heatModifiers.warm.range);	
								patty.max = 100;

								player.dailyPatties--;

								if (player.dailyPatties == 0) {
									$("#curBurgers").html("<span id='zeroBurgs'>0</span>");
									$("#outOfBurgers").dialog("open");
								} else {
									$("#curBurgers").html(player.dailyPatties);
								}

								patties.push(patty);
							}

							// fill the order!
							orderCollection.fillOrder(patties);

							soundManager.getSoundById('hurray').play();

							player.buffs.microwave.count--;
							mechanics.updateBuffs();
						} else {
							soundManager.getSoundById('error').play();
						}
					} else {
						soundManager.getSoundById('error').play();
					}
				}
			}
		},
		scraper: {
			price: 50,
			id: 'buffScraper',
			name: 'Metal Scraper',
			description: 'This buff will instantly remove any dead spots on your grill left behind from burnt burgers.',
			click: function() {
				if (!mechanics.paused) {
					// remove all crud
					if (mechanics.crudDebug) {
						console.log("Using scraper to remove all crud!");
					}

					for (var x = 0; x < griddle.crud.length; x++) {
						griddle.removeCrud(griddle.crud[x].id);
					}

					player.buffs.scraper.count--;
					soundManager.getSoundById('hurray').play();

					mechanics.updateBuffs();
				}
			}
		},
		pause: {
			price: 50,
			id: 'buffPause',
			name: 'Pause Button',
			description: 'Turns the heat off to your griddle, and keeps all the burgers on it held at their current level of doneness until you turn the heat back on!',
			click: function() {
				if (!mechanics.paused) {
					griddle.turnOff();
					$("#lowButton").css("background-color", "");
					$("#medButton").css("background-color", "");
					$("#highButton").css("background-color", "");

					player.buffs.pause.count--;
					soundManager.getSoundById('hurray').play();
					mechanics.updateBuffs();
				}
			}
		},
		heatLamp: {
			price: 50,
			id: 'buffHeatLamp',
			name: 'Heat Lamp',
			description: 'Slows down the temperature drop of burgers sitting on your prep table.',
			click: function() {
				if (!mechanics.paused) {
					if (heatLamp.active == false) {
						heatLamp.startTimer();
						player.buffs.heatLamp.count--;
						mechanics.updateBuffs();
					}
				}
			}
		},
		twitter: {
			price: 50,
			id: 'buffTwitter',
			name: 'Twitter Post',
			description: 'Post to Twitter to attract more visitors to your food truck!',
			click: function() {
				if (!mechanics.paused) {
					if (twitter.active == false) {
						twitter.startTimer();
						player.buffs.twitter.count--;
						mechanics.updateBuffs();
					}
				}
			}
		},
		sauce: {
			price: 50,
			id: 'buffSauce',
			name: 'Secret Sauce',
			description: 'This buff makes all your burgers taste perfect to the customers, regardless of how cooked (or uncooked) they actually are.',
			click: function() {
				if (!mechanics.paused) {
					if (sauce.active == false) {
						sauce.startTimer();
						player.buffs.sauce.count--;
						mechanics.updateBuffs();
					}
				}
			}
		},
		helper: {
			price: 50,
			id: 'buffHelper',
			name: 'Hire an Assistant',
			description: 'Let someone else do the work!  With this buff enabled, all your patties will be automatically flipped for you once they reach 100%!  Note that you still need to move burgers off the grill to the prep table.',
			click: function() {
				if (!mechanics.paused) {
					if (helper.active == false) {
						helper.startTimer();
						player.buffs.helper.count--;
						mechanics.updateBuffs();
					}
				}
			}
		}
	};

	this.updateBuffs = function() {
		var keys = Object.keys(this.buffs);

		for (var x = 0; x < keys.length; x++) {
			$("#" + this.buffs[keys[x]].id + "Count").html(player.buffs[keys[x]].count);

			if (player.buffs[keys[x]].count > 0) {
				$("#" + this.buffs[keys[x]].id)
					.css("background-image", "url('images/" + keys[x] + "_on.png')")
					.off("click")
					.on("click", this.buffs[keys[x]].click);
			} else {
				if (player.buffs[keys[x]].count < 0) {
					player.buffs[keys[x]].count = 0;
				}

				$("#" + this.buffs[keys[x]].id)
					.css("background-image", "url('images/" + keys[x] + "_off.png')")
					.off("click");
			}
		}	
	};
};

var heatLamp = new function() {
	this.timer = null;
	this.active = false;
	this.duration = mechanics.buffDuration;

	this.startTimer = function() {
		this.active = true;
		this.timer = window.setInterval(this.draw, 1000);
		mechanics.heatLampInterval = 1500;

		this.draw();
	}

	this.stopTimer = function() {
		window.clearInterval(this.timer);
		this.timer == null;
	}

	this.draw = function() {
		heatLamp.duration--;

		var pb = progressBar(heatLamp.duration, mechanics.buffDuration, $("#buffHeatLamp").width());

		if ($("#buffHeatLamp .progressBar").length > 0) {
			$("#buffHeatLamp .progressBar").css("width", pb.fillWidth);
		} else {
			$("#buffHeatLamp").append("<div class='progressBar' style='position: absolute; top: 0px; border: 1px solid black; height: 10px; background-color: red; width: " + pb.fillWidth + "px;'></div>");
		}

		if (heatLamp.duration == 8) {
			soundManager.getSoundById('tick').play();
		} else if (heatLamp.duration == 0) {
			heatLamp.active = false;
			heatLamp.stopTimer();
			
			// reset the duration
			heatLamp.duration = mechanics.buffDuration;

			// reset the heatlamp mechanics to their default
			mechanics.heatLampInterval = 1000;	

			// delete the timer div
			$("#buffHeatLamp .progressBar").remove();
		}
	}
};

var twitter = new function() {
	this.timer = null;
	this.active = false;
	this.duration = mechanics.buffDuration;

	this.startTimer = function() {
		this.active = true;
		this.timer = window.setInterval(this.draw, 1000);

		// initialize the improved mechanics
		mechanics.orderFrequencyLower = 10000;
		mechanics.orderFrequencyUpper = 30000; 

		this.draw();
	}

	this.stopTimer = function() {
		window.clearInterval(this.timer);
		this.timer == null;
	}

	this.draw = function() {
		twitter.duration--;

		var pb = progressBar(twitter.duration, mechanics.buffDuration, $("#buffTwitter").width());

		if ($("#buffTwitter .progressBar").length > 0) {
			$("#buffTwitter .progressBar").css("width", pb.fillWidth);
		} else {
			$("#buffTwitter").append("<div class='progressBar' style='position: absolute; top: 0px; border: 1px solid black; height: 10px; background-color: red; width: " + pb.fillWidth + "px;'></div>");
		}

		if (twitter.duration == 8) {
			soundManager.getSoundById('tick').play();
		} else if (twitter.duration == 0) {
			twitter.active = false;
			twitter.stopTimer();
			
			// reset the duration
			twitter.duration = mechanics.buffDuration;

			// reset the mechanics back to their default
			mechanics.orderFrequencyLower = 20000;
			mechanics.orderFrequencyUpper = 120000; 

			// delete the timer div
			$("#buffTwitter .progressBar").remove();
		}
	}
};

var sauce = new function() {
	this.timer = null;
	this.active = false;
	this.duration = mechanics.buffDuration;

	this.startTimer = function() {
		this.active = true;
		this.timer = window.setInterval(this.draw, 1000);

		// initialize the improved mechanics

		this.draw();
	}

	this.stopTimer = function() {
		window.clearInterval(this.timer);
		this.timer == null;
	}

	this.draw = function() {
		sauce.duration--;

		var pb = progressBar(sauce.duration, mechanics.buffDuration, $("#buffSauce").width());

		if ($("#buffSauce .progressBar").length > 0) {
			$("#buffSauce .progressBar").css("width", pb.fillWidth);
		} else {
			$("#buffSauce").append("<div class='progressBar' style='position: absolute; top: 0px; border: 1px solid black; height: 10px; background-color: red; width: " + pb.fillWidth + "px;'></div>");
		}

		if (sauce.duration == 8) {
			soundManager.getSoundById('tick').play();
		} else if (sauce.duration == 0) {
			sauce.active = false;
			sauce.stopTimer();
			
			// reset the duration
			sauce.duration = mechanics.buffDuration;

			// reset the mechanics back to their default

			// delete the timer div
			$("#buffSauce .progressBar").remove();
		}
	}
};

var helper = new function() {
	this.timer = null;
	this.active = false;
	this.duration = mechanics.buffDuration;

	this.startTimer = function() {
		this.active = true;
		this.timer = window.setInterval(this.draw, 1000);

		// initialize the improved mechanics

		this.draw();
	}

	this.stopTimer = function() {
		window.clearInterval(this.timer);
		this.timer == null;
	}

	this.draw = function() {
		helper.duration--;

		var pb = progressBar(helper.duration, mechanics.buffDuration, $("#buffHelper").width());

		if ($("#buffHelper .progressBar").length > 0) {
			$("#buffHelper .progressBar").css("width", pb.fillWidth);
		} else {
			$("#buffHelper").append("<div class='progressBar' style='position: absolute; top: 0px; border: 1px solid black; height: 10px; background-color: red; width: " + pb.fillWidth + "px;'></div>");
		}

		if (helper.duration == 8) {
			soundManager.getSoundById('tick').play();
		} else if (helper.duration == 0) {
			helper.active = false;
			helper.stopTimer();
			
			// reset the duration
			helper.duration = mechanics.buffDuration;

			// reset the mechanics back to their default

			// delete the timer div
			$("#buffHelper .progressBar").remove();
		}
	}
};

var prepTable = new function() {
	this.patties = [];
	this.pattyCount = 0;
	this.timer = null;

	this.addPatty = function(patty) {
		if (this.patties.length < mechanics.prepTableSlots[player.upgrades.prepTableSize.level]) {
			var newId = this.pattyCount;
			this.pattyCount++;
			patty.id = "prep" + newId;
			patty.idHash = "#" + patty.id;
			patty.max = mechanics.prepTableExpire;
			patty.remain = patty.max;
			this.patties.push(patty);

			// determine a color for the heat bar
			if (patty.cookedWell()) {
				patty.color = "#a3f141";
			} else {
				patty.color = "red";
			}

			this.draw();

			if (!mechanics.paused) {
				this.startTimer();
			}
		} 
	};

	this.getPatty = function(id) {
		for (var x = 0; x < this.patties.length; x++) {
			if (this.patties[x].id == id) {
				return this.patties[x];
			}
		}

		return false;
	};

	this.getOldestPatty = function() {
		var curTime = 0;
		var curId = "";

		for (var x = 0; x < this.patties.length; x++) {
			var secsOld = this.patties[x].max - this.patties[x].remain;

			if (curTime == 0) {
				curTime = secsOld;
				curId = this.patties[x].id;
			} else if (secsOld > curTime) {
				curTime = secsOld;
				curId = this.patties[x].id;
			}
		}

		return this.getPatty(curId);
	}

	this.removePatty = function(id) {
		if (id) {
			var ret = null;

			// remove a specific patty from the array
			var tmp = [];

			for (var x = 0; x < this.patties.length; x++) {
				if (this.patties[x].id != id) {
					tmp.push(this.patties[x]);
				} else {
					ret = this.patties[x];
				}
			}

			this.patties = tmp;
		} 
	
		$("#" + id).prev().toggle();
		$("#" + id).remove();

		if (this.patties.length === 0) {
			this.stopTimer();
		}

		this.draw(true);	

		if (this.patties.length < mechanics.prepTableSlots[player.upgrades.prepTableSize.level]) {
			$("#prepTable").droppable("enable");
		}

		return ret;
	};

	this.removeOldestPatty = function() {
		return this.removePatty(this.getOldestPatty().id);
	};

	this.startTimer = function() {
		if (this.timer === null) {
			this.timer = window.setInterval(bindMe(this, this.decRemain), mechanics.heatLampInterval);
		}
	};

	this.decRemain = function() {
		for (var x = 0; x < this.patties.length; x++) {
			if (this.patties[x].remain > 0) {
				this.patties[x].remain--;
			} else {
				this.removePatty(this.patties[x].id);
			}
		}

		this.draw();
	};

	this.stopTimer = function() {
		if (this.timer !== null) {
			clearInterval(this.timer);
		}

		this.timer = null;
	}

	this.draw = function(refresh) {
		if (refresh) {
			$("#prepTable>[id^=slot], #prepTable>.prepPatty").remove();
		}

		// first we draw all the slots as hidden
		if (this.patties.length < mechanics.prepTableSlots[player.upgrades.prepTableSize.level]) {
			for (var x = 0; x < (mechanics.prepTableSlots[player.upgrades.prepTableSize.level]); x++) {
				if (!$("#slot" + x).length) {
					$("<div>Slot #" + (x + 1) + "</div>")
						.addClass("prepPatty")	
						.css("display", "")
						.attr("id", "slot" + x)
						.appendTo("#prepTable");
				}
			}
		}

		// now we draw the unusable prepTable slots
		for (; x < mechanics.prepTableMaxSlots; x++) {
			if (!$("#slot" + x).length) {
				$("<div>Slot #" + (x + 1) + "</div>")
					.addClass("prepPatty prepTableSlotFill")	
					.css("display", "")
					.attr("id", "slot" + x)
					.appendTo("#prepTable");
			}
		}

		// now go through any patties, either drawing, or updating!
		for (var x = 0; x < this.patties.length; x++) {
			if ($(this.patties[x].idHash).length > 0) {
				// update the patty div on preptable
				var pb = progressBar(this.patties[x].remain, this.patties[x].max, $("#prepTable").width());

				$(this.patties[x].idHash + " .progressBar")
					.css("width", pb.fillWidth)
					.html(pb.percent + "%");
			} else {
				// draw the patty div on preptable
				var pb = progressBar(this.patties[x].remain, this.patties[x].max, $("#prepTable").width());

				var pattyId = this.patties[x].id;

				// mouseover text for the progress bar
				var prepTableTitle = "Burger Cook Level: " + this.patties[x].cookedLevel();

				var addEl = $("<div></div>")
						.attr("id", this.patties[x].id)
						.addClass("prepPatty")
						.append("<div class='progressBar' title='" + prepTableTitle + "' style='height: 100%; background-color: " + this.patties[x].color + "; width: " + pb.fillWidth + "px;'>" + pb.percent + "%</div>")
						.append($("<div class='garbageIcon'><img src='images/trash.png' height='28' /></div>").click(function(e) {
							player.garbage++;
							prepTable.removePatty(pattyId);
						}));

				$("#slot" + x).after(addEl).toggle();	
			}
		}
	};
};

var Order = function() {
	this.number = 0;
	this.burgerCount = 0;
	this.age = 0;
	this.maxAge = 0;
	this.filled = false;
	this.result = "";

	this.draw = function() {
		$("#currentOrder .orderNumber").html(this.number);
		$("#currentOrder .burgerCount").html(this.burgerCount);
		$("#currentOrder .orderAge").html(getTime(this.age));
	};
};

var orderCollection = new function() {
	this.orders = [];
	this.orderCounter = 0;
	this.currentOrder = null;
	this.timer = null;

	this.startTimer = function() {
		if (this.timer === null) {
			this.timer = window.setInterval(bindMe(orderCollection, orderCollection.ageOrders), 1000);
		}
	};

	this.stopTimer = function() {
		if (this.timer !== null) {
			clearInterval(this.timer);
		}

		this.timer = null;
	};

	this.ageOrders = function() {
		for (var x = 0; x < this.orders.length; x++) {
			this.orders[x].age++;

			// checking for expiring orders here
			var expiring = false;

			if (this.orders[x].age > this.orders[x].maxAge && !this.orders[x].filled) {
				if (this.orders[x].number == this.currentOrder) {
					this.currentOrder = null;
				}

				$("#currentOrderBG").fadeIn(200).fadeOut(200).fadeIn(200).fadeOut(200).fadeIn(200).fadeOut(200, function() { 
					soundManager.getSoundById('boo').play();
					orderCollection.draw(); 
				});

				this.removeOrder(this.orders[x].number);
				expiring = true;
			}
		}

		if (!expiring) {
			this.draw();
		}
	};

	this.draw = function() {
		$("#pendingOrders .totalOrders").html(this.orderCount());
		$("#pendingOrders .burgersAllDay").html(this.burgerTotal());

		if (!this.currentOrder) {
			var tmp = this.getOldest();

			if (tmp) {
				this.currentOrder = tmp.number;
			} else {
				$("#currentOrder .orderNumber").html("-");
				$("#currentOrder .burgerCount").html("-");
				$("#currentOrder .orderAge").html("-");
			}
		}

		// draw the order if there is one
		if (this.currentOrder) {
			this.getOrder(this.currentOrder).draw();
		}	
	};

	this.orderCount = function() {
		var ret = 0;

		for (var x = 0; x < this.orders.length; x++) {
			if (this.orders[x].filled === false) {
				ret++;
			}
		}

		return ret;
	}

	this.ordersFilled = function() {
		var ret = 0;

		for (var x = 0; x < this.orders.length; x++) {
			if (this.orders[x].filled) {
				ret++;
			}
		}

		return ret;
	};

	this.burgerTotal = function() {
		var ret = 0;

		for (var x = 0; x < this.orders.length; x++) {
			if (this.orders[x].filled === false) {
				ret += this.orders[x].burgerCount;					
			}
		}

		return ret;
	}

	this.addOrder = function(order) {
		// make sure this order is possible with the number of patties remaining
		if (mechanics.orderDebug) {
			console.log("Griddle patty count: " + griddle.patties.length);
			console.log("Preptable patty count: " + prepTable.patties.length);
			console.log("Unused patty count: " + player.dailyPatties);
			console.log("Burgers all day: " + orderCollection.burgerTotal());
		}

		var burgersLeft = griddle.patties.length + prepTable.patties.length + player.dailyPatties - orderCollection.burgerTotal();

		if (mechanics.orderDebug) {
			console.log("We have " + burgersLeft + " burgers left.  Order is for " + order.burgerCount);
		}

		if (order.burgerCount > burgersLeft) {
			if (mechanics.orderDebug) {
				console.log("Reducing order burgerCount to " + burgersLeft);
			}

			order.burgerCount = burgersLeft;
		}

		if (order.burgerCount <= 0) {
			if (mechanics.orderDebug) {
				console.log("No patties left to fill order!  No new orders scheduled.");
			}

			return;
		}	

		// generate an order number
		order.number = ++this.orderCounter;

		// add to the orders array
		this.orders.push(order);

		if (this.currentOrder && (this.getOrder(this.currentOrder).maxAge - this.getOrder(this.currentOrder).age) > 5) {
			$("#pendingOrdersBG").fadeIn(200).fadeOut(200).fadeIn(200).fadeOut(200).fadeIn(200).fadeOut();
		}

		// start the timer if its not already
		if (this.timer === null) {
			this.startTimer();
		}

		this.draw();

		soundManager.getSoundById('bell').play();

		if (!mechanics.paused) {
			mechanics.nextOrder = window.setTimeout(function() {
				var order = new Order();
				var val = Math.floor(Math.random() * (mechanics.prepTableSlots[player.upgrades.prepTableSize.level] - 1)) + 1;

				if (mechanics.orderDebug) {
					console.log("Setting up the next order!");
				}

				order.burgerCount = val;
				order.maxAge = Math.floor(Math.random() * (mechanics.orderMaxAgeUpper - mechanics.orderMaxAgeLower)) + mechanics.orderMaxAgeLower;
				orderCollection.addOrder(order);
			}, Math.floor(Math.random() * (mechanics.orderFrequencies[player.upgrades.truckExterior.level].upper - mechanics.orderFrequencies[player.upgrades.truckExterior.level].lower)) + mechanics.orderFrequencies[player.upgrades.truckExterior.level].lower);
		}
	};

	this.removeOrder = function(number) {
		// remove order identified by the order#
		var tmp = [];

		for (var x = 0; x < this.orders.length; x++) {
			if (this.orders[x].number != number) {
				tmp.push(this.orders[x]);
			}			
		}

		this.orders = tmp;
	};

	this.getOrder = function(number) {
		for (var x = 0; x < this.orders.length; x++) {
			if (this.orders[x].number == number) {
				return this.orders[x];
			}
		}
	};

	this.getOldest = function() {
		var orderNum = "";
		var orderTime = 0;

		for (var x = 0; x < this.orders.length; x++) {
			if (this.orders[x].filled === false) {
				if (orderTime == 0) {
					orderTime = this.orders[x].age;
					orderNum = this.orders[x].number;
				} else {
					if (this.orders[x].age < orderTime) {
						orderTime = this.orders[x].age;
						orderNum = this.orders[x].number;
					}
				}
			}
		}

		if (orderNum != "") {
			return this.getOrder(orderNum);	
		} else {
			return false;
		}
	};

	this.fillOrder = function(patties) {
		// clean up the order
		for (var x = 0; x < this.orders.length; x++) {
			if (this.orders[x].number == this.currentOrder) {
				var age = this.orders[x].age;
				var maxAge = this.orders[x].maxAge;

				this.orders[x].filled = true;
				this.currentOrder = null;
				this.draw();

				soundManager.getSoundById('orderup').play();

				break;
			}
		}

		// compute the score
		var score = 0;
		var yulp = [];

		if (mechanics.scoringDebug) {
			console.log("SCORING");
			mechanics.pattyScoresPrint();
			mechanics.heatModifiersPrint();

			console.log("((Burger Score * Heat Modifier) * Beef Quality) * Popularity Modifier");
			console.log("********************");
		}
		
		for (var x = 0; x < patties.length; x++) {
			score += patties[x].score();
		
			yulp.push(patties[x].yulp());
		}

		// add the popularity multiplier
		score = score * mechanics.popularity;

		// order speed bonus
		var orderPercent = ((maxAge - age) / maxAge) * 100;

		if (orderPercent < mechanics.orderSpeedBonus.percent) {
			// add 1 to all the yulp scores
			for (var x = 0; x < yulp.length; x++) {
				if (yulp[x] < 5) {
					yulp[x]++;
				}
			}

			if (mechanics.scoringDebug) {
				console.log("Speed Bonus: " + Math.floor((score * (mechanics.orderSpeedBonus.bonus / 100))));
			}

			score += Math.floor((score * (mechanics.orderSpeedBonus.bonus	/ 100)));

			// always gets a tip if the order is fulfilled quickly
			var tipPercentage = Math.floor((Math.random() * (mechanics.tipAmountPercentageUpper - mechanics.tipAmountPercentageLower)) + mechanics.tipAmountPercentageLower);

			var tip = (score * (tipPercentage)) * mechanics.tipAmountMultiplier;

			if (mechanics.scoringDebug) {
				console.log("Random tip percentage between " + mechanics.tipAmountPercentageLower + " and " + mechanics.tipAmountPercentageUpper + ": " + tipPercentage + "%");
				console.log(score + " * " + (tipPercentage) + " * " + mechanics.tipAmountMultiplier + " = " + tip);
			}

			if (tip > 0) {
				player.addTip(tip);
			}
		} else {
			if (mechanics.scoringDebug) {
				console.log("Order took " + age + " seconds to get out.  Customer was willing to wait " + maxAge + " seconds.");
				console.log("You took %" + orderPercent + " of the allowed time.  % req'd for tip/bonus was: " + mechanics.orderSpeedBonus.percent);
			}
		}

		var tmp = Math.min.apply(0, yulp);

		if (mechanics.scoringDebug) {
			console.log("Total: " + score);
			console.log("\n");
		}

		player.addScore(score);

		// if this is a yulp reviewer, add the review!
		if ((Math.floor(Math.random() * 100) + 1) <= mechanics.yulpFrequency) {
			player.yulps.push(tmp);

			// blink the new yulp score
			$("#yulpAdd")
				.html("+" + tmp)
				.fadeIn(200)
				.fadeOut(200)
				.fadeIn(200)
				.fadeOut(200)
				.fadeIn(200)
				.fadeOut(200)
				.fadeIn(200)
				.fadeOut(200)
				.fadeIn(200)
				.fadeOut(200);

			player.setYulp();
		}

		if (!player.hideOrderScoring) {
			var scoringTxt = "Burger Score = Doneness Level Score * Heat Level Modifier * Beef Quality<br/>";
			scoringTxt = "Score = (Sum of Individual Burger Scores * Restaurant Popularity) + Speed Bonus<br/>";
			scoringTxt += "Tips = (Score * Tip Percentage) * Tip Multiplier<br/>";

			$("#orderScoringText").html(scoringTxt);
			$("#orderScoring").dialog("open");
		}
	};
};

var player = new function() {
	// access token when signed in with Google+
	this.name = "";
	this.score = 0;
	this.tips = 0;
	this.yulps = [];
	this.daysPlayed = [];
	this.hideOrderScoring = false; // whether to show the order scoring window

	this.dailyPatties = 30;

	this.good = 0;
	this.bad = 0;
	this.garbage = 0;
	this.griddleTimeout = 0;
	this.prepTableTimeout = 0;
	this.servedCustomers = 0;
	this.satisfiedCustomers = 0;
	this.unsatisfiedCustomers = 0;

	// upgrades
	this.upgrades = {
		beefQuality: {
			level: 0
		},
		griddleSize: {
			level: 0
		},
		griddleTemp: {
			level: 0
		},
		truckExterior: {
			level: 0
		},
		prepTableSize: {
			level: 0
		},
		buffEnhance: {
			level: 0
		},
		pattiesPerDay: {
			level: 0
		}
	};

	// buffs
	this.buffs = {
		fireExtinguisher: {
			count: 0
		},
		microwave: {
			count: 0
		},
		scraper: {
			count: 0
		},
		pause: {
			count: 0
		},
		heatLamp: {
			count: 0
		},
		twitter: {
			count: 0
		},
		sauce: {
			count: 0
		},
		helper: {
			count: 0
		}
	};

	this.save = function() {
		if (mechanics.userDebug) {
			console.log("saving player data..");
		}

		// put together a request to the couchDB system
		var data = JSON.stringify(player);
	
		localStorage.player = data;
	};

	this.load = function() {
		if (mechanics.userDebug) {
			console.log("loading player data");
		}

		saveData = localStorage.getItem("player");

		if (saveData !== null) {
			tmpPlayer = JSON.parse(saveData);
			tmpPlayer.load = player.load;
			tmpPlayer.save = player.save;
			tmpPlayer.setYulp = player.setYulp;
			tmpPlayer.addScore = player.addScore;
			tmpPlayer.addTip = player.addTip;
			tmpPlayer.removeTip = player.removeTip, 

			player = tmpPlayer;

			// now update score, tips, yulp, burgercount, buffcounts
			$("#curScore").html(player.score);
			$("#curTips").html(formatDollars(player.tips));

			if (player.dailyPatties == 0) {
				$("#curBurgers").html("<span id='zeroBurgs'>0</span>");
			} else {
				$("#curBurgers").html(player.dailyPatties);
			}

			player.setYulp();
			mechanics.updateBuffs();

			$("#highButton").attr("title", "High: " + (mechanics.griddleTemps[player.upgrades.griddleTemp.level].high / 1000).toFixed(2) + "s/cook");
			$("#medButton").attr("title", "Medium: " + (mechanics.griddleTemps[player.upgrades.griddleTemp.level].med / 1000).toFixed(2) + "s/cook");
			$("#lowButton").attr("title", "Low: " + (mechanics.griddleTemps[player.upgrades.griddleTemp.level].low / 1000).toFixed(2) + "s/cook");

			return true;
		} else {
			return false;
		}
	};

	// averages out the yulp scores, updates mechanics (popularity) and ui
	this.setYulp = function() {
		var sum = 0;
		
		for (var x = 0; x < this.yulps.length; x++) {
			sum += this.yulps[x];		
		}

		var avg = sum / this.yulps.length;

		if (mechanics.scoringDebug) {
			console.log("New average Yulp score: " + avg);
		}

		stars(avg);	
	};

	this.addScore = function(value) {
		player.score += value;

		$("<span id='addScore'>+" + value + "</span>")
			.appendTo("#scoreBox")
			.fadeIn(200)
			.fadeOut(200)
			.fadeIn(200)
			.fadeOut(200)
			.fadeIn(200)
			.fadeOut(200, function() {
				$("#curScore").html(player.score);
				$(this).remove();
			});

		if (mechanics.userDebug) {
			console.log("saving in the addScore() method.");
		}

		player.save();	
	};

	this.addTip = function(value) {
		this.tips += value;

		$("<span id='addTip'>+$" + formatDollars(value) + "</span>")
			.appendTo("#tipBox")
			.fadeIn(200)
			.fadeOut(200)
			.fadeIn(200)
			.fadeOut(200)
			.fadeIn(200)
			.fadeOut(200, function() {
				$("#curTips").html(formatDollars(player.tips));
				$(this).remove();
			});
	};

	this.removeTip = function(value) {
		this.tips -= value;

		if (this.tips < 0) {
			this.tips = 0;
		}

		$("#curTips").html(formatDollars(this.tips));
	};
};

var griddle = new function() {
	this.patties = [];
	this.fires = [];
	this.crud = [];
	this.griddleOn = false;
	this.timer = null;
	this.cookInterval = 0;
	this.pattyCount = 0;

	this.getPattyID = function() {
		var ret = this.pattyCount;

		this.pattyCount++;

		return ret;
	};

	this.turnOn = function(interval) { 
		if (this.timer !== null) {
			clearInterval(this.timer);
		} else {
			if (this.patties.length > 0) {
				soundManager.getSoundById('patty').play();
			}
		}

		this.timer = window.setInterval(bindMe(griddle, griddle.cook), interval);
		this.griddleOn = true;
		this.cookInterval = interval;

		// start back up the timers on any fire or crud
		for (var x = 0; x < this.crud.length; x++) {
			this.crud[x].startTimer();
		}

		for (var x = 0; x < this.fires.length; x++) {
			this.fires[x].startTimer();
		}
	};

	this.turnOff = function() {
		if (this.timer != null) {
			clearInterval(this.timer);
		}

		this.timer = null;
		this.griddleOn = false;

		// stop any crud or fire timers
		for (var x = 0; x < this.crud.length; x++) {
			this.crud[x].stopTimer();
		}

		for (var x = 0; x < this.fires.length; x++) {
			this.fires[x].stopTimer();
		}
	};

	this.cook = function() {
		if (this.patties.length > 0) {
			for (var x = 0; x < this.patties.length; x++) {
				this.patties[x].cook();
			}
		} 

		this.draw();
	};

	this.addCrud = function(left, top) {
		var crud = new Crud(left, top);
		crud.id = "crud" + mechanics.crudCount;
		crud.idHash = "#" + crud.id;

		if (mechanics.crudDebug) {
			console.log("Adding crud to griddle with an id of " + crud.id);
		}

		mechanics.crudCount++;

		crud.draw();
		crud.startTimer();
		this.crud.push(crud);
	};

	this.removeCrud = function(id) {
		var ret = [];

		for (var x = 0; x < this.crud.length; x++) {
			if (this.crud[x].id != id) {
				ret.push(this.crud[x]);
			} else {
				this.crud[x].destroy();
			}
		}

		this.crud = ret;
	};

	this.addFire = function(left, top) {
		var fire = new Fire(left, top);
		fire.id = "fire" + mechanics.fireCount;
		fire.idHash = "#" + fire.id;
		mechanics.fireCount++;
		fire.draw();
		fire.startTimer();
		this.fires.push(fire);
	};

	this.removeFire = function(id) {
		var ret = [];

		for (var x = 0; x < this.fires.length; x++) {
			if (this.fires[x].id != id) {
				ret.push(this.fires[x]);
			}
		}

		this.fires = ret;
	};

	this.addPatty = function(patty) {
		// update the leaderboard daily burger count
		player.dailyPatties--;
		player.save();

		if (player.dailyPatties == 0) {
			$("#curBurgers").html("<span id='zeroBurgs'>0</span>");
			$("#outOfBurgers").dialog("open");
		} else {
			$("#curBurgers").html(player.dailyPatties);
		}

		// get a unique id for this patty
		var id = this.getPattyID();
		patty.id = "patty" + id;
		patty.idHash = "#patty" + id;

		// add the patty to the griddle patty array
		this.patties.push(patty);

		// draw the patty
		this.draw();

		// if the grill is on, play the patty noise!
		if (this.griddleOn) {
			soundManager.getSoundById('patty').play();
		}
	};

	this.removePatty = function(id) {
		var ret = null;
		var patties = [];

		for (var x = 0; x < this.patties.length; x++) {
			if (this.patties[x].id != id) {
				patties.push(this.patties[x]);
			} else {
				ret = this.patties[x];
			}
		}

		this.patties = patties;

		this.draw();

		return ret;
	};

	this.draw = function() {
		// check to make sure the griddle is drawn the right size, according to its level!
		var gWidth = $("#activeGriddle").width();
		var gHeight = $("#activeGriddle").height();

		if (gWidth != mechanics.griddleSizes[player.upgrades.griddleSize.level].width || gHeight != mechanics.griddleSizes[player.upgrades.griddleSize.level].height) {
			$("#activeGriddle").css("width", mechanics.griddleSizes[player.upgrades.griddleSize.level].width + "px");
			$("#activeGriddle").css("height", mechanics.griddleSizes[player.upgrades.griddleSize.level].height + "px");
		}
		
		// if we have patties to draw
		if (this.patties.length > 0) {
			for (var x = 0; x < this.patties.length; x++) {
				// if the patty has already been drawn, refresh it's content
				if ($(this.patties[x].idHash).length > 0) {
					$(this.patties[x].idHash).html("<span class='white'>" + this.patties[x].curSide + "%</span><span class='flipSide white'>" + this.patties[x].flipSide + "%</span>");
					var step = Math.floor(this.patties[x].flipSide / 10);

					if (step > 10) {
						$(this.patties[x].idHash).css("background-color", "black");	
					} else {
						$(this.patties[x].idHash).css("background-color", colorGradient("#FF0000", "#570A0A", step, 10));
					}
				// otherwise, draw it new
				} else {
					$("<div><span class='white'>" + this.patties[x].curSide + "%</span><span class='flipSide white'>" + this.patties[x].flipSide + "%</span></div>")
						.attr("id", this.patties[x].id)
						.css("top", this.patties[x].posTop + "px")
						.css("left", this.patties[x].posLeft + "px")
						.css("background-color", "#FF0000")
						.addClass('patty')
						.addClass('spatulaCursor')
						.draggable({
							zIndex: 800,
							containment: [$("#container").offset().left, $("#fullGriddle").offset().top + 1, $("#container").offset().left + $("#container").width() - 100, $("#fullGriddle").offset().top + $("#fullGriddle").height() - 100],
							revert: this.patties[x].revert,
							start: function(e, ui) {
								if (mechanics.dragDebug) {
									console.log("in the start method");
								}

								var id = e.currentTarget.id;

								for (var x = 0; x < griddle.patties.length; x++) {
									if (griddle.patties[x].id == id) {
										griddle.patties[x].dragging = true;
									}
								}
							},
							stop: function(e, ui) {
								if (mechanics.dragDebug) {
									console.log("in the stop method!");
								}

								for (var x = 0; x < griddle.patties.length; x++) {
									if (griddle.patties[x].id == $(this).attr("id")) {
										$(this).draggable('option', 'revert', griddle.patties[x].revert);
	
										griddle.patties[x].dragging = false;

										if (griddle.patties[x].reverted) {
											griddle.patties[x].reverted = false;
											griddle.patties[x].cookable = true;
										}
									}
								}
							}
						})
						.droppable({
							greedy: true,
							tolerance: 'touch',
							drop: function(event, ui) {
								if (mechanics.dragDebug) {
									console.log("in the droppable of a patty");
								}

								soundManager.getSoundById('error').play();

								for (var x = 0; x < griddle.patties.length; x++) {
									if (griddle.patties[x].id == ui.draggable[0].id) {
										if (mechanics.dragDebug) {
											console.log("in the droppable drop setting reverted to true!");
										}

										griddle.patties[x].cookable = false;
										griddle.patties[x].reverted = true;
									}
								}

								ui.draggable.draggable('option', 'revert', true);
							}
						})
						.css("position", "absolute")
						.appendTo('body');
				}

				if (this.patties[x].flips == (mechanics.pattyMaxFlips - 1)) {
					// generated at http://www.patternify.com
					$(this.patties[x].idHash).css("background-image", "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAG0lEQVQIW2P8DwSMQMAABWAGsiBcBkUFjAOiAbjdCAX194QZAAAAAElFTkSuQmCC')");
				}
			}
		}
	}
};

var Crud = function(startX, startY) {
	this.id = "";
	this.idHash = "";
	this.timer = null;

	this.draw = function() {
		if (mechanics.crudDebug) {
			console.log("In the crud .draw(): " + this.id);
		}

		// create a 1x1 div at the X and Y
		$("<div></div>")
			.attr("id", this.id)
			.addClass("crudBox")
			.css("width", 100)
			.css("height", 100)
			.css("top", startY)
			.css("left", startX)
			.droppable({
				greedy: true,
				tolerance: 'touch',
				drop: function(event, ui) {
					if (mechanics.dragDebug) {
						console.log("in the crud droppable drop!");
					}

					soundManager.getSoundById('error').play();
					ui.draggable.draggable('option', 'revert', true);
				}
			})
			.appendTo("body");
	};

	this.startTimer = function() {
		if (mechanics.crudDebug) {
			console.log("Starting crud shrink timer on " + this.id);
		}

		this.timer = window.setInterval(bindMe(this, this.shrink), mechanics.crudShrinkInterval);
	};

	this.stopTimer = function() {
		if (mechanics.crudDebug) {
			console.log("Stopping crud shrink timer on " + this.id);
		}

		window.clearInterval(this.timer);
		this.timer = null;
	};

	this.destroy = function() {
		if (mechanics.crudDebug) {
			console.log("Destroying " + this.id);
		}

		this.stopTimer();
		$(this.idHash).remove();
	};

	this.shrink = function() {
		if (mechanics.crudDebug) {
			console.log("Shrinking " + this.id);
		}

		var crudPos = $(this.idHash).position();
		var crudTop = crudPos.top + mechanics.crudShrinkSize;
		var crudLeft = crudPos.left + mechanics.crudShrinkSize;
		var crudWidth = $(this.idHash).width() - (mechanics.crudShrinkSize * 2);
		var crudHeight = $(this.idHash).height() - (mechanics.crudShrinkSize * 2);
		
		if (crudWidth > 0 && crudHeight > 0) {
			$(this.idHash)
				.css("left", crudLeft + "px")
				.css("top", crudTop + "px")
				.css("width", crudWidth)
				.css("height", crudHeight);
		} else {
			clearInterval(this.timer);

			// destroy this element
			this.destroy();
			griddle.removeCrud(this.id);
		}
	};
};

var Fire = function(startX, startY) {
	// increment the global firecounter everytime we create a new fire
	this.id = "";
	this.idHash = "";
	this.timer = null;

	this.draw = function() {
		// create a 1x1 div at the X and Y
		$("<div></div>")
			.attr("id", this.id)
			.addClass("fireBox")
			.css("width", 100)
			.css("height", 100)
			.css("top", startY)
			.css("left", startX)
			.droppable({
				greedy: true,
				tolerance: 'touch',
				drop: function(event, ui) {
					if (mechanics.dragDebug) {
						console.log("in the fire droppable drop!");
					}

					soundManager.getSoundById('error').play();
					ui.draggable.draggable('option', 'revert', true);
				}
			})
			.appendTo("body");
	}

	this.startTimer = function() {
		if (mechanics.fireDebug) {
			console.log("Starting timer on " + this.id);
		}

		this.timer = window.setInterval(bindMe(this, this.grow), mechanics.fireGrowInterval);
	};

	this.stopTimer = function() {
		if (mechanics.fireDebug) {
			console.log("Stopping the fire timer on " + this.id);
		}

		window.clearInterval(this.timer);
		this.timer = null;
	}

	this.destroy = function() {
		if (mechanics.fireDebug) {
			console.log("Destroying a fire! " + this.id);
		}

		$(this.idHash).remove();
		this.stopTimer();
		griddle.removeFire(this.id);
	};

	this.grow = function() {
		if (mechanics.fireDebug) {
			console.log("Growing the fire!");
		}

		// how far is the top of OUR div, from the top of the griddle div
		var griddlePos = $("#activeGriddle").offset();
		var griddleRight = griddlePos.left + $("#activeGriddle").width();
		var griddleBottom = griddlePos.top + $("#activeGriddle").height();

		var firePos = $(this.idHash).offset();
		var fireRight = firePos.left + $(this.idHash).width();
		var fireBottom = firePos.top + $(this.idHash).height();

		var growTop = growLeft = growRight = growBottom = 0;

		if (mechanics.fireDebug) {
			console.log("Fire (Left: " + firePos.left + " Top: " + firePos.top + " Right: " + fireRight + " Bottom: " + fireBottom + " )");
			console.log("Griddle (Left: " + griddlePos.left + " Top: " + griddlePos.top + " Right: " + griddleRight + " Bottom: " + griddleBottom + " )");
		}

		// calculate the amount we should grow this step on top
		if ((firePos.top - mechanics.fireGrowSize) > griddlePos.top) {
			growTop = mechanics.fireGrowSize;
		} else if (firePos.top > griddlePos.top) {
			growTop = firePos.top - griddlePos.top;
		} else {
			growTop = 0;
		}

		if ((firePos.left - mechanics.fireGrowSize) > griddlePos.left) {
			growLeft = mechanics.fireGrowSize;
		} else if (firePos.left > griddlePos.left) {
			growLeft = firePos.left - griddlePos.left;
		} else {
			growLeft = 0;
		}

		if ((fireRight + mechanics.fireGrowSize) < griddleRight) {
			growRight = mechanics.fireGrowSize;
		} else if (fireRight < griddleRight) {
			growRight = griddleRight - fireRight;
		} else {
			growRight = 0;
		}

		if ((fireBottom + mechanics.fireGrowSize) < griddleBottom) {
			growBottom = mechanics.fireGrowSize;
		} else if (fireBottom < griddleBottom) {
			growBottom = griddleBottom - fireBottom;
		} else {
			growBottom = 0;
		}

		if (mechanics.fireDebug) {
			console.log(growTop + "," + growLeft + "," + growRight + "," + growBottom);
		}

		if (growTop > 0 || growLeft > 0 || growRight > 0 || growBottom > 0) {
			var fireWidth = $(this.idHash).width() + growLeft + growRight;
			var fireHeight = $(this.idHash).height() + growTop + growBottom;
			var fireTop = firePos.top - growTop;
			var fireLeft = firePos.left - growLeft;

			$(this.idHash)
				.css("left", fireLeft + "px")
				.css("top", fireTop + "px")
				.css("width", fireWidth)
				.css("height", fireHeight);

			// check for collisions here
			for (var x = 0; x < griddle.patties.length; x++) {
				var obj1 = {
					top: $(griddle.patties[x].idHash).position().top,
					left: $(griddle.patties[x].idHash).position().left,
					width: $(griddle.patties[x].idHash).width(),
					height: $(griddle.patties[x].idHash).height()
				};

				var obj2 = {
					top: fireTop,
					left: fireLeft,
					width: fireWidth,
					height: fireHeight
				};

				if (overlaps(obj1, obj2)) {
					// this patty needs to be destroyed!
					$(griddle.removePatty(griddle.patties[x].id).idHash).remove();
				}
			}
		} else {
			clearInterval(this.timer);

			// destroy this element
			window.setTimeout(bindMe(this, this.destroy), mechanics.fireEndDelay);
		}
	}
};

var Patty = function(posTop, posLeft) {
	this.id = "";
	this.idHash = "";
	this.posTop = posTop || 0;
	this.posLeft = posLeft || 0;
	this.curSide = 0;
	this.flipSide = 0;
	this.cookable = true;
	this.dying = false;
	this.flips = 0;
	this.dragging = false;
	this.reverted = false;
	this.beefQuality = mechanics.upgrades.beefQuality[player.upgrades.beefQuality.level].beefQuality;

	this.revert = function(droppableObj) {
		if (mechanics.dragDebug) {
			console.log("in the revert method");
		}

		// if we are dropping on a full prepTable, we need to revert

		if (droppableObj === false) {
			soundManager.getSoundById('error').play();

			if (mechanics.dragDebug) {
				console.log("We are reverting positions!");
			}

			// assume EVERY time we have a revert, we have to restart cookable
			// but we want to do it on the STOP method, to give the revert
			// animation a chance to finish
			var id = $(this)[0].id;

			for (var x = 0; x < griddle.patties.length; x++) {
				if (griddle.patties[x].id == id) {
					if (mechanics.dragDebug) {
						console.log("setting cookable to true (revert method)");
					}

					griddle.patties[x].reverted = true;
				}
			}

			return true;
		} else {
			// with a valid drop, we only resume cooking if we are on the griddle
			if (droppableObj[0].id == "activeGriddle") {
				// set the cookable status back to true
				var id = $(this)[0].id;

				for (var x = 0; x < griddle.patties.length; x++) {
					if (griddle.patties[x].id == id) {
						if (mechanics.dragDebug) {
							console.log("setting cookable to true (revert method)");
						}

						griddle.patties[x].cookable = true;
					}
				}
			}

			return false;
		}
	};

	this.cook = function() {
		if (this.cookable !== false) {
			this.curSide++;
		}

		if (this.curSide == 100 && helper.active) {
			this.flip();

			if (griddle.griddleOn) {
				soundManager.getSoundById('patty').play();
			}
		}

		if (this.curSide > mechanics.pattyMaxDone && this.cookable == true) {
			// patty is overcooked on one side!
			if (this.dying === false ) {
				var pattyPos = $(this.idHash).offset();
			
				if (mechanics.dragDebug) {
					console.log("Setting cookable to false (patty.cook)");
				}

				this.cookable = false;
				this.dying = true;

				$(this.idHash)
					.fadeOut(300).fadeIn(300)
					.fadeOut(300).fadeIn(300)
					.fadeOut(300).fadeIn(300)
					.fadeOut(300).fadeIn(300)
					.fadeOut(300).fadeIn(300, function() {
						// remove the element
						griddle.removePatty(this.id);
						$(this).remove();
					});

				// there is a chance here that this will either cause a grease fire or form crud.
				var chance = Math.floor(Math.random() * 100) + 1;

				if (chance <= mechanics.pattyBurnNegChance) {
					var rand = Math.floor(Math.random() * 100) + 1;

					// 50% chance for either crud or fire
					if (rand <= 50) {
						griddle.addCrud(pattyPos.left, pattyPos.top);
					} else {
						griddle.addFire(pattyPos.left, pattyPos.top);
					} 
				}
			}
		}
	};

	this.flip = function() {
		var tmp = this.curSide;
		this.curSide = this.flipSide;
		this.flipSide = tmp;
		this.flips++;
	};

	this.cookedWell = function() {
		// being cooked "well" is anything not danger or bad
		var minDone = mechanics.pattyScores.ok.range;
		var maxDone = 100;
		
		return (this.curSide <= maxDone && this.flipSide <= maxDone && (100 - this.curSide) <= minDone && (100 - this.flipSide) <= minDone);
	}

	this.score = function() {
		if (mechanics.scoringDebug) {
			console.log("\tBurger Score");
			console.log("\t************");
		}

		// get a score for both sides of the patty.  we only use the lowest
		var side1 = this.scoreSide(this.curSide);
		var side2 = this.scoreSide(this.flipSide);

		if (mechanics.scoringDebug) {
			console.log("\t(Lowest score of the two patty sides gets used)");
			console.log("\n");
		}

		var tmp = Math.min(side1, side2);

		// adjust with the heat modifier
		if (mechanics.scoringDebug) {
			console.log("\tHeat Modifier");
			console.log("\t*************");
		}

		var heatModifier = 1;
		var hmName = "";
		var subtractPer = 0;

		var heatPercent = 100 - ((this.remain / this.max) * 100);

		if (mechanics.scoringDebug) {
			console.log("\tHeat of patty (0 to 100): " + heatPercent);
		}

		if (heatPercent <= mechanics.heatModifiers.sizzling.range) {
			subtractPer = mechanics.heatModifiers.sizzling.subtract;
			hmName = "Sizzing";
		} else if (heatPercent <= mechanics.heatModifiers.warm.range) {
			subtractPer = mechanics.heatModifiers.warm.subtract;
			hmName = "Warm";
		} else if (heatPercent <= mechanics.heatModifiers.cold.range) {
			subtractPer = mechanics.heatModifiers.cold.subtract;
			hmName = "Cold";
		} else {
			subtractPer = mechanics.heatModifiers.stale.subtract;
			hmName = "Stale";
		}	

		heatModifier = (1 - (subtractPer / 100));

		if (mechanics.scoringDebug) {
			console.log("\tPatty heat level of " + hmName + " gets a heatModifier of -" + subtractPer + "% (" + heatModifier + ")\n");

			console.log("\tBeef Quality: " + this.beefQuality + "\n");

			console.log("\tPopularity: " + mechanics.popularity + "\n");

			console.log("\t((" + tmp + " * " + heatModifier + ") * " + this.beefQuality + ")");
			console.log("\tFinal Patty Score: " + Math.floor(((tmp * heatModifier) * this.beefQuality)));
			console.log("\t**********************");
		}

		return Math.floor((tmp * heatModifier) * this.beefQuality);
	};

	this.cookedLevel = function() {
		var donenessRange = 100 - Math.min(this.curSide, this.flipSide);

		if (this.curSide > 100 || this.flipSide > 100) {
			cookedLevel = "BURNT";
		} else if (donenessRange <= mechanics.pattyScores.perfect.range || sauce.active) {
			cookedLevel = "PERFECT";
		} else if (donenessRange <= mechanics.pattyScores.great.range) {
			cookedLevel = "GREAT";
		} else if (donenessRange <= mechanics.pattyScores.ok.range) {
			cookedLevel = "OK";
		} else if (donenessRange <= mechanics.pattyScores.bad.range) {
			cookedLevel = "BAD";
		} else {
			cookedLevel = "DANGER";
		}

		return cookedLevel;
	};

	this.scoreSide = function(doneness) {
		donenessRange = 100 - doneness;

		if (mechanics.scoringDebug) {
			console.log("\tDoneness: " + doneness)
		}

		var cookedLevel = "";
		var score = 0;

		if (donenessRange < 0) {
			cookedLevel = "BURNT";
			score = mechanics.pattyScores.burnt.score;
		} else if (donenessRange <= mechanics.pattyScores.perfect.range || sauce.active) {
			cookedLevel = "PERFECT";
			score = mechanics.pattyScores.perfect.score;
		} else if (donenessRange <= mechanics.pattyScores.great.range) {
			cookedLevel = "GREAT";
			score = mechanics.pattyScores.great.score;
		} else if (donenessRange <= mechanics.pattyScores.ok.range) {
			cookedLevel = "OK";
			score = mechanics.pattyScores.ok.score;
		} else if (donenessRange <= mechanics.pattyScores.bad.range) {
			cookedLevel = "BAD";
			score = mechanics.pattyScores.bad.score;
		} else {
			cookedLevel = "DANGER";
			score = mechanics.pattyScores.danger.score;
		}

		if (mechanics.scoringDebug) {
			console.log("\tCooked level '" + cookedLevel + "' gets a score of " + score + "\n");
		}

		return score;
	};

	this.yulp = function() {
		return Math.min(this.yulpSide(this.curSide), this.yulpSide(this.flipSide));
	};

	this.yulpSide = function(doneness) {
		donenessRange = 100 - doneness;

		if (donenessRange < 0) {
			return mechanics.pattyScores.burnt.yulp;
		} else if (donenessRange <= mechanics.pattyScores.perfect.range) {
			return mechanics.pattyScores.perfect.yulp;
		} else if (donenessRange <= mechanics.pattyScores.great.range) {
			return mechanics.pattyScores.great.yulp;
		} else if (donenessRange <= mechanics.pattyScores.ok.range) {
			return mechanics.pattyScores.ok.yulp;
		} else if (donenessRange <= mechanics.pattyScores.bad.range) {
			return mechanics.pattyScores.bad.yulp;
		} else {
			return mechanics.pattyScores.danger.yulp;
		}
	};
};

$(document).ready(function() {
	// griddle temperature controls
	$("#lowButton").click(function() {
		griddle.turnOn(mechanics.griddleTemps[player.upgrades.griddleTemp.level].low);
		$(this).css("background-color", "orange");
		$("#medButton").css("background-color", "");
		$("#highButton").css("background-color", "");
	});

	$("#medButton").click(function() {
		griddle.turnOn(mechanics.griddleTemps[player.upgrades.griddleTemp.level].med);
		$(this).css("background-color", "orange");
		$("#lowButton").css("background-color", "");
		$("#highButton").css("background-color", "");
	});

	$("#highButton").click(function() {
		griddle.turnOn(mechanics.griddleTemps[player.upgrades.griddleTemp.level].high);
		$(this).css("background-color", "orange");
		$("#lowButton").css("background-color", "");
		$("#medButton").css("background-color", "");
	});

	$("#muteButton").click(function() {
		soundManager.mute();

		$("#muteButton, #unmuteButton").toggle();
	});

	$("#unmuteButton").click(function() {
		soundManager.unmute();

		$("#muteButton, #unmuteButton").toggle();
	});

	$("#pauseButton").click(function() {
		mechanics.pause();
	});

	$("#resumeButton").click(function() {
		mechanics.resume();
	});

	$("#fillOrder").click(function() {
		// get the currentOrder
		var order = orderCollection.getOrder(orderCollection.currentOrder);

		// do we have enough patties to fill the current order?
		if (order) {
			if (prepTable.patties.length >= order.burgerCount) {
				// remove the patties from the preptable
				var orderPats = [];

				for (var x = 0; x < order.burgerCount; x++) {
					orderPats.push(prepTable.removeOldestPatty());
				}

				// mark the order as filled
				orderCollection.fillOrder(orderPats);
			} else {
				// not enough patties
				$("#fillOrderToolTip").html("You don't have enough burgers on the prep table to fill the current order! Grill up " + (order.burgerCount - prepTable.patties.length) + " more.");
				$("#fillOrderToolTip").dialog("open");
			} 
		} else {
			$("#fillOrderToolTip").html("You don't have any orders to fill!");
			$("#fillOrderToolTip").dialog("open");
		}
	});

	$("#activeGriddle").click(function(e) {
		if (!mechanics.paused) {
			// create a new patty
			var newPattyTop = e.pageY - 50;
			var newPattyLeft = e.pageX - 50;

			var patty = new Patty(newPattyTop, newPattyLeft);

			var newPlacementObj = {
				top: newPattyTop,
				left: newPattyLeft,
				width: 100,
				height: 100
			};

			// make sure this is a valid placement before we create
			var valid = true;

			// make sure we aren't colliding with another patty
			if (griddle.patties.length > 0) {
				for (var x = 0; x < griddle.patties.length; x++) {
					var pattyObj = {
						top: $(griddle.patties[x].idHash).offset().top,
						left: $(griddle.patties[x].idHash).offset().left,
						width: $(griddle.patties[x].idHash).width(),
						height: $(griddle.patties[x].idHash).height()
					};

					if (overlaps(pattyObj, newPlacementObj)) {
						if (mechanics.placementDebug) {
							console.log("Attempted patty drop overlaps an existing patty! " + griddle.patties[x].idHash);
						}

						valid = false;
					}
				}
			}

			// check we are within the confines of the griddle
			var obj2 = $("#activeGriddle").offset();

			if (!withinBounds(newPlacementObj, {top: obj2.top, left: obj2.left, width: $("#activeGriddle").width(), height: $("#activeGriddle").height()})) {
				if (mechanics.placementDebug) {
					console.log("Attempted patty drop is out of bounds of the griddle!");
				}

				valid = false;
			}

			// check if player has any patties left
			if (player.dailyPatties == 0) {
				if (mechanics.placementDebug) {
					console.log("No patties left to drop!");
				}

				$("#outOfBurgers").dialog("open");

				valid = false;
			}

			// make sure we aren't trying to place on top of some crud
			for (var x = 0; x < griddle.crud.length; x++) {
				var crudObj = {
					top: $(griddle.crud[x].idHash).position().top,
					left: $(griddle.crud[x].idHash).position().left,
					width: $(griddle.crud[x].idHash).width(),
					height: $(griddle.crud[x].idHash).height()
				}

				if (overlaps(crudObj, newPlacementObj)) {
					if (mechanics.placementDebug) {
						console.log("Attempted patty drop overlaps crud! " + griddle.crud[x].idHash);
					}

					valid = false;
				}
			}

			// make sure we're not placing in a fire!
			for (var x = 0; x < griddle.fires.length; x++) {
				var fireObj = {
					top: $(griddle.fires[x].idHash).position().top,
					left: $(griddle.fires[x].idHash).position().left,
					width: $(griddle.fires[x].idHash).width(),
					height: $(griddle.fires[x].idHash).height()
				}

				if (overlaps(fireObj, newPlacementObj)) {
					if (mechanics.placementDebug) {
						console.log("Attempted patty drop overlaps fire! " + griddle.fires[x].idHash);
					}

					valid = false;
				}
			}

			// add it to the griddle
			if (valid !== false) {
				griddle.addPatty(patty);
			} else {
				delete patty;

				soundManager.getSoundById('error').play();

				if (player.dailyPatties > 0) {
					// show the collision box
					$("<div></div>")
						.addClass("colBox")
						.css("top", (e.pageY - 50 - $(this).offset().top) + "px")
						.css("left", (e.pageX - 50 - $(this).offset().left) + "px")
						.css("z-index", 1500)
						.appendTo("#activeGriddle")
						.fadeIn(200).fadeOut(200).fadeIn(200).fadeOut(200, function() { $(this).remove(); });
				}
			}
		}
	});

	$("body").on("click", ".patty", function(e) {
		if (!mechanics.paused) {
			for (var x = 0; x < griddle.patties.length; x++) {
				if (griddle.patties[x].id == $(e.target).attr("id")) {
					if (griddle.patties[x].flips == (mechanics.pattyMaxFlips - 1)) {
						$(griddle.removePatty(griddle.patties[x].id).idHash).remove();
					} else {
						griddle.patties[x].flip();

						if (griddle.griddleOn) {
							soundManager.getSoundById('patty').play();
						}
					}

					griddle.draw();
				}
			}

			e.stopPropagation();
		}
	});

	$("body").on("mousedown", ".patty", function(e) {
		if (!mechanics.paused) {
			for (var x = 0; x < griddle.patties.length; x++) {
				if (griddle.patties[x].id == $(e.target).attr("id")) {
					if (griddle.patties[x].dying === true) {
						$(griddle.patties[x].idHash).stop(true, true);
						$(griddle.patties[x].idHash).fadeIn(1);
						griddle.patties[x].dying = false;	
					} else {
						if (mechanics.dragDebug) {
							console.log("setting cookable to false! (#activeGriddle.on(mousedown))");
						}

						griddle.patties[x].cookable = false;
						griddle.patties[x].mousedown = true;
					}
				}
			}
		}
	});

	$("body").on("mouseup", ".patty", function(e) {
		if (!mechanics.paused) {
			for (var x = 0; x < griddle.patties.length; x++) {
				if (griddle.patties[x].id == $(e.target).attr("id")) {
					if (!griddle.patties[x].dragging) {
						griddle.patties[x].cookable = true;
					} 
				}
			}
		}
	});

	$("#activeGriddle").droppable({
		tolerance: 'fit',
		drop: function(event, ui) {
			if (mechanics.dragDebug) {
				console.log("In the griddle droppable");
			}
		}
	});

	$("#prepTable").droppable({
		tolerance: "fit",
		drop: function(e, ui) {
			// check the doneness values

			// if we have room on the preptable, disable the droppable function on this patty
			if (prepTable.patties.length < mechanics.prepTableSlots[player.upgrades.prepTableSize.level]) {
				ui.draggable.each(function(index, el) {
					$(el).droppable('disable');
				});
			}

			for (var x = 0; x < griddle.patties.length; x++) {
				var patty = griddle.patties[x];

				if (griddle.patties[x].id == ui.draggable.attr("id")) {
					if (mechanics.dragDebug) {
						console.log("Setting cookable to false! (#prepTable.droppable)");
					}

					patty.cookable = false;

					if (griddle.patties[x].cookedWell()) {
						$("#" + ui.draggable.attr("id")).html("<img src='images/thumbsup.png' />");
					} else {
						$("#" + ui.draggable.attr("id")).html("<img src='images/thumbsdown.png' />");
					}

					if ((prepTable.patties.length + 1) == mechanics.prepTableSlots[player.upgrades.prepTableSize.level]) {
						$("#prepTable").droppable("disable");
					}

					$("#" + ui.draggable.attr("id")).fadeOut(300).fadeIn(300).fadeOut(300).fadeIn(300).delay(500).fadeOut(300, function() { 
						prepTable.addPatty(griddle.removePatty(ui.draggable.attr("id")));
						$(this).remove();
					});
				}
			}
		}
	});

	$("#garbageCan").droppable({
		tolerance: "touch",
		drop: function(e, ui) {
			griddle.removePatty(ui.draggable.attr("id"));
			$("#" + ui.draggable.attr("id")).remove();
			player.garbage++;
		}
	});

	$("#orderScoring").dialog({
      autoOpen: false,
      closeOnEscape: true,
      dialogClass: 'popUp',
      draggable: false,
      modal: true,
      resizable: false,
      height: 130,
      width: 600,
      position: [$("#score").offset().left - 602, $("#fullGriddle").offset().top + $("#fullGriddle").height()],
		title: "Scoring Information",
      open: function(e, ui) {
         if (!mechanics.paused) {
            mechanics.pause();
            mechanics.overlayPaused = true;
         }
      },
      close: function(e, ui) {
			if ($("#hideOrderScoring").prop("checked")) {
				player.hideOrderScoring = true;
			}
 	
         if (mechanics.overlayPaused) {
            mechanics.resume();
            mechanics.overlayPaused = false;
         }
      }
	});

	$("#welcome").dialog(mechanics.popUpDefaults);
	$("#welcome").dialog({
		title: "Welcome to Patty Wagon!"
	});

	$("#fillOrderToolTip").dialog({
      autoOpen: false,
      closeOnEscape: true,
      dialogClass: 'popUp',
      draggable: false,
      modal: true,
      resizable: false,
		title: "Hint",
      height: 80,
      width: 300,
      position: [$("#score").offset().left - 102, $("#fillOrder").offset().top - 80],
		open: function(e, ui) {
         if (!mechanics.paused) {
				mechanics.pause();
            mechanics.overlayPaused = true;
			}
		},
		close: function(e, ui) {
			if (mechanics.overlayPaused) {
				mechanics.resume();
				mechanics.overlayPaused = false;
			}
		}
	});

	$("#outOfBurgers").dialog(mechanics.popUpDefaults);
	$("#outOfBurgers").dialog({
		title: "Out of Burgers!",
		open: function(e, ui) {
         if (!mechanics.paused) {
				mechanics.pause();
            mechanics.overlayPaused = true;

				// add the price amount to the screen
				$("#reUpPattyCost").html(formatDollars(mechanics.pattyReUpCost));

				// see if the user has enough dollars for a patty re-up
				if (player.tips >= mechanics.pattyReUpCost) {
					// enable the purchase button
					$("#reUpPattyButton").removeAttr("disabled");
				}
         }
		}
	});

	$("#reUpPattyButton").click(function(e) {
		player.tips -= mechanics.pattyReUpCost;
		$("#curTips").html(formatDollars(player.tips));

		player.dailyPatties = mechanics.upgrades.pattiesPerDay[player.upgrades.pattiesPerDay.level];
		soundManager.getSoundById('register').play();
		$("#outOfBurgers").dialog("close");

		$("#curBurgers").html(player.dailyPatties);
	});

	$("#burgers").on("click", "#zeroBurgs", function(e) {
		$("#outOfBurgers").dialog("open");
	});

	$("#instructions").dialog(mechanics.popUpDefaults);
	$("#instructions").dialog({
		title: "Patty Wagon"
	});

	$("#upgradeStore").dialog(mechanics.popUpDefaults);
	$("#upgradeStore").dialog({
		title: "Upgrade Store",
		open: function() {
			if (!mechanics.paused) {
				mechanics.pause();
				mechanics.overlayPaused = true;
			}

			$("#storeUpgradeMoneyValue").html(formatDollars(player.tips));
			$("#storeUpgradePurchase").attr("disabled", true);

		}
	});

	$("#buffStore").dialog(mechanics.popUpDefaults);
	$("#buffStore").dialog({
		title: "Buff Store",
		open: function() {
			if (!mechanics.paused) {
				mechanics.pause();
				mechanics.overlayPaused = true;
			}

			$("#storeBuffMoneyValue").html(formatDollars(player.tips));
			$("#storeBuffPurchase").attr("disabled", true);
		}
	});

	$("#statistics").dialog(mechanics.popUpDefaults);

	$("#showInstructions").click(function() {
		$("#instructions").dialog("open");
	});

	$("#showStore").click(function() {
		$("#buffStore").dialog("open");
	});

	$("#showUpgrades").click(function() {
		$("#upgradeStore").dialog("open");
	});

	$("#showStatistics").click(function() {
		$("#statistics").dialog("open");
	});

	$(".storeBuff").click(function(e) {
		var id = $(this)[0].id;

		var fl = id.slice(5, 6);
		var buff = fl.toLowerCase() + id.slice(6);

		$("#storeBuffNameValue").html(mechanics.buffs[buff].name);
		$("#storeBuffDescriptionValue").html(mechanics.buffs[buff].description);
		$("#storeBuffPriceValue").html("$" + formatDollars(mechanics.buffs[buff].price));

		if (mechanics.buffs[buff].price > player.tips) {
			$("#storeBuffPurchase").attr("disabled", true);
		} else {
			$("#storeBuffPurchase").removeAttr("disabled");
			$("#storeBuffPurchase").off("click");
			$("#storeBuffPurchase").on("click", function() {
				player.tips -= mechanics.buffs[buff].price;
				player.buffs[buff].count++;
				$("#" + id).trigger("click");
				mechanics.updateBuffs();
				soundManager.getSoundById('register').play();
				$("#storeBuffMoneyValue").html(formatDollars(player.tips));
			});
		}
	});

	$(".upgradeBuff").click(function(e) {
		var id = $(this)[0].id;

		var fl = id.slice(5, 6);
		var upgrade = fl.toLowerCase() + id.slice(6);

		$("#storeUpgradeNameValue").html(mechanics.upgrades[upgrade].name);
		$("#storeUpgradeDescriptionValue").html(mechanics.upgrades[upgrade].description);
		$("#storeUpgradePriceValue").html("$" + formatDollars(mechanics.upgrades[upgrade].price));
		$("#storeUpgradeCurrentLevelValue").html(fullStars(player.upgrades[upgrade].level, 3));

		if (mechanics.upgrades[upgrade].price > player.tips || player.upgrades[upgrade].level >= mechanics.upgrades[upgrade].maxLevel) {
			$("#storeUpgradePurchase").attr("disabled", true);
		} else {
			$("#storeUpgradePurchase").removeAttr("disabled");
			$("#storeUpgradePurchase").off("click");
			$("#storeUpgradePurchase").on("click", function() {
				player.tips -= mechanics.upgrades[upgrade].price;
				player.upgrades[upgrade].level++;
				$("#" + id).trigger("click");

				soundManager.getSoundById('churchbell').play();

				// update the upgrade counts!
				$("#storeUpgradeCurrentLevelValue").html(fullStars(player.upgrades[upgrade].level, 3));

				switch (upgrade) {
					case 'beefQuality':
						mechanics.pattyMaxFlips = mechanics.upgrades.beefQuality[player.upgrades[upgrade].level].maxFlips;
						break;
					case 'griddleSize':
						griddle.draw();
					case 'prepTableSize':
						prepTable.draw(true);
						break;
					case 'buffEnhance':
						mechanics.buffDuration = mechanics.upgrades.buffEnhance[player.upgrades[upgrade].level];
					case 'griddleTemp':
						$("#highButton").attr("title", "High: " + (mechanics.griddleTemps[player.upgrades[upgrade].level].high / 1000).toFixed(2) + "s/cook");
						$("#medButton").attr("title", "Medium: " + (mechanics.griddleTemps[player.upgrades[upgrade].level].med / 1000).toFixed(2) + "s/cook");
						$("#lowButton").attr("title", "Low: " + (mechanics.griddleTemps[player.upgrades[upgrade].level].low / 1000).toFixed(2) + "s/cook");
					default:
						break;
				} 

				// update dollars remaining
				$("#storeUpgradeMoneyValue").html(formatDollars(player.tips));

				// save the game
				player.save();
			});
		}
	});

	$(window).resize(function() {
		// adjust the patty location on window resize!
		var nLeft = $("#activeGriddle").offset().left;
		var nTop = $("#activeGriddle").offset().top;

		if (nLeft != mechanics.gLeft || nTop != mechanics.gTop) {
			var leftAdjust = 0;
			var topAdjust = 0;

			if (nLeft > mechanics.gLeft) {
				// width has grown
				leftAdjust = nLeft - mechanics.gLeft;
			} else {
				leftAdjust = (mechanics.gLeft - nLeft) * -1;
			}

			if (nTop > mechanics.gTop) {
				// height has grown
				topAdjust = nTop - mechanics.gTop;
			} else {
				topAdjust = (mechanics.gTop - nTop) * -1;
			}

			mechanics.gLeft = nLeft;
			mechanics.gTop = nTop;

			for (var x = 0; x < griddle.patties.length; x++) {
				$(griddle.patties[x].idHash).css("top", $(griddle.patties[x].idHash).offset().top + topAdjust);
				griddle.patties[x].posTop = $(griddle.patties[x].idHash).offset().top;

				$(griddle.patties[x].idHash).css("left", $(griddle.patties[x].idHash).offset().left + leftAdjust);
				griddle.patties[x].posLeft = $(griddle.patties[x].idHash).offset().left;

				$(griddle.patties[x].idHash).draggable("option", "containment", [$("#container").offset().left, $("#fullGriddle").offset().top + 1, $("#container").offset().left + $("#container").width() - 100, $("#fullGriddle").offset().top + $("#fullGriddle").height() - 100]);
			}

			for (var x = 0; x < griddle.crud.length; x++) {
				$(griddle.crud[x].idHash).css("top", $(griddle.crud[x].idHash).offset().top + topAdjust);
				$(griddle.crud[x].idHash).css("left", $(griddle.crud[x].idHash).offset().left + leftAdjust);
			}

			for (var x = 0; x < griddle.fires.length; x++) {
				$(griddle.fires[x].idHash).css("top", $(griddle.fires[x].idHash).offset().top + topAdjust);
				$(griddle.fires[x].idHash).css("left", $(griddle.fires[x].idHash).offset().left + leftAdjust);
			}
		}
	});

	// initialization (GAME START)
	mechanics.nextOrder = window.setTimeout(function() {
		var order = new Order();
		var val = Math.floor(Math.random() * (mechanics.prepTableSlots[player.upgrades.prepTableSize.level] - 1)) + 1;
		order.burgerCount = val;

		if (mechanics.orderDebug) {
			console.log("Setting timer for the initial order of " + val + " burgers.");
		}

		order.maxAge = Math.floor(Math.random() * (mechanics.orderMaxAgeUpper - mechanics.orderMaxAgeLower)) + mechanics.orderMaxAgeLower;
		orderCollection.addOrder(order);
	}, Math.floor(Math.random() * (mechanics.initialOrderDelayUpper - mechanics.initialOrderDelayLower)) + mechanics.initialOrderDelayLower);

	prepTable.draw();

	player.dailyPatties = mechanics.upgrades.pattiesPerDay[player.upgrades.pattiesPerDay.level];
	griddle.turnOn(mechanics.griddleTemps[player.upgrades.griddleTemp.level].low);

	mechanics.gLeft = $("#activeGriddle").offset().left;
	mechanics.gTop = $("#activeGriddle").offset().top;

	if (supports_html5_storage()) {
		// check to see if the user has a saved game
		if (player.load()) {
			var welcomeMsg = "Welcome back!  Your profile has been loaded.";
		} else {
			var welcomeMsg = "It appears that this is your first time playing!";
		}
	} else {
		// no html5 localstorage.  can't save the game!
		var welcomeMsg = "You appear to be using an older browser.  Saving your game will be disabled.";
	}

	$("#welcome").html(welcomeMsg);
	$("#welcome").dialog({
		close: function(e, ui) {
          if (mechanics.overlayPaused) {
				mechanics.resume();

            mechanics.overlayPaused = false;

				if (player.daysPlayed.indexOf(getDate()) === -1) {
					player.daysPlayed.push(getDate());

					if (player.dailyPatties < mechanics.upgrades.pattiesPerDay[player.upgrades.pattiesPerDay.level]) {
						player.dailyPatties = mechanics.upgrades.pattiesPerDay[player.upgrades.pattiesPerDay.level];
					}
				}
         }
		}
	}); //.dialog("open");

	//$("#orderScoring").dialog("open");
});
