(function () {
	"use strict";

	/*jslint browser: true*/
	/*global soundManager*/
	/*global $*/
	/*global Mechanics,Player,PrepTable,orderCollection,Griddle,heatLamp,twitter,sauce,helper,Order,Patty,Crud,Fire*/

	function getDate() {
		var ret, month, day;

		ret = new Date();

		month = ret.getMonth();

		if (month.length < 2) {
			month = "0" + month;
		}

		day = ret.getDay();

		if (day.length < 2) {
			day = "0" + day;
		}

		return ret.getFullYear() + "-" + month + "-" + day;
	}

	function supports_html5_storage() {
		try {
			return (typeof window.localStorage !== 'undefined');
		} catch (e) {
			return false;
		}
	}

	soundManager.setup({
		url: 'swf/',
		flashVersion: 9,
		debugMode: false,
		onready: function () {
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
		var x, ret = "";

		for (x = 0; x < max; x += 1) {
			if (x < value) {
				ret += "<img src='images/star_on.png' />";
			} else {
				ret += "<img src='images/star_off.png' />";
			}
		}

		return ret;
	}

	function stars(number) {
		// the 18 comes from the width of the star image we use as a background
		$("#starMask").css("width", (number * 18) + "px");
	}

	function formatDollars(value) {
		var dollars, cents;

		dollars = Math.floor(value / 100);
		cents = value - (dollars * 100);

		if (cents < 10) {
			cents = "0" + cents;
		}

		return dollars + "." + cents;
	}

	function progressBar(value, max, width) {
		var percent, displayPercent, fillWidth;

		percent = value / max;
		displayPercent = Math.floor(percent * 100);
		fillWidth = width * percent;

		return {"fillWidth": fillWidth, "percent": displayPercent};
	}

	function withinBounds(obj1, obj2) {
		var ax1, ay1, ax2, ay2, bx1, by1, bx2, by2, comp0, comp1, comp2, comp3;

		ax1 = obj1.left;
		ay1 = obj1.top;
		ax2 = ax1 + 100;
		ay2 = ay1 + 100;

		bx1 = obj2.left;
		by1 = obj2.top;
		bx2 = bx1 + obj2.width;
		by2 = by1 + obj2.height;

		comp0 = ax1 < bx1;
		comp1 = ax2 > bx2;
		comp2 = ay1 < by1;
		comp3 = ay2 > by2;

		return !(comp0 || comp1 || comp2 || comp3);
	}

	function bindMe(obj, method) {
		return function () {
			return method.apply(obj);
		};
	}

	function getTime(seconds) {
		var minutes;

		minutes = Math.floor(seconds / 60);
		seconds = Math.floor(seconds - minutes * 60);

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
		var ax1, ay1, ax2, ay2, bx1, by1, bx2, by2, comp0, comp1, comp2, comp3;

		ax1 = obj1.left;
		ay1 = obj1.top;
		ax2 = ax1 + obj1.width;
		ay2 = ay1 + obj1.height;

		bx1 = obj2.left;
		by1 = obj2.top;
		bx2 = bx1 + obj2.width;
		by2 = by1 + obj2.height;

		comp0 = ax1 < bx2;
		comp1 = ax2 > bx1;
		comp2 = ay1 < by2;
		comp3 = ay2 > by1;

		return (comp0 && comp1 && comp2 && comp3);
	}

	function hex2RGB(hex) {
		if (hex.indexOf("#") === 0) {
			hex = hex.slice(1);
		}

		return [parseInt("0x" + hex.slice(0, 2), 16), parseInt("0x" + hex.slice(2, 4), 16), parseInt("0x" + hex.slice(4), 16)];
	}

	function rGB2hex(RGB) {
		var ret, x, tmp;

		ret = "#";

		for (x = 0; x < 3; x += 1) {
			tmp = Math.round(RGB[x]);
			tmp = tmp.toString(16);

			if (tmp.length === 1) {
				tmp = "0" + tmp;
			}

			ret = ret + tmp;
		}

		return ret;
	}

	function colorGradient(start, stop, curStep, steps) {
		var startRGB, stopRGB, newRGB, x, diff, step;

		startRGB = hex2RGB(start);
		stopRGB = hex2RGB(stop);

		newRGB = [];

		for (x = 0; x < 3; x += 1) {
			if (startRGB[x] > stopRGB[x]) {
				diff = startRGB[x] - stopRGB[x];

				step = diff / steps;

				newRGB[x] = startRGB[x] - (step * curStep);
			} else if (startRGB[x] === stopRGB[x]) {
				newRGB[x] = startRGB[x];
			} else {
				diff = stopRGB[x] - startRGB[x];

				step = diff / steps;

				newRGB[x] = stopRGB[x] - (step * curStep);
			}
		}

		return rGB2hex(newRGB);
	}

	var Mechanics = {
		// holds the timer for when the next order will come in
		nextOrder: null,

		// number of seconds a buff lasts
		buffDuration: 180,

		// time in ms before we decrement patties on the preptable
		heatLampInterval: 1000,

		// how long to wait before first order comes in
		initialOrderDelayLower: 8000,
		initialOrderDelayUpper: 10000,

		// how often orders come in (in milliseconds)
		orderFrequencies: {
			0: {
				lower: 18000,
				upper: 100000
			},
			1: {
				lower: 17000,
				upper: 90000
			},
			2: {
				lower: 15000,
				upper: 80000
			},
			3: {
				lower: 10000,
				upper: 60000
			}
		},

		orderFrequencyLower: 20000,
		orderFrequencyUpper: 120000,

		// values in seconds indicating how long a customer will wait for an order (until it expires)
		orderMaxAgeUpper: 180, // maximum for order wait time
		orderMaxAgeLower: 180, // minimum value for random order wait time

		paused: false, // system wide pause setting
		overlayPaused: false, // if we've paused by using the popup windows

		prepTableSlots: {
			0: 3,
			1: 5,
			2: 8,
			3: 10
		},

		prepTableExpire: 120, // number of seconds a patty lives on the prep table
		prepTableMaxSlots: 10,

		// ms for each cook() iteration at diff oven temps
		griddleSizes: {
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
		},

		griddleTemps: {
			0 : {
				low: 1500,
				med: 1000,
				high: 500
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
		},

		pattyMaxDone: 120, // max doneness of a side before we blink out
		pattyMaxFlips: 3, // number of flips before a patty disentegrates
		pattyBurnNegChance: 20,
		pattyReUpCost: 10000, // cost in cents of getting another shipment of patties
		fireGrowInterval: 8000, // number of ms between each fire grow
		fireGrowSize: 20, // number of px a fire grows on each side
		fireEndDelay: 10000, // how long a fire burns once it's filled up the griddle
		fireDebug: false,
		fireCount: 0,

		crudShrinkInterval: 10000, // ms between each shrink of crud
		crudShrinkSize: 5, // number of pixels on each side the crud shrinks
		crudDebug: false,
		crudCount: 0,

		// scoring
		tipAmountMultiplier: 1, // basically the level of tips you receive
		tipAmountPercentageLower: 2,
		tipAmountPercentageUpper: 30,
		yulpFrequency: 5, // percentage of time an order will be for a yulp reviewer

		// debug flags
		userDebug: false,
		dragDebug: false,
		placementDebug: false,
		orderDebug: false,
		scoringDebug: false,

		// give the player a bonus if they fill the order quickly
		// percent is what percent of maxAge they need to fill the order within
		orderSpeedBonus: {
			percent: 10,
			bonus: 10
		},

		pattyScores: {
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
		},

		pattyScoresPrint: function (prefix) {
			prefix = typeof prefix !== 'undefined' ? prefix : "";

			console.log(prefix + "Burger Scoring Chart");
			console.log(prefix + "BURNT: Anything over 100%");
			console.log(prefix + "PERFECT: 100 to " + (100 - this.pattyScores.perfect.range));
			console.log(prefix + "GREAT: " + ((100 - this.pattyScores.perfect.range) - 1) + " to " + (100 - this.pattyScores.great.range));
			console.log(prefix + "OK: " + ((100 - this.pattyScores.great.range) - 1) + " to " + (100 - this.pattyScores.ok.range));
			console.log(prefix + "BAD: " + ((100 - this.pattyScores.ok.range) - 1) + " to " + (100 - this.pattyScores.bad.range));
			console.log(prefix + "DANGER: " + ((100 - this.pattyScores.bad.range) - 1) + " to 0");
		},

		heatModifiers: {
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
		},

		heatModifiersPrint: function (prefix) {
			prefix = typeof prefix !== 'undefined' ? prefix : "";

			console.log(prefix + "HeatModifier Scale:");
			console.log(prefix + "SIZZLING: 100 to " + (100 - this.heatModifiers.sizzling.range));
			console.log(prefix + "WARM: " + ((100 - this.heatModifiers.sizzling.range) - 1) + " to " + (100 - this.heatModifiers.warm.range));
			console.log(prefix + "COLD: " + ((100 - this.heatModifiers.warm.range) - 1) + " to " + (100 - this.heatModifiers.cold.range));
			console.log("STALE: " + ((100 - this.heatModifiers.cold.range) - 1) + " to 0");
		},

		pause: function (sound) {
			this.paused = true;

			sound = (typeof sound === "undefined") ? true : sound;

			if (sound) {
				soundManager.pauseAll();
			}

			PrepTable.stopTimer();
			orderCollection.stopTimer();
			Griddle.turnOff();

			// disable the garbage icons
			$(".garbageIcon").each(function (k, v) {
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
		},

		resume: function () {
			var order, val;

			if (this.paused) {
				this.paused = false;

				soundManager.resumeAll();
				PrepTable.startTimer();
				orderCollection.startTimer();

				$(".garbageIcon").each(function (k, v) {
					$(v).on("click", function (e) {
						Player.garbageCan += 1;
						PrepTable.removePatty($(this).parent().attr("id"));
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

				if (Griddle.cookInterval > 0) {
					Griddle.turnOn(Griddle.cookInterval);
				}

				$("#lowButton, #medButton, #highButton, #fillOrder").removeAttr("disabled");
				$("[id^=patty]").draggable("enable");

				this.nextOrder = window.setTimeout(function () {
					order = Object.create(Order);

					val = Math.floor(Math.random() * (Mechanics.prepTableSlots[Player.upgrades.prepTableSize.level] - 1)) + 1;

					if (Mechanics.orderDebug) {
						console.log("Setting up the next order timer...");
					}

					order.burgerCount = val;
					order.maxAge = Math.floor(Math.random() * (Mechanics.orderMaxAgeUpper - Mechanics.orderMaxAgeLower)) + Mechanics.orderMaxAgeLower;
					orderCollection.addOrder(order);
				}, Math.floor(Math.random() * (Mechanics.orderFrequencies[Player.upgrades.truckExterior.level].upper - Mechanics.orderFrequencies[Player.upgrades.truckExterior.level].lower)) + Mechanics.orderFrequencies[Player.upgrades.truckExterior.level].lower);

				$("#pauseButton, #resumeButton").toggle();
			}
		},

		popUpDefaults: {
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
			open: function (e, ui) {
				if (!Mechanics.paused) {
					Mechanics.pause();
					Mechanics.overlayPaused = true;
				}
			},
			close: function (e, ui) {
				if (Mechanics.overlayPaused) {
					Mechanics.resume();
					Mechanics.overlayPaused = false;
				}
			}
		},

		upgrades: {
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
		},

		buffs: {
			fireExtinguisher: {
				price: 50,
				id: 'buffFireExtinguisher',
				name: 'Fire Extinguisher',
				description: 'This item can be used to instantly put out grease fires on your griddle.',
				bgPosOn: '0 -139px',
				bgPosOff: '-79px -139px',
				click: function () {
					var x;

					if (!Mechanics.paused) {
						if (Mechanics.fireDebug) {
							console.log("using an extinguisher to remove all fires!");
						}

						for (x = 0; x < Griddle.fires.length; x += 1) {
							Griddle.fires[x].destroy();
						}

						soundManager.getSoundById('hurray').play();
						Player.buffs.fireExtinguisher.count -= 1;
						Mechanics.updateBuffs();
					}
				}
			},
			microwave: {
				price: 50,
				id: 'buffMicrowave',
				name: 'Microwave',
				description: 'Use this buff to instantly fulfill an order.  It takes burgers directly out of your stash, cooks them and sends them out!  Note that microwaved burgers will not get top quality points or tips.',
				bgPosOn: '0 -64px',
				bgPosOff: '-78px -66px',
				click: function () {
					var orderCount, patties, x, patty;

					if (!Mechanics.paused) {
						if (orderCollection.currentOrder) {
							orderCount = orderCollection.getOrder(orderCollection.currentOrder).burgerCount;

							if (Player.dailyPatties >= orderCount) {
								// create the patties
								patties = [];

								for (x = 0; x < orderCount; x += 1) {
									patty = Object.create(Patty, {
										'posTop': {
											value: -50
										},
										'posLeft': {
											value: -50
										}
									});

									// set the doneness
									patty.curSide = 100 - (Mechanics.pattyScores.ok.range - 1);
									patty.flipSide = 100 - (Mechanics.pattyScores.ok.range - 1);

									// set the heat
									patty.remain = 100 - (Mechanics.heatModifiers.warm.range);
									patty.max = 100;

									Player.dailyPatties -= 1;
									Player.burgersAllTime += 1;

									if (Player.dailyPatties === 0) {
										$("#curBurgers").html("<span id='zeroBurgs'>0</span>");
										$("#outOfBurgersToolTip").dialog("open");
									} else {
										$("#curBurgers").html(Player.dailyPatties);
									}

									patties.push(patty);
								}

								// fill the order!
								orderCollection.fillOrder(patties);

								soundManager.getSoundById('hurray').play();

								Player.buffs.microwave.count -= 1;
								Mechanics.updateBuffs();
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
				bgPosOn: '0 -313px',
				bgPosOff: '-87px -320px',
				click: function () {
					var x;

					if (!Mechanics.paused) {
						// remove all crud
						if (Mechanics.crudDebug) {
							console.log("Using scraper to remove all crud!");
						}

						for (x = 0; x < Griddle.crud.length; x += 1) {
							Griddle.removeCrud(Griddle.crud[x].id);
						}

						Player.buffs.scraper.count -= 1;
						soundManager.getSoundById('hurray').play();

						Mechanics.updateBuffs();
					}
				}
			},
			pause: {
				price: 50,
				id: 'buffPause',
				name: 'Pause Button',
				description: 'Turns the heat off to your griddle, and keeps all the burgers on it held at their current level of doneness until you turn the heat back on!',
				bgPosOn: '0 -395px',
				bgPosOff: '-92px -402px',
				click: function () {
					if (!Mechanics.paused) {
						Griddle.turnOff();
						$("#lowButton").css("background-color", "");
						$("#medButton").css("background-color", "");
						$("#highButton").css("background-color", "");

						Player.buffs.pause.count -= 1;
						soundManager.getSoundById('hurray').play();
						Mechanics.updateBuffs();
					}
				}
			},
			heatLamp: {
				price: 50,
				id: 'buffHeatLamp',
				name: 'Heat Lamp',
				description: 'Slows down the temperature drop of burgers sitting on your prep table.',
				bgPosOn: '0 -226px',
				bgPosOff: '-82px -229px',
				click: function () {
					if (!Mechanics.paused) {
						if (heatLamp.active === false) {
							heatLamp.startTimer();
							Player.buffs.heatLamp.count -= 1;
							Mechanics.updateBuffs();
						}
					}
				}
			},
			twitter: {
				price: 50,
				id: 'buffTwitter',
				name: 'Twitter Post',
				description: 'Post to Twitter to attract more visitors to your food truck!',
				bgPosOn: '0 0',
				bgPosOff: '-66px 0',
				click: function () {
					if (!Mechanics.paused) {
						if (twitter.active === false) {
							twitter.startTimer();
							Player.buffs.twitter.count -= 1;
							Mechanics.updateBuffs();
						}
					}
				}
			},
			sauce: {
				price: 50,
				id: 'buffSauce',
				name: 'Secret Sauce',
				description: 'This buff makes all your burgers taste perfect to the customers, regardless of how cooked (or uncooked) they actually are.',
				bgPosOn: '0 -566px',
				bgPosOff: '-76px -566px',
				click: function () {
					if (!Mechanics.paused) {
						if (sauce.active === false) {
							sauce.startTimer();
							Player.buffs.sauce.count -= 1;
							Mechanics.updateBuffs();
						}
					}
				}
			},
			helper: {
				price: 50,
				id: 'buffHelper',
				name: 'Hire an Assistant',
				description: 'Let someone else do the work!  With this buff enabled, all your patties will be automatically flipped for you once they reach 100%!  Note that you still need to move burgers off the grill to the prep table.',
				bgPosOn: '0 -478px',
				bgPosOff: '-96px -480px',
				click: function () {
					if (!Mechanics.paused) {
						if (helper.active === false) {
							helper.startTimer();
							Player.buffs.helper.count -= 1;
							Mechanics.updateBuffs();
						}
					}
				}
			}
		},

		updateBuffs: function () {
			var keys, x;

			keys = Object.keys(this.buffs);

			for (x = 0; x < keys.length; x += 1) {
				$("#" + this.buffs[keys[x]].id + "Count").html(Player.buffs[keys[x]].count);
				$("#" + this.buffs[keys[x]].id).css("background-image", "url('images/buff_sprites.png')");

				if (Player.buffs[keys[x]].count > 0) {
					$("#" + this.buffs[keys[x]].id)
						//.css("background-image", "url('images/" + keys[x] + "_on.png')")
						.css("background-position", Mechanics.buffs[keys[x]].bgPosOn)
						.off("click")
						.on("click", this.buffs[keys[x]].click);
				} else {
					if (Player.buffs[keys[x]].count < 0) {
						Player.buffs[keys[x]].count = 0;
					}

					$("#" + this.buffs[keys[x]].id)
						//.css("background-image", "url('images/" + keys[x] + "_off.png')")
						.css("background-position", Mechanics.buffs[keys[x]].bgPosOff)
						.off("click");
				}
			}
		}
	}, heatLamp = {
		timer: null,
		active: false,
		duration: Mechanics.buffDuration,

		startTimer: function () {
			this.active = true;
			this.timer = window.setInterval(this.draw, 1000);
			Mechanics.heatLampInterval = 1500;

			this.draw();
		},

		stopTimer: function () {
			window.clearInterval(this.timer);
			this.timer = null;
		},

		draw: function () {
			heatLamp.duration -= 1;

			var pb = progressBar(heatLamp.duration, Mechanics.buffDuration, $("#buffHeatLamp").width());

			if ($("#buffHeatLamp .progressBar").length > 0) {
				$("#buffHeatLamp .progressBar").css("width", pb.fillWidth);
			} else {
				$("#buffHeatLamp").append("<div class='progressBar' style='position: absolute; top: 0px; border: 1px solid black; height: 10px; background-color: red; width: " + pb.fillWidth + "px;'></div>");
			}

			if (heatLamp.duration === 8) {
				soundManager.getSoundById('tick').play();
			} else if (heatLamp.duration === 0) {
				heatLamp.active = false;
				heatLamp.stopTimer();

				// reset the duration
				heatLamp.duration = Mechanics.buffDuration;

				// reset the heatlamp Mechanics to their default
				Mechanics.heatLampInterval = 1000;

				// delete the timer div
				$("#buffHeatLamp .progressBar").remove();
			}
		}
	}, twitter = {
		timer: null,
		active: false,
		duration: Mechanics.buffDuration,

		startTimer: function () {
			this.active = true;
			this.timer = window.setInterval(this.draw, 1000);

			// initialize the improved Mechanics
			Mechanics.orderFrequencyLower = 10000;
			Mechanics.orderFrequencyUpper = 30000;

			this.draw();
		},

		stopTimer: function () {
			window.clearInterval(this.timer);
			this.timer = null;
		},

		draw: function () {
			twitter.duration -= 1;

			var pb = progressBar(twitter.duration, Mechanics.buffDuration, $("#buffTwitter").width());

			if ($("#buffTwitter .progressBar").length > 0) {
				$("#buffTwitter .progressBar").css("width", pb.fillWidth);
			} else {
				$("#buffTwitter").append("<div class='progressBar' style='position: absolute; top: 0px; border: 1px solid black; height: 10px; background-color: red; width: " + pb.fillWidth + "px;'></div>");
			}

			if (twitter.duration === 8) {
				soundManager.getSoundById('tick').play();
			} else if (twitter.duration === 0) {
				twitter.active = false;
				twitter.stopTimer();

				// reset the duration
				twitter.duration = Mechanics.buffDuration;

				// reset the Mechanics back to their default
				Mechanics.orderFrequencyLower = 20000;
				Mechanics.orderFrequencyUpper = 120000;

				// delete the timer div
				$("#buffTwitter .progressBar").remove();
			}
		}
	}, sauce = {
		timer: null,
		active: false,
		duration: Mechanics.buffDuration,

		startTimer: function () {
			this.active = true;
			this.timer = window.setInterval(this.draw, 1000);

			// initialize the improved Mechanics

			this.draw();
		},

		stopTimer: function () {
			window.clearInterval(this.timer);
			this.timer = null;
		},

		draw: function () {
			sauce.duration -= 1;

			var pb = progressBar(sauce.duration, Mechanics.buffDuration, $("#buffSauce").width());

			if ($("#buffSauce .progressBar").length > 0) {
				$("#buffSauce .progressBar").css("width", pb.fillWidth);
			} else {
				$("#buffSauce").append("<div class='progressBar' style='position: absolute; top: 0px; border: 1px solid black; height: 10px; background-color: red; width: " + pb.fillWidth + "px;'></div>");
			}

			if (sauce.duration === 8) {
				soundManager.getSoundById('tick').play();
			} else if (sauce.duration === 0) {
				sauce.active = false;
				sauce.stopTimer();

				// reset the duration
				sauce.duration = Mechanics.buffDuration;

				// reset the Mechanics back to their default

				// delete the timer div
				$("#buffSauce .progressBar").remove();
			}
		}
	}, helper = {
		timer: null,
		active: false,
		duration: Mechanics.buffDuration,

		startTimer: function () {
			this.active = true;
			this.timer = window.setInterval(this.draw, 1000);

			// initialize the improved Mechanics

			this.draw();
		},

		stopTimer: function () {
			window.clearInterval(this.timer);
			this.timer = null;
		},

		draw: function () {
			helper.duration -= 1;

			var pb = progressBar(helper.duration, Mechanics.buffDuration, $("#buffHelper").width());

			if ($("#buffHelper .progressBar").length > 0) {
				$("#buffHelper .progressBar").css("width", pb.fillWidth);
			} else {
				$("#buffHelper").append("<div class='progressBar' style='position: absolute; top: 0px; border: 1px solid black; height: 10px; background-color: red; width: " + pb.fillWidth + "px;'></div>");
			}

			if (helper.duration === 8) {
				soundManager.getSoundById('tick').play();
			} else if (helper.duration === 0) {
				helper.active = false;
				helper.stopTimer();

				// reset the duration
				helper.duration = Mechanics.buffDuration;

				// reset the Mechanics back to their default

				// delete the timer div
				$("#buffHelper .progressBar").remove();
			}
		}
	}, PrepTable = {
		patties: [],
		pattyCount: 0,
		timer: null,

		addPatty: function (patty) {
			if (this.patties.length < Mechanics.prepTableSlots[Player.upgrades.prepTableSize.level]) {
				var newId = this.pattyCount;
				this.pattyCount += 1;
				patty.id = "prep" + newId;
				patty.idHash = "#" + patty.id;
				patty.max = Mechanics.prepTableExpire;
				patty.remain = patty.max;
				this.patties.push(patty);

				// determine a color for the heat bar
				if (patty.cookedWell()) {
					patty.color = "#a3f141";
				} else {
					patty.color = "red";
				}

				this.draw();

				if (!Mechanics.paused) {
					this.startTimer();
				}
			}
		},

		getPatty: function (id) {
			var x;

			for (x = 0; x < this.patties.length; x += 1) {
				if (this.patties[x].id === id) {
					return this.patties[x];
				}
			}

			return false;
		},

		getOldestPatty: function () {
			var curTime, curId, x, secsOld;

			curTime = 0;
			curId = "";

			for (x = 0; x < this.patties.length; x += 1) {
				secsOld = this.patties[x].max - this.patties[x].remain;

				if (curTime === 0) {
					curTime = secsOld;
					curId = this.patties[x].id;
				} else if (secsOld > curTime) {
					curTime = secsOld;
					curId = this.patties[x].id;
				}
			}

			return this.getPatty(curId);
		},

		removePatty: function (id) {
			var ret, tmp, x;

			if (id) {
				ret = null;

				// remove a specific patty from the array
				tmp = [];

				for (x = 0; x < this.patties.length; x += 1) {
					if (this.patties[x].id !== id) {
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

			if (this.patties.length < Mechanics.prepTableSlots[Player.upgrades.prepTableSize.level]) {
				$("#prepTable").droppable("enable");
			}

			return ret;
		},

		removeOldestPatty: function () {
			return this.removePatty(this.getOldestPatty().id);
		},

		garbagePatty: function (pattyId) {
			return function (e) {
				Player.garbageCan += 1;
				PrepTable.removePatty(pattyId);
			};
		},

		startTimer: function () {
			if (this.timer === null) {
				this.timer = window.setInterval(bindMe(this, this.decRemain), Mechanics.heatLampInterval);
			}
		},

		decRemain: function () {
			var x;

			for (x = 0; x < this.patties.length; x += 1) {
				if (this.patties[x].remain > 0) {
					this.patties[x].remain -= 1;
				} else {
					// patty went cold and is discarded
					Player.prepTableCold += 1;
					this.removePatty(this.patties[x].id);
				}
			}

			this.draw();
		},

		stopTimer: function () {
			if (this.timer !== null) {
				clearInterval(this.timer);
			}

			this.timer = null;
		},

		draw: function (refresh) {
			var x, pb, pattyId, prepTableTitle, addEl;

			if (refresh) {
				$("#prepTable>[id^=slot], #prepTable>.prepPatty").remove();
			}

			// first we draw all the slots as hidden
			if (this.patties.length < Mechanics.prepTableSlots[Player.upgrades.prepTableSize.level]) {
				for (x = 0; x < (Mechanics.prepTableSlots[Player.upgrades.prepTableSize.level]); x += 1) {
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
			for (x = Mechanics.prepTableSlots[Player.upgrades.prepTableSize.level]; x < Mechanics.prepTableMaxSlots; x += 1) {
				if (!$("#slot" + x).length) {
					$("<div>Slot #" + (x + 1) + "</div>")
						.addClass("prepPatty prepTableSlotFill")
						.css("display", "")
						.attr("id", "slot" + x)
						.appendTo("#prepTable");
				}
			}

			// now go through any patties, either drawing, or updating!
			for (x = 0; x < this.patties.length; x += 1) {
				if ($(this.patties[x].idHash).length > 0) {
					// update the patty div on preptable
					pb = progressBar(this.patties[x].remain, this.patties[x].max, $("#prepTable").width());

					$(this.patties[x].idHash + " .progressBar")
						.css("width", pb.fillWidth)
						.html(pb.percent + "%");
				} else {
					// draw the patty div on preptable
					pb = progressBar(this.patties[x].remain, this.patties[x].max, $("#prepTable").width());

					pattyId = this.patties[x].id;

					// mouseover text for the progress bar
					prepTableTitle = "Burger Cook Level: " + this.patties[x].cookedLevel();

					addEl = $("<div></div>")
							.attr("id", this.patties[x].id)
							.addClass("prepPatty")
							.append("<div class='progressBar' title='" + prepTableTitle + "' style='height: 100%; background-color: " + this.patties[x].color + "; width: " + pb.fillWidth + "px;'>" + pb.percent + "%</div>")
							.append($("<div class='garbageIcon'><img src='images/trash.png' height='28' /></div>").click(PrepTable.garbagePatty(pattyId)));

					$("#slot" + x).after(addEl).toggle();
				}
			}
		}
	}, Order = {
		number: 0,
		burgerCount: 0,
		age: 0,
		maxAge: 0,
		filled: false,
		result: "",

		draw: function () {
			$("#currentOrder .orderNumber").html(this.number);
			$("#currentOrder .burgerCount").html(this.burgerCount);
			$("#currentOrder .orderAge").html(getTime(this.age));
		}
	}, orderCollection = {
		orders: [],
		orderCounter: 0,
		currentOrder: null,
		timer: null,

		startTimer: function () {
			if (this.timer === null) {
				this.timer = window.setInterval(bindMe(orderCollection, orderCollection.ageOrders), 1000);
			}
		},

		stopTimer: function () {
			if (this.timer !== null) {
				clearInterval(this.timer);
			}

			this.timer = null;
		},

		ageOrders: function () {
			var x, expiring;

			for (x = 0; x < this.orders.length; x += 1) {
				this.orders[x].age += 1;

				// checking for expiring orders here
				expiring = false;

				if (this.orders[x].age > this.orders[x].maxAge && !this.orders[x].filled) {
					if (this.orders[x].number === this.currentOrder) {
						this.currentOrder = null;
					}

					$("#currentOrderBG").fadeIn(200).fadeOut(200).fadeIn(200).fadeOut(200).fadeIn(200).fadeOut(200, orderCollection.orderWalk());

					this.removeOrder(this.orders[x].number);
					expiring = true;
				}
			}

			if (!expiring) {
				this.draw();
			}
		},

		draw: function () {
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
		},

		orderWalk: function () {
			soundManager.getSoundById('boo').play();
			Player.ordersWalked += 1;
			orderCollection.draw();

			if (!Player.expiringOrderToolTip) {
				$("#expiringOrderToolTip").dialog("open");
				Player.expiringOrderToolTip = true;
			}
		},

		orderCount: function () {
			var ret, x;

			ret = 0;

			for (x = 0; x < this.orders.length; x += 1) {
				if (this.orders[x].filled === false) {
					ret += 1;
				}
			}

			return ret;
		},

		ordersFilled: function () {
			var ret, x;

			ret = 0;

			for (x = 0; x < this.orders.length; x += 1) {
				if (this.orders[x].filled) {
					ret += 1;
				}
			}

			return ret;
		},

		burgerTotal: function () {
			var ret, x;

			ret = 0;

			for (x = 0; x < this.orders.length; x += 1) {
				if (this.orders[x].filled === false) {
					ret += this.orders[x].burgerCount;
				}
			}

			return ret;
		},

		addOrder: function (order) {
			var burgersLeft;

			// make sure this order is possible with the number of patties remaining
			if (Mechanics.orderDebug) {
				console.log("Griddle patty count: " + Griddle.patties.length);
				console.log("Preptable patty count: " + PrepTable.patties.length);
				console.log("Unused patty count: " + Player.dailyPatties);
				console.log("Burgers all day: " + orderCollection.burgerTotal());
			}

			burgersLeft = Griddle.patties.length + PrepTable.patties.length + Player.dailyPatties - orderCollection.burgerTotal();

			if (Mechanics.orderDebug) {
				console.log("We have " + burgersLeft + " burgers left.  Order is for " + order.burgerCount);
			}

			if (order.burgerCount > burgersLeft) {
				if (Mechanics.orderDebug) {
					console.log("Reducing order burgerCount to " + burgersLeft);
				}

				order.burgerCount = burgersLeft;
			}

			if (order.burgerCount <= 0) {
				if (Mechanics.orderDebug) {
					console.log("No patties left to fill order!  No new orders scheduled.");
				}

				return;
			}

			// increment the stats order count
			Player.ordersAllTime += 1;

			// generate an order number
			this.orderCounter += 1;
			order.number = this.orderCounter;

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

			// this should really be pausing, and happening onfinish of the above sound!
			if (!Player.firstOrderToolTip) {
				$("#firstOrderToolTip").dialog("open");
				Player.firstOrderToolTip = true;
			}

			if (!Mechanics.paused) {
				Mechanics.nextOrder = window.setTimeout(function () {
					var order, val, val2;

					// calculate a number of burgers for the order
					val = Math.floor(Math.random() * (Mechanics.prepTableSlots[Player.upgrades.prepTableSize.level] - 1)) + 1;

					// calculate a maximum age for the order
					val2 = Math.floor(Math.random() * (Mechanics.orderMaxAgeUpper - Mechanics.orderMaxAgeLower)) + Mechanics.orderMaxAgeLower;

					order = Object.create(Order, {
						'burgerCount': {
							value: val
						},
						'maxAge': {
							value: val2
						}
					});

					if (Mechanics.orderDebug) {
						console.log("Setting up the next order!");
					}

					orderCollection.addOrder(order);
				}, Math.floor(Math.random() * (Mechanics.orderFrequencies[Player.upgrades.truckExterior.level].upper - Mechanics.orderFrequencies[Player.upgrades.truckExterior.level].lower)) + Mechanics.orderFrequencies[Player.upgrades.truckExterior.level].lower);
			}
		},

		removeOrder: function (number) {
			var tmp, x;

			// remove order identified by the order#
			tmp = [];

			for (x = 0; x < this.orders.length; x += 1) {
				if (this.orders[x].number !== number) {
					tmp.push(this.orders[x]);
				}
			}

			this.orders = tmp;
		},

		getOrder: function (number) {
			var x;

			for (x = 0; x < this.orders.length; x += 1) {
				if (this.orders[x].number === number) {
					return this.orders[x];
				}
			}
		},

		getOldest: function () {
			var orderNum, orderTime, x;

			orderNum = "";
			orderTime = 0;

			for (x = 0; x < this.orders.length; x += 1) {
				if (this.orders[x].filled === false) {
					if (orderTime === 0) {
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

			if (orderNum !== "") {
				return this.getOrder(orderNum);
			}

			return false;
		},

		fillOrder: function (patties) {
			var x, age, maxAge, score, yulp, orderPercent, tipPercentage, tip, tmp, scoringTxt;

			// clean up the order
			for (x = 0; x < this.orders.length; x += 1) {
				if (this.orders[x].number === this.currentOrder) {
					age = this.orders[x].age;
					maxAge = this.orders[x].maxAge;

					this.orders[x].filled = true;
					this.currentOrder = null;
					this.draw();

					soundManager.getSoundById('orderup').play();

					break;
				}
			}

			Player.ordersFilled += 1;

			// compute the score
			score = 0;
			yulp = [];

			if (Mechanics.scoringDebug) {
				console.log("SCORING");
				Mechanics.pattyScoresPrint();
				Mechanics.heatModifiersPrint();

				console.log("((Burger Score * Heat Modifier) * Beef Quality) * Popularity Modifier");
				console.log("********************");
			}

			for (x = 0; x < patties.length; x += 1) {
				score += patties[x].score();

				yulp.push(patties[x].yulp());
			}

			// add the popularity multiplier
			score = score * Player.popularity;

			// order speed bonus
			orderPercent = (age / maxAge) * 100;

			if (orderPercent < Mechanics.orderSpeedBonus.percent) {
				// add 1 to all the yulp scores
				for (x = 0; x < yulp.length; x += 1) {
					if (yulp[x] < 5) {
						yulp[x] += 1;
					}
				}

				if (Mechanics.scoringDebug) {
					console.log("Speed Bonus: " + Math.floor((score * (Mechanics.orderSpeedBonus.bonus / 100))));
				}

				Player.lastOrderDetails += "Speed Bonus: " + Mechanics.orderSpeedBonus.bonus + "<br/>";

				score += Math.floor((score * (Mechanics.orderSpeedBonus.bonus	/ 100)));

				// always gets a tip if the order is fulfilled quickly
				tipPercentage = Math.floor((Math.random() * (Mechanics.tipAmountPercentageUpper - Mechanics.tipAmountPercentageLower)) + Mechanics.tipAmountPercentageLower);

				tip = (score * (tipPercentage)) * Mechanics.tipAmountMultiplier;

				if (Mechanics.scoringDebug) {
					console.log("Random tip percentage between " + Mechanics.tipAmountPercentageLower + " and " + Mechanics.tipAmountPercentageUpper + ": " + tipPercentage + "%");
					console.log(score + " * " + (tipPercentage) + " * " + Mechanics.tipAmountMultiplier + " = " + tip);
				}

				if (tip > 0) {
					Player.addTip(tip);
				}
			} else {
				Player.lastOrderDetails += "No speed bonus or tip. (" + (maxAge - age) + " / " + maxAge + ") > " + Mechanics.orderSpeedBonus.percent + "%<br/>";

				if (Mechanics.scoringDebug) {
					console.log("Order took " + age + " seconds to get out.  Customer was willing to wait " + maxAge + " seconds.");
					console.log("You took %" + orderPercent + " of the allowed time.  % req'd for tip/bonus was: " + Mechanics.orderSpeedBonus.percent);
				}
			}

			tmp = Math.min.apply(0, yulp);

			if (Mechanics.scoringDebug) {
				console.log("Total: " + score);
				console.log("\n");
			}

			Player.addScore(score);

			// if this is a yulp reviewer, add the review!
			if ((Math.floor(Math.random() * 100) + 1) <= Mechanics.yulpFrequency) {
				Player.yulps.push(tmp);

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

				Player.setYulp();
			}

			if (!Player.hideOrderScoring) {
				scoringTxt = "Burger Score = Doneness Level Score * Heat Level Modifier * Beef Quality<br/>";
				scoringTxt += "Score = (Sum of Individual Burger Scores * Restaurant Popularity) + Speed Bonus<br/>";
				scoringTxt += "Tips = (Score * Tip Percentage) * Tip Multiplier<br/><br/>";

				scoringTxt += Player.lastOrderDetails;
				scoringTxt += "Truck Popularity: " + Player.popularity + "<br/>";
				scoringTxt += "Total Score: " + score + "<br/>";

				$("#orderScoringText").html(scoringTxt);
				$("#orderScoringToolTip").dialog("open");

				Player.lastOrderDetails = "";
			}
		}
	}, Player = {
		// access token when signed in with Google+
		name: "",

		// tooltips
		firstOrderToolTip: false,
		expiringOrderToolTip: false,

		// scoring
		popularity: 1, // a popularity modifier that factors in to the scoring! 
		score: 0, // players score
		tips: 0, // players cash, earned from tips
		yulps: [], // an array storing all the yulp reviews (integers 1-5)
		daysPlayed: [],
		hideOrderScoring: false, // whether to show the order scoring window

		lastOrderDetails: "", // text storing a breakout of the players last filled order

		dailyPatties: 30, // number of patties a user gets per day

		griddleTimeout: 0,
		prepTableTimeout: 0,
		servedCustomers: 0,
		satisfiedCustomers: 0,
		unsatisfiedCustomers: 0,

		// statistics
		burgersAllTime: 0, // number of patties player has ever used
		prepTableCold: 0, // number of patties that have expired on the prep table
		griddleBurn: 0, // number of patties burned on the griddle
		garbageCan: 0, // number of patties thrown into the garbage can
		burnedInFire: 0, // number of patties consumed by a fire
		brokeApart: 0, // number of patties that have broken apart
		ordersAllTime: 0, // number of orders all together
		ordersWalked: 0, // number of orders that have walked away
		ordersFilled: 0, // number of orders successfully filled
		griddleFireCount: 0, // number of fires all time on the griddle
		griddleCrudCount: 0, // number of cruds all time on the griddle

		getStats: function () {
			var ret = "";

			ret += "<h3>Burgers</h3>";
			ret += "Burgers All Time: " + this.burgersAllTime + "<br/>";
			ret += "Broke apart on the griddle: " + this.brokeApart + "<br/>";
			ret += "Burned on the griddle: " + this.griddleBurn + "<br/>";
			ret += "Consumed by griddle fire: " + this.burnedInFire + "<br/>";
			ret += "Went cold on prep table: " + this.prepTableCold + "<br/>";
			ret += "Tossed in the garbage: " + this.garbageCan + "<br/>";

			ret += "<h3>Orders</h3>";
			ret += "Orders All Time: " + this.ordersAllTime + "<br/>";
			ret += "Timed out orders: " + this.ordersWalked + "<br/>";
			ret += "Filled Successfully: " + this.ordersFilled + "<br/>";

			ret += "<h3>Griddle</h3>";
			ret += "Total griddle fires: " + this.griddleFireCount + "<br/>";
			ret += "Total griddle cruds: " + this.griddleCrudCount + "<br/>";

			return ret;
		},

		upgrades: {
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
		},

		buffs: {
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
		},

		save: function () {
			if (Mechanics.userDebug) {
				console.log("saving player data..");
			}

			// put together a request to the couchDB system
			var data = JSON.stringify(Player);

			localStorage.player = data;
		},

		load: function () {
			var saveData, tmpPlayer;

			if (Mechanics.userDebug) {
				console.log("loading player data");
			}

			saveData = localStorage.getItem("player");

			if (saveData !== null) {
				tmpPlayer = JSON.parse(saveData);
				tmpPlayer.load = Player.load;
				tmpPlayer.save = Player.save;
				tmpPlayer.getStats = Player.getStats;
				tmpPlayer.setYulp = Player.setYulp;
				tmpPlayer.addScore = Player.addScore;
				tmpPlayer.addTip = Player.addTip;
				tmpPlayer.removeTip = Player.removeTip;

				Player = tmpPlayer;

				// now update score, tips, yulp, burgercount, buffcounts
				$("#curScore").html(Player.score);
				$("#curTips").html(formatDollars(Player.tips));

				if (Player.dailyPatties === 0) {
					$("#curBurgers").html("<span id='zeroBurgs'>0</span>");
				} else {
					$("#curBurgers").html(Player.dailyPatties);
				}

				Player.lastOrderDetails = "";
				Player.setYulp();
				Mechanics.updateBuffs();

				$("#highButton").attr("title", "High: " + (Mechanics.griddleTemps[Player.upgrades.griddleTemp.level].high / 1000).toFixed(2) + "s/cook");
				$("#medButton").attr("title", "Medium: " + (Mechanics.griddleTemps[Player.upgrades.griddleTemp.level].med / 1000).toFixed(2) + "s/cook");
				$("#lowButton").attr("title", "Low: " + (Mechanics.griddleTemps[Player.upgrades.griddleTemp.level].low / 1000).toFixed(2) + "s/cook");

				return true;
			}

			return false;
		},

		// averages out the yulp scores, updates Mechanics (popularity) and ui
		setYulp: function () {
			var sum, x, avg;

			sum = 0;

			for (x = 0; x < this.yulps.length; x += 1) {
				sum += this.yulps[x];
			}

			avg = sum / this.yulps.length;

			if (Mechanics.scoringDebug) {
				console.log("New average Yulp score: " + avg);
			}

			stars(avg);
		},

		addScore: function (value) {
			Player.score += value;

			$("#curScore").html(Player.score);

			if (Mechanics.userDebug) {
				console.log("saving in the addScore() method.");
			}

			Player.save();
		},

		addTip: function (value) {
			this.tips += value;

			$("<span id='addTip'>+$" + formatDollars(value) + "</span>")
				.appendTo("#tipBox")
				.fadeIn(200)
				.fadeOut(200)
				.fadeIn(200)
				.fadeOut(200)
				.fadeIn(200)
				.fadeOut(200, function () {
					$("#curTips").html(formatDollars(Player.tips));
					$(this).remove();
				});
		},

		removeTip: function (value) {
			this.tips -= value;

			if (this.tips < 0) {
				this.tips = 0;
			}

			$("#curTips").html(formatDollars(this.tips));
		}
	}, Griddle = {
		patties: [],
		fires: [],
		crud: [],
		griddleOn: false,
		timer: null,
		cookInterval: 0,
		pattyCount: 0,

		getPattyID: function () {
			var ret = this.pattyCount;

			this.pattyCount += 1;

			return ret;
		},

		turnOn: function (interval) {
			var x;

			if (this.timer !== null) {
				clearInterval(this.timer);
			} else {
				if (this.patties.length > 0) {
					soundManager.getSoundById('patty').play();
				}
			}

			this.timer = window.setInterval(bindMe(Griddle, Griddle.cook), interval);
			this.griddleOn = true;
			this.cookInterval = interval;

			// start back up the timers on any fire or crud
			for (x = 0; x < this.crud.length; x += 1) {
				this.crud[x].startTimer();
			}

			for (x = 0; x < this.fires.length; x += 1) {
				this.fires[x].startTimer();
			}
		},

		turnOff: function () {
			var x;

			if (this.timer !== null) {
				clearInterval(this.timer);
			}

			this.timer = null;
			this.griddleOn = false;

			// stop any crud or fire timers
			for (x = 0; x < this.crud.length; x += 1) {
				this.crud[x].stopTimer();
			}

			for (x = 0; x < this.fires.length; x += 1) {
				this.fires[x].stopTimer();
			}
		},

		cook: function () {
			var x;

			if (this.patties.length > 0) {
				for (x = 0; x < this.patties.length; x += 1) {
					this.patties[x].cook();
				}
			}

			this.draw();
		},

		addCrud: function (left, top) {
			var crud = Object.create(Crud, {
				'startX': {
					value: left,
				},
				'startY': {
					value: top
				}
			});

			crud.id = "crud" + Mechanics.crudCount;
			crud.idHash = "#" + crud.id;

			if (Mechanics.crudDebug) {
				console.log("Adding crud to griddle with an id of " + crud.id);
			}

			Mechanics.crudCount += 1;

			crud.draw();
			crud.startTimer();
			this.crud.push(crud);
		},

		removeCrud: function (id) {
			var ret, x;

			ret = [];

			for (x = 0; x < this.crud.length; x += 1) {
				if (this.crud[x].id !== id) {
					ret.push(this.crud[x]);
				} else {
					this.crud[x].destroy();
				}
			}

			this.crud = ret;
		},

		addFire: function (left, top) {
			var fire = Object.create(Fire, {
				'startX': {
					value: left
				},
				'startY': {
					value: top
				}
			});

			fire.id = "fire" + Mechanics.fireCount;
			fire.idHash = "#" + fire.id;
			Mechanics.fireCount += 1;
			fire.draw();
			fire.startTimer();
			this.fires.push(fire);
		},

		removeFire: function (id) {
			var ret, x;

			ret = [];

			for (x = 0; x < this.fires.length; x += 1) {
				if (this.fires[x].id !== id) {
					ret.push(this.fires[x]);
				}
			}

			this.fires = ret;
		},

		addPatty: function (patty) {
			var id;

			// update the leaderboard daily burger count
			Player.dailyPatties -= 1;
			Player.burgersAllTime += 1;
			Player.save();

			if (Player.dailyPatties === 0) {
				$("#curBurgers").html("<span id='zeroBurgs'>0</span>");
				$("#outOfBurgersToolTip").dialog("open");
			} else {
				$("#curBurgers").html(Player.dailyPatties);
			}

			// get a unique id for this patty
			id = this.getPattyID();
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
		},

		removePatty: function (id) {
			var ret, patties, x;

			ret = null;
			patties = [];

			for (x = 0; x < this.patties.length; x += 1) {
				if (this.patties[x].id !== id) {
					patties.push(this.patties[x]);
				} else {
					ret = this.patties[x];
				}
			}

			this.patties = patties;

			this.draw();

			return ret;
		},

		draw: function () {
			var gWidth, gHeight, x, step, id;

			// check to make sure the griddle is drawn the right size, according to its level!
			gWidth = $("#activeGriddle").width();
			gHeight = $("#activeGriddle").height();

			if (gWidth !== Mechanics.griddleSizes[Player.upgrades.griddleSize.level].width || gHeight !== Mechanics.griddleSizes[Player.upgrades.griddleSize.level].height) {
				$("#activeGriddle").css("width", Mechanics.griddleSizes[Player.upgrades.griddleSize.level].width + "px");
				$("#activeGriddle").css("height", Mechanics.griddleSizes[Player.upgrades.griddleSize.level].height + "px");
			}

			// if we have patties to draw
			if (this.patties.length > 0) {
				for (x = 0; x < this.patties.length; x += 1) {
					// if the patty has already been drawn, refresh it's content
					if ($(this.patties[x].idHash).length > 0) {
						$(this.patties[x].idHash).html("<span class='white'>" + this.patties[x].curSide + "%</span><span class='flipSide white'>" + this.patties[x].flipSide + "%</span>");
						step = Math.floor(this.patties[x].flipSide / 10);

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
								start: this.patties[x].dragStart,
								stop: this.patties[x].dragStop,
							})
							.droppable({
								greedy: true,
								tolerance: 'touch',
								drop: this.patties[x].drop
							})
							.css("position", "absolute")
							.appendTo('body');
					}

					if (this.patties[x].flips === (Mechanics.pattyMaxFlips - 1)) {
						// generated at http://www.patternify.com
						$(this.patties[x].idHash).css("background-image", "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAG0lEQVQIW2P8DwSMQMAABWAGsiBcBkUFjAOiAbjdCAX194QZAAAAAElFTkSuQmCC')");
					}
				}
			}
		}
	}, Crud = {
		id: "",
		idHash: "",
		timer: null,
		startX: 0,
		startY: 0,

		draw: function () {
			if (Mechanics.crudDebug) {
				console.log("In the crud .draw(): " + this.id);
			}

			// create a 1x1 div at the X and Y
			$("<div></div>")
				.attr("id", this.id)
				.addClass("crudBox")
				.css("width", 100)
				.css("height", 100)
				.css("top", this.startY)
				.css("left", this.startX)
				.droppable({
					greedy: true,
					tolerance: 'touch',
					drop: function (event, ui) {
						if (Mechanics.dragDebug) {
							console.log("in the crud droppable drop!");
						}

						soundManager.getSoundById('error').play();
						ui.draggable.draggable('option', 'revert', true);
					}
				})
				.appendTo("body");
		},

		startTimer: function () {
			if (Mechanics.crudDebug) {
				console.log("Starting crud shrink timer on " + this.id);
			}

			this.timer = window.setInterval(bindMe(this, this.shrink), Mechanics.crudShrinkInterval);
		},

		stopTimer: function () {
			if (Mechanics.crudDebug) {
				console.log("Stopping crud shrink timer on " + this.id);
			}

			window.clearInterval(this.timer);
			this.timer = null;
		},

		destroy: function () {
			if (Mechanics.crudDebug) {
				console.log("Destroying " + this.id);
			}

			this.stopTimer();
			$(this.idHash).remove();
		},

		shrink: function () {
			var crudPos, crudTop, crudLeft, crudWidth, crudHeight;

			if (Mechanics.crudDebug) {
				console.log("Shrinking " + this.id);
			}

			crudPos = $(this.idHash).position();
			crudTop = crudPos.top + Mechanics.crudShrinkSize;
			crudLeft = crudPos.left + Mechanics.crudShrinkSize;
			crudWidth = $(this.idHash).width() - (Mechanics.crudShrinkSize * 2);
			crudHeight = $(this.idHash).height() - (Mechanics.crudShrinkSize * 2);

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
				Griddle.removeCrud(this.id);
			}
		}
	}, Fire = {
		// increment the global firecounter everytime we create a new fire
		id: "",
		idHash: "",
		timer: null,
		startX: 0,
		startY: 0,

		draw: function () {
			// create a 1x1 div at the X and Y
			$("<div></div>")
				.attr("id", this.id)
				.addClass("fireBox")
				.css("width", 100)
				.css("height", 100)
				.css("top", this.startY)
				.css("left", this.startX)
				.droppable({
					greedy: true,
					tolerance: 'touch',
					drop: function (event, ui) {
						if (Mechanics.dragDebug) {
							console.log("in the fire droppable drop!");
						}

						soundManager.getSoundById('error').play();
						ui.draggable.draggable('option', 'revert', true);
					}
				})
				.appendTo("body");
		},

		startTimer: function () {
			if (Mechanics.fireDebug) {
				console.log("Starting timer on " + this.id);
			}

			this.timer = window.setInterval(bindMe(this, this.grow), Mechanics.fireGrowInterval);
		},

		stopTimer: function () {
			if (Mechanics.fireDebug) {
				console.log("Stopping the fire timer on " + this.id);
			}

			window.clearInterval(this.timer);
			this.timer = null;
		},

		destroy: function () {
			if (Mechanics.fireDebug) {
				console.log("Destroying a fire! " + this.id);
			}

			$(this.idHash).remove();
			this.stopTimer();
			Griddle.removeFire(this.id);
		},

		grow: function () {
			var griddlePos, griddleRight, griddleBottom, firePos, fireRight, fireBottom, growTop, growLeft, growRight, growBottom, fireWidth, fireHeight, fireTop, fireLeft, x, obj1, obj2;

			if (Mechanics.fireDebug) {
				console.log("Growing the fire!");
			}

			// how far is the top of OUR div, from the top of the griddle div
			griddlePos = $("#activeGriddle").offset();
			griddleRight = griddlePos.left + $("#activeGriddle").width();
			griddleBottom = griddlePos.top + $("#activeGriddle").height();

			firePos = $(this.idHash).offset();
			fireRight = firePos.left + $(this.idHash).width();
			fireBottom = firePos.top + $(this.idHash).height();

			growTop = 0;
			growLeft = 0;
			growRight = 0;
			growBottom = 0;

			if (Mechanics.fireDebug) {
				console.log("Fire (Left: " + firePos.left + " Top: " + firePos.top + " Right: " + fireRight + " Bottom: " + fireBottom + " )");
				console.log("Griddle (Left: " + griddlePos.left + " Top: " + griddlePos.top + " Right: " + griddleRight + " Bottom: " + griddleBottom + " )");
			}

			// calculate the amount we should grow this step on top
			if ((firePos.top - Mechanics.fireGrowSize) > griddlePos.top) {
				growTop = Mechanics.fireGrowSize;
			} else if (firePos.top > griddlePos.top) {
				growTop = firePos.top - griddlePos.top;
			} else {
				growTop = 0;
			}

			if ((firePos.left - Mechanics.fireGrowSize) > griddlePos.left) {
				growLeft = Mechanics.fireGrowSize;
			} else if (firePos.left > griddlePos.left) {
				growLeft = firePos.left - griddlePos.left;
			} else {
				growLeft = 0;
			}

			if ((fireRight + Mechanics.fireGrowSize) < griddleRight) {
				growRight = Mechanics.fireGrowSize;
			} else if (fireRight < griddleRight) {
				growRight = griddleRight - fireRight;
			} else {
				growRight = 0;
			}

			if ((fireBottom + Mechanics.fireGrowSize) < griddleBottom) {
				growBottom = Mechanics.fireGrowSize;
			} else if (fireBottom < griddleBottom) {
				growBottom = griddleBottom - fireBottom;
			} else {
				growBottom = 0;
			}

			if (Mechanics.fireDebug) {
				console.log(growTop + "," + growLeft + "," + growRight + "," + growBottom);
			}

			if (growTop > 0 || growLeft > 0 || growRight > 0 || growBottom > 0) {
				fireWidth = $(this.idHash).width() + growLeft + growRight;
				fireHeight = $(this.idHash).height() + growTop + growBottom;
				fireTop = firePos.top - growTop;
				fireLeft = firePos.left - growLeft;

				$(this.idHash)
					.css("left", fireLeft + "px")
					.css("top", fireTop + "px")
					.css("width", fireWidth)
					.css("height", fireHeight);

				// check for collisions here
				for (x = 0; x < Griddle.patties.length; x += 1) {
					obj1 = {
						top: $(Griddle.patties[x].idHash).position().top,
						left: $(Griddle.patties[x].idHash).position().left,
						width: $(Griddle.patties[x].idHash).width(),
						height: $(Griddle.patties[x].idHash).height()
					};

					obj2 = {
						top: fireTop,
						left: fireLeft,
						width: fireWidth,
						height: fireHeight
					};

					if (overlaps(obj1, obj2)) {
						// this patty needs to be destroyed! (burned in the fire)
						Player.burnedInFire += 1;
						$(Griddle.removePatty(Griddle.patties[x].id).idHash).remove();
					}
				}
			} else {
				clearInterval(this.timer);

				// destroy this element
				window.setTimeout(bindMe(this, this.destroy), Mechanics.fireEndDelay);
			}
		}
	}, Patty = {
		id: "",
		idHash: "",
		posTop: 0,
		posLeft: 0,
		curSide: 0,
		flipSide: 0,
		cookable: true,
		dying: false,
		flips: 0,
		dragging: false,
		reverted: false,
		beefQuality: Mechanics.upgrades.beefQuality[Player.upgrades.beefQuality.level].beefQuality,

		remove: function () {
			$(this).remove();
		},

		revert: function (droppableObj) {
			var id, x;

			if (Mechanics.dragDebug) {
				console.log("in a Patty revert method");
			}

			// if we are dropping on a full prepTable, we need to revert
			if (droppableObj === false) {
				soundManager.getSoundById('error').play();

				if (Mechanics.dragDebug) {
					console.log("We are reverting positions!");
				}

				// assume EVERY time we have a revert, we have to restart cookable
				// but we want to do it on the STOP method, to give the revert
				// animation a chance to finish
				id = $(this)[0].id;

				for (x = 0; x < Griddle.patties.length; x += 1) {
					if (Griddle.patties[x].id === id) {
						if (Mechanics.dragDebug) {
							console.log("setting cookable to true (revert method)");
						}

						Griddle.patties[x].reverted = true;
					}
				}

				if (PrepTable.patties.length >= Mechanics.prepTableSlots[Player.upgrades.prepTableSize.level]) {
					if (Player.upgrades.prepTableSize.level === 0) {
						$("#prepTableToolTip").dialog({height: 130});
						$("#prepTableToolTip").html("You can't fit any more burgers on your prep table.  All the slots are full!<br/><br/>Visit the upgrade shop to unlock the remaining slots and give yourself more space!");
					} else {
						$("#prepTableToolTip").dialog({height: 80});
						$("#prepTableToolTip").html("You can't fit any more burgers on your prep table.  All the slots are full.");
					}

					$("#prepTableToolTip").dialog("open");
				}

				return true;
			}

			// with a valid drop, we only resume cooking if we are on the griddle
			if (droppableObj[0].id === "activeGriddle") {
				// set the cookable status back to true
				id = $(this)[0].id;

				for (x = 0; x < Griddle.patties.length; x += 1) {
					if (Griddle.patties[x].id === id) {
						Griddle.patties[x].cookable = true;
					}
				}
			}

			return false;
		},

		cook: function () {
			var pattyPos, chance, rand;

			if (this.cookable !== false) {
				this.curSide += 1;
			}

			if (this.curSide === 100 && helper.active) {
				this.flip();

				if (Griddle.griddleOn) {
					soundManager.getSoundById('patty').play();
				}
			}

			if (this.curSide > Mechanics.pattyMaxDone && this.cookable === true) {
				// patty is overcooked on one side!
				if (this.dying === false) {
					pattyPos = $(this.idHash).offset();

					if (Mechanics.dragDebug) {
						console.log("Setting cookable to false (patty.cook)");
					}

					this.cookable = false;
					this.dying = true;

					$(this.idHash)
						.fadeOut(300).fadeIn(300)
						.fadeOut(300).fadeIn(300)
						.fadeOut(300).fadeIn(300)
						.fadeOut(300).fadeIn(300)
						.fadeOut(300).fadeIn(300, function () {
							// remove the element
							Griddle.removePatty(this.id);
							$(this).remove();
						});

					// increment the number of burnt out patties
					Player.griddleBurn += 1;

					// there is a chance here that this will either cause a grease fire or form crud.
					chance = Math.floor(Math.random() * 100) + 1;

					if (chance <= Mechanics.pattyBurnNegChance) {
						rand = Math.floor(Math.random() * 100) + 1;

						// 50% chance for either crud or fire
						if (rand <= 50) {
							Player.griddleCrudCount += 1;
							Griddle.addCrud(pattyPos.left, pattyPos.top);
						} else {
							Player.griddleFireCount += 1;
							Griddle.addFire(pattyPos.left, pattyPos.top);
						}
					}
				}
			}
		},

		flip: function () {
			var tmp = this.curSide;
			this.curSide = this.flipSide;
			this.flipSide = tmp;
			this.flips += 1;
		},

		dragStart: function () {
			if (Mechanics.dragDebug) {
				console.log("in a Patty dragStart method");
			}

			// indicate that dragging operation has begun
			this.dragging = true;
		},

		dragStop: function () {
			if (Mechanics.dragDebug) {
				console.log("in a Patty dragStop method!");
			}

			// reset the revert method of draggable
			$(this).draggable('option', 'revert', Patty.revert);

			// since we are no longer dragging, set this flag to false
			this.dragging = false;

			// if we were just reverted, re-enable the cookable status
			if (this.reverted) {
				this.reverted = false;
				this.cookable = true;
			}
		},

		drop: function (e, ui) {
			if (Mechanics.dragDebug) {
				console.log("in a Patty drop method");
			}

			// play the error noise!
			soundManager.getSoundById('error').play();

			// set a hard revert.  prevents one patty from being dropped on another
			ui.draggable.draggable('option', 'revert', true);
		},

		cookedWell: function () {
			var minDone, maxDone;

			// being cooked "well" is anything not danger or bad
			minDone = Mechanics.pattyScores.ok.range;
			maxDone = 100;

			return (this.curSide <= maxDone && this.flipSide <= maxDone && (100 - this.curSide) <= minDone && (100 - this.flipSide) <= minDone);
		},

		score: function () {
			var side1, side2, tmp, heatModifier, hmName, subtractPer, heatPercent;

			if (Mechanics.scoringDebug) {
				console.log("\tBurger Score");
				console.log("\t************");
			}

			// get a score for both sides of the patty.  we only use the lowest
			side1 = this.scoreSide(this.curSide);
			side2 = this.scoreSide(this.flipSide);

			if (Mechanics.scoringDebug) {
				console.log("\t(Lowest score of the two patty sides gets used)");
				console.log("\n");
			}

			tmp = Math.min(side1, side2);

			// get the score based on the cooked level MARK

			// adjust with the heat modifier
			if (Mechanics.scoringDebug) {
				console.log("\tHeat Modifier");
				console.log("\t*************");
			}

			heatModifier = 1;
			hmName = "";
			subtractPer = 0;

			heatPercent = 100 - ((this.remain / this.max) * 100);

			if (Mechanics.scoringDebug) {
				console.log("\tHeat of patty (0 to 100): " + heatPercent);
			}

			if (heatPercent <= Mechanics.heatModifiers.sizzling.range) {
				subtractPer = Mechanics.heatModifiers.sizzling.subtract;
				hmName = "SIZZLING";
			} else if (heatPercent <= Mechanics.heatModifiers.warm.range) {
				subtractPer = Mechanics.heatModifiers.warm.subtract;
				hmName = "WARM";
			} else if (heatPercent <= Mechanics.heatModifiers.cold.range) {
				subtractPer = Mechanics.heatModifiers.cold.subtract;
				hmName = "COLD";
			} else {
				subtractPer = Mechanics.heatModifiers.stale.subtract;
				hmName = "STALE";
			}

			heatModifier = (1 - (subtractPer / 100));

			if (Mechanics.scoringDebug) {
				console.log("\tPatty heat level of " + hmName + " gets a heatModifier of -" + subtractPer + "% (" + heatModifier + ")\n");

				console.log("\tBeef Quality: " + this.beefQuality + "\n");

				console.log("\tPopularity: " + Player.popularity + "\n");

				console.log("\t((" + tmp + " * " + heatModifier + ") * " + this.beefQuality + ")");
				console.log("\tFinal Patty Score: " + Math.floor(((tmp * heatModifier) * this.beefQuality)));
				console.log("\t**********************");
			}

			Player.lastOrderDetails += "Burger - (<span title='" + this.cookedLevel() + "'>" + tmp + "</span> * <span title='" + hmName + "'>" + (100 - subtractPer) + "%</span>) * " + this.beefQuality + "<br/>";

			return Math.floor((tmp * heatModifier) * this.beefQuality);
		},

		cookedLevel: function () {
			var cookedLevel, donenessRange;

			donenessRange = 100 - Math.min(this.curSide, this.flipSide);

			if (this.curSide > 100 || this.flipSide > 100) {
				cookedLevel = "BURNT";
			} else if (donenessRange <= Mechanics.pattyScores.perfect.range || sauce.active) {
				cookedLevel = "PERFECT";
			} else if (donenessRange <= Mechanics.pattyScores.great.range) {
				cookedLevel = "GREAT";
			} else if (donenessRange <= Mechanics.pattyScores.ok.range) {
				cookedLevel = "OK";
			} else if (donenessRange <= Mechanics.pattyScores.bad.range) {
				cookedLevel = "BAD";
			} else {
				cookedLevel = "DANGER";
			}

			return cookedLevel;
		},

		scoreSide: function (doneness) {
			var cookedLevel, score, donenessRange;

			donenessRange = 100 - doneness;

			if (Mechanics.scoringDebug) {
				console.log("\tDoneness: " + doneness);
			}

			cookedLevel = "";
			score = 0;

			if (donenessRange < 0) {
				cookedLevel = "BURNT";
				score = Mechanics.pattyScores.burnt.score;
			} else if (donenessRange <= Mechanics.pattyScores.perfect.range || sauce.active) {
				cookedLevel = "PERFECT";
				score = Mechanics.pattyScores.perfect.score;
			} else if (donenessRange <= Mechanics.pattyScores.great.range) {
				cookedLevel = "GREAT";
				score = Mechanics.pattyScores.great.score;
			} else if (donenessRange <= Mechanics.pattyScores.ok.range) {
				cookedLevel = "OK";
				score = Mechanics.pattyScores.ok.score;
			} else if (donenessRange <= Mechanics.pattyScores.bad.range) {
				cookedLevel = "BAD";
				score = Mechanics.pattyScores.bad.score;
			} else {
				cookedLevel = "DANGER";
				score = Mechanics.pattyScores.danger.score;
			}

			if (Mechanics.scoringDebug) {
				console.log("\tCooked level '" + cookedLevel + "' gets a score of " + score + "\n");
			}

			return score;
		},

		yulp: function () {
			return Math.min(this.yulpSide(this.curSide), this.yulpSide(this.flipSide));
		},

		yulpSide: function (doneness) {
			var donenessRange;

			donenessRange = 100 - doneness;

			switch (donenessRange) {
			case (donenessRange < 0):
				return Mechanics.pattyScores.burnt.yulp;
			case (donenessRange <= Mechanics.pattyScores.perfect.range):
				return Mechanics.pattyScores.perfect.yulp;
			case (donenessRange <= Mechanics.pattyScores.great.range):
				return Mechanics.pattyScores.great.yulp;
			case (donenessRange <= Mechanics.pattyScores.ok.range):
				return Mechanics.pattyScores.ok.yulp;
			case (donenessRange <= Mechanics.pattyScores.bad.range):
				return Mechanics.pattyScores.bad.yulp;
			default:
				return Mechanics.pattyScores.danger.yulp;
			}
		}
	};

	$(document).ready(function () {
		var welcomeMsg;

		// griddle temperature controls
		$("#lowButton").click(function () {
			Griddle.turnOn(Mechanics.griddleTemps[Player.upgrades.griddleTemp.level].low);
			$(this).css("background-color", "orange");
			$("#medButton").css("background-color", "");
			$("#highButton").css("background-color", "");
		});

		$("#medButton").click(function () {
			Griddle.turnOn(Mechanics.griddleTemps[Player.upgrades.griddleTemp.level].med);
			$(this).css("background-color", "orange");
			$("#lowButton").css("background-color", "");
			$("#highButton").css("background-color", "");
		});

		$("#highButton").click(function () {
			Griddle.turnOn(Mechanics.griddleTemps[Player.upgrades.griddleTemp.level].high);
			$(this).css("background-color", "orange");
			$("#lowButton").css("background-color", "");
			$("#medButton").css("background-color", "");
		});

		$("#muteButton").click(function () {
			soundManager.mute();

			$("#muteButton, #unmuteButton").toggle();
		});

		$("#unmuteButton").click(function () {
			soundManager.unmute();

			$("#muteButton, #unmuteButton").toggle();
		});

		$("#pauseButton").click(function () {
			Mechanics.pause();
		});

		$("#resumeButton").click(function () {
			Mechanics.resume();
		});

		$("#fillOrder").click(function () {
			var order, orderPats, x;

			// get the currentOrder
			order = orderCollection.getOrder(orderCollection.currentOrder);

			// do we have enough patties to fill the current order?
			if (order) {
				if (PrepTable.patties.length >= order.burgerCount) {
					// remove the patties from the preptable
					orderPats = [];

					for (x = 0; x < order.burgerCount; x += 1) {
						orderPats.push(PrepTable.removeOldestPatty());
					}

					// mark the order as filled
					orderCollection.fillOrder(orderPats);
				} else {
					// not enough patties
					$("#fillOrderToolTip").html("You don't have enough burgers on the prep table to fill the current order! Grill up " + (order.burgerCount - PrepTable.patties.length) + " more.");
					$("#fillOrderToolTip").dialog("open");
				}
			} else {
				$("#fillOrderToolTip").html("You don't have any orders to fill!");
				$("#fillOrderToolTip").dialog("open");
			}
		});

		$("#activeGriddle").click(function (e) {
			var newPattyTop, newPattyLeft, patty, newPlacementObj, valid, x, pattyObj, obj2, crudObj, fireObj;

			if (!Mechanics.paused) {
				// create a new patty
				newPattyTop = e.pageY - 50;
				newPattyLeft = e.pageX - 50;

				patty = Object.create(Patty, {
					'posTop': {
						value: newPattyTop
					},
					'posLeft': {
						value: newPattyLeft
					}
				});

				newPlacementObj = {
					top: newPattyTop,
					left: newPattyLeft,
					width: 100,
					height: 100
				};

				// make sure this is a valid placement before we create
				valid = true;

				// make sure we aren't colliding with another patty
				if (Griddle.patties.length > 0) {
					for (x = 0; x < Griddle.patties.length; x += 1) {
						pattyObj = {
							top: $(Griddle.patties[x].idHash).offset().top,
							left: $(Griddle.patties[x].idHash).offset().left,
							width: $(Griddle.patties[x].idHash).width(),
							height: $(Griddle.patties[x].idHash).height()
						};

						if (overlaps(pattyObj, newPlacementObj)) {
							if (Mechanics.placementDebug) {
								console.log("Attempted patty drop overlaps an existing patty! " + Griddle.patties[x].idHash);
							}

							valid = false;
						}
					}
				}

				// check we are within the confines of the griddle
				obj2 = $("#activeGriddle").offset();

				if (!withinBounds(newPlacementObj, {top: obj2.top, left: obj2.left, width: $("#activeGriddle").width(), height: $("#activeGriddle").height()})) {
					if (Mechanics.placementDebug) {
						console.log("Attempted patty drop is out of bounds of the griddle!");
					}

					valid = false;
				}

				// check if player has any patties left
				if (Player.dailyPatties === 0) {
					if (Mechanics.placementDebug) {
						console.log("No patties left to drop!");
					}

					$("#outOfBurgersToolTip").dialog("open");

					valid = false;
				}

				// make sure we aren't trying to place on top of some crud
				for (x = 0; x < Griddle.crud.length; x += 1) {
					crudObj = {
						top: $(Griddle.crud[x].idHash).position().top,
						left: $(Griddle.crud[x].idHash).position().left,
						width: $(Griddle.crud[x].idHash).width(),
						height: $(Griddle.crud[x].idHash).height()
					};

					if (overlaps(crudObj, newPlacementObj)) {
						if (Mechanics.placementDebug) {
							console.log("Attempted patty drop overlaps crud! " + Griddle.crud[x].idHash);
						}

						valid = false;
					}
				}

				// make sure we're not placing in a fire!
				for (x = 0; x < Griddle.fires.length; x += 1) {
					fireObj = {
						top: $(Griddle.fires[x].idHash).position().top,
						left: $(Griddle.fires[x].idHash).position().left,
						width: $(Griddle.fires[x].idHash).width(),
						height: $(Griddle.fires[x].idHash).height()
					};

					if (overlaps(fireObj, newPlacementObj)) {
						if (Mechanics.placementDebug) {
							console.log("Attempted patty drop overlaps fire! " + Griddle.fires[x].idHash);
						}

						valid = false;
					}
				}

				// add it to the griddle
				if (valid !== false) {
					$("#activeGriddle").html("");
					Griddle.addPatty(patty);
				} else {
					soundManager.getSoundById('error').play();

					if (Player.dailyPatties > 0) {
						// show the collision box
						$("<div></div>")
							.addClass("colBox")
							.css("top", (e.pageY - 50 - $(this).offset().top) + "px")
							.css("left", (e.pageX - 50 - $(this).offset().left) + "px")
							.css("z-index", 1500)
							.appendTo("#activeGriddle")
							.fadeIn(200).fadeOut(200).fadeIn(200).fadeOut(200, function () { $(this).remove(); });
					}
				}
			}
		});

		$("body").on("click", ".patty", function (e) {
			var x;

			if (!Mechanics.paused) {
				for (x = 0; x < Griddle.patties.length; x += 1) {
					if (Griddle.patties[x].id === $(e.target).attr("id")) {
						if (Griddle.patties[x].flips === (Mechanics.pattyMaxFlips - 1)) {
							Player.brokeApart += 1;
							$(Griddle.removePatty(Griddle.patties[x].id).idHash).remove();
						} else {
							Griddle.patties[x].flip();

							if (Griddle.griddleOn) {
								soundManager.getSoundById('patty').play();
							}
						}

						Griddle.draw();
					}
				}

				e.stopPropagation();
			}
		});

		$("body").on("mousedown", ".patty", function (e) {
			var x;

			if (!Mechanics.paused) {
				for (x = 0; x < Griddle.patties.length; x += 1) {
					if (Griddle.patties[x].id === $(e.target).attr("id")) {
						if (Griddle.patties[x].dying === true) {
							$(Griddle.patties[x].idHash).stop(true, true);
							$(Griddle.patties[x].idHash).fadeIn(1);
							Griddle.patties[x].dying = false;
						} else {
							if (Mechanics.dragDebug) {
								console.log("setting cookable to false! (#activeGriddle.on(mousedown))");
							}

							Griddle.patties[x].cookable = false;
							Griddle.patties[x].mousedown = true;
						}
					}
				}
			}
		});

		$("body").on("mouseup", ".patty", function (e) {
			var x;

			if (!Mechanics.paused) {
				for (x = 0; x < Griddle.patties.length; x += 1) {
					if (Griddle.patties[x].id === $(e.target).attr("id")) {
						if (!Griddle.patties[x].dragging) {
							Griddle.patties[x].cookable = true;
						}
					}
				}
			}
		});

		$("#activeGriddle").droppable({
			tolerance: 'fit',
			drop: function (event, ui) {
				if (Mechanics.dragDebug) {
					console.log("In the griddle droppable");
				}
			}
		});

		$("#prepTable").droppable({
			tolerance: "fit",
			drop: function (e, ui) {
				var x, patty;

				// check the doneness values

				// if we have room on the preptable, disable the droppable function on this patty
				if (PrepTable.patties.length < Mechanics.prepTableSlots[Player.upgrades.prepTableSize.level]) {
					ui.draggable.each(function (index, el) {
						$(el).droppable('disable');
					});
				}

				for (x = 0; x < Griddle.patties.length; x += 1) {
					patty = Griddle.patties[x];

					if (Griddle.patties[x].id === ui.draggable.attr("id")) {
						if (Mechanics.dragDebug) {
							console.log("Setting cookable to false! (#prepTable.droppable)");
						}

						patty.cookable = false;

						if (Griddle.patties[x].cookedWell()) {
							$("#" + ui.draggable.attr("id")).html("<img src='images/thumbsup.png' />");
						} else {
							$("#" + ui.draggable.attr("id")).html("<img src='images/thumbsdown.png' />");
						}

						if ((PrepTable.patties.length + 1) === Mechanics.prepTableSlots[Player.upgrades.prepTableSize.level]) {
							$("#prepTable").droppable("disable");
						}

						// blink and remove the patty
						PrepTable.addPatty(Griddle.removePatty(ui.draggable.attr("id")));
						$("#" + ui.draggable.attr("id")).fadeOut(300).fadeIn(300).fadeOut(300).fadeIn(300).delay(500).fadeOut(300, patty.remove());
					}
				}
			}
		});

		$("#garbageCan").droppable({
			tolerance: "touch",
			drop: function (e, ui) {
				Griddle.removePatty(ui.draggable.attr("id"));
				$("#" + ui.draggable.attr("id")).remove();
				Player.garbageCan += 1;
			}
		});

		$("#orderScoringToolTip").dialog({
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
			open: function (e, ui) {
				$(this).scrollTop(0);

				if (!Mechanics.paused) {
					Mechanics.pause(false);
					Mechanics.overlayPaused = true;
				}
			},
			close: function (e, ui) {
				if ($("#hideOrderScoring").prop("checked")) {
					Player.hideOrderScoring = true;
				}

				if (Mechanics.overlayPaused) {
					Mechanics.resume();
					Mechanics.overlayPaused = false;
				}
			}
		});

		$("#welcome").dialog(Mechanics.popUpDefaults);
		$("#welcome").dialog({
			title: "Welcome to Patty Wagon!"
		});

		$("#prepTableToolTip").dialog({
			autoOpen: false,
			closeOnEscape: true,
			dialogClass: 'popUp',
			draggable: false,
			modal: true,
			resizable: false,
			title: "Hint",
			height: 80,
			width: 300,
			position: [$("#score").offset().left - 102, $("#prepTable").offset().top],
			open: function (e, ui) {
				if (!Mechanics.paused) {
					Mechanics.pause(false);
					Mechanics.overlayPaused = true;
				}
			},
			close: function (e, ui) {
				if (Mechanics.overlayPaused) {
					Mechanics.resume();
					Mechanics.overlayPaused = false;
				}
			}
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
			open: function (e, ui) {
				if (!Mechanics.paused) {
					Mechanics.pause();
					Mechanics.overlayPaused = true;
				}
			},
			close: function (e, ui) {
				if (Mechanics.overlayPaused) {
					Mechanics.resume();
					Mechanics.overlayPaused = false;
				}
			}
		});

		$("#outOfBurgersToolTip").dialog(Mechanics.popUpDefaults);
		$("#outOfBurgersToolTip").dialog({
			title: "Out of Burgers!",
			open: function (e, ui) {
				if (!Mechanics.paused) {
					Mechanics.pause();
					Mechanics.overlayPaused = true;

					// add the price amount to the screen
					$("#reUpPattyCost").html(formatDollars(Mechanics.pattyReUpCost));

					// see if the user has enough dollars for a patty re-up
					if (Player.tips >= Mechanics.pattyReUpCost) {
						// enable the purchase button
						$("#reUpPattyButton").removeAttr("disabled");
					}
				}
			}
		});

		$("#reUpPattyButton").click(function (e) {
			Player.tips -= Mechanics.pattyReUpCost;
			$("#curTips").html(formatDollars(Player.tips));

			Player.dailyPatties = Mechanics.upgrades.pattiesPerDay[Player.upgrades.pattiesPerDay.level];
			soundManager.getSoundById('register').play();
			$("#outOfBurgersToolTip").dialog("close");

			$("#curBurgers").html(Player.dailyPatties);
		});

		$("#burgers").on("click", "#zeroBurgs", function (e) {
			$("#outOfBurgersToolTip").dialog("open");
		});

		$("#firstOrderToolTip").dialog(Mechanics.popUpDefaults);
		$("#firstOrderToolTip").dialog({
			title: "Hint",
			autoOpen: false,
			closeOnEscape: true,
			dialogClass: 'popUp',
			draggable: false,
			modal: true,
			resizable: false,
			height: 200,
			width: 400,
			position: [$("#pendingOrders").offset().left, $("#pendingOrders").offset().top + $("#pendingOrders").height()]
		});

		$("#expiringOrderToolTip").dialog({
			title: "Hint",
			autoOpen: false,
			closeOnEscape: true,
			dialogClass: 'popUp',
			draggable: false,
			modal: true,
			resizable: false,
			height: 180,
			width: 400,
			position: [$("#pendingOrders").offset().left, $("#pendingOrders").offset().top + $("#pendingOrders").height()]
		});

		$("#instructions").dialog(Mechanics.popUpDefaults);
		$("#instructions").dialog({
			title: "Patty Wagon"
		});

		$("#upgradeStore").dialog(Mechanics.popUpDefaults);
		$("#upgradeStore").dialog({
			title: "Upgrade Store",
			open: function () {
				if (!Mechanics.paused) {
					Mechanics.pause();
					Mechanics.overlayPaused = true;
				}

				$("#storeUpgradeMoneyValue").html(formatDollars(Player.tips));
				$("#storeUpgradePurchase").attr("disabled", true);

			}
		});

		$("#buffStore").dialog(Mechanics.popUpDefaults);
		$("#buffStore").dialog({
			title: "Buff Store",
			open: function () {
				if (!Mechanics.paused) {
					Mechanics.pause();
					Mechanics.overlayPaused = true;
				}

				$("#storeBuffMoneyValue").html(formatDollars(Player.tips));
				$("#storeBuffPurchase").attr("disabled", true);
			}
		});

		$("#statistics").dialog(Mechanics.popUpDefaults);
		$("#statistics").dialog({
			title: "Player Statistics"
		});
		$("#showStatistics").click(function () {
			$("#statistics").html(Player.getStats());
			$("#statistics").dialog("open");
		});


		$("#showInstructions").click(function () {
			$("#instructions").dialog("open");
		});

		$("#showStore").click(function () {
			$("#buffStore").dialog("open");
		});

		$("#showUpgrades").click(function () {
			$("#upgradeStore").dialog("open");
		});

		$(".storeBuff").click(function (e) {
			var id, fl, buff;

			id = $(this)[0].id;

			fl = id.slice(5, 6);
			buff = fl.toLowerCase() + id.slice(6);

			$("#storeBuffNameValue").html(Mechanics.buffs[buff].name);
			$("#storeBuffDescriptionValue").html(Mechanics.buffs[buff].description);
			$("#storeBuffPriceValue").html("$" + formatDollars(Mechanics.buffs[buff].price));

			if (Mechanics.buffs[buff].price > Player.tips) {
				$("#storeBuffPurchase").attr("disabled", true);
			} else {
				$("#storeBuffPurchase").removeAttr("disabled");
				$("#storeBuffPurchase").off("click");
				$("#storeBuffPurchase").on("click", function () {
					Player.tips -= Mechanics.buffs[buff].price;
					Player.buffs[buff].count += 1;
					$("#" + id).trigger("click");
					Mechanics.updateBuffs();
					soundManager.getSoundById('register').play();
					$("#storeBuffMoneyValue").html(formatDollars(Player.tips));
				});
			}
		});

		$(".upgradeBuff").click(function (e) {
			var id, fl, upgrade;

			id = $(this)[0].id;
			fl = id.slice(5, 6);
			upgrade = fl.toLowerCase() + id.slice(6);

			$("#storeUpgradeNameValue").html(Mechanics.upgrades[upgrade].name);
			$("#storeUpgradeDescriptionValue").html(Mechanics.upgrades[upgrade].description);
			$("#storeUpgradePriceValue").html("$" + formatDollars(Mechanics.upgrades[upgrade].price));
			$("#storeUpgradeCurrentLevelValue").html(fullStars(Player.upgrades[upgrade].level, 3));

			if (Mechanics.upgrades[upgrade].price > Player.tips || Player.upgrades[upgrade].level >= Mechanics.upgrades[upgrade].maxLevel) {
				$("#storeUpgradePurchase").attr("disabled", true);
			} else {
				$("#storeUpgradePurchase").removeAttr("disabled");
				$("#storeUpgradePurchase").off("click");
				$("#storeUpgradePurchase").on("click", function () {
					Player.tips -= Mechanics.upgrades[upgrade].price;
					Player.upgrades[upgrade].level += 1;
					$("#" + id).trigger("click");

					soundManager.getSoundById('churchbell').play();

					// update the upgrade counts!
					$("#storeUpgradeCurrentLevelValue").html(fullStars(Player.upgrades[upgrade].level, 3));

					switch (upgrade) {
					case 'beefQuality':
						Mechanics.pattyMaxFlips = Mechanics.upgrades.beefQuality[Player.upgrades[upgrade].level].maxFlips;
						break;
					case 'griddleSize':
						Griddle.draw();
						break;
					case 'prepTableSize':
						PrepTable.draw(true);
						break;
					case 'buffEnhance':
						Mechanics.buffDuration = Mechanics.upgrades.buffEnhance[Player.upgrades[upgrade].level];
						break;
					case 'griddleTemp':
						$("#highButton").attr("title", "High: " + (Mechanics.griddleTemps[Player.upgrades[upgrade].level].high / 1000).toFixed(2) + "s/cook");
						$("#medButton").attr("title", "Medium: " + (Mechanics.griddleTemps[Player.upgrades[upgrade].level].med / 1000).toFixed(2) + "s/cook");
						$("#lowButton").attr("title", "Low: " + (Mechanics.griddleTemps[Player.upgrades[upgrade].level].low / 1000).toFixed(2) + "s/cook");
						break;
					default:
						break;
					}

					// update dollars remaining
					$("#storeUpgradeMoneyValue").html(formatDollars(Player.tips));

					// save the game
					Player.save();
				});
			}
		});

		$(window).resize(function () {
			var nLeft, nTop, leftAdjust, topAdjust, x;

			// adjust the patty location on window resize!
			nLeft = $("#activeGriddle").offset().left;
			nTop = $("#activeGriddle").offset().top;

			if (nLeft !== Mechanics.gLeft || nTop !== Mechanics.gTop) {
				leftAdjust = 0;
				topAdjust = 0;

				if (nLeft > Mechanics.gLeft) {
					// width has grown
					leftAdjust = nLeft - Mechanics.gLeft;
				} else {
					leftAdjust = (Mechanics.gLeft - nLeft) * -1;
				}

				if (nTop > Mechanics.gTop) {
					// height has grown
					topAdjust = nTop - Mechanics.gTop;
				} else {
					topAdjust = (Mechanics.gTop - nTop) * -1;
				}

				Mechanics.gLeft = nLeft;
				Mechanics.gTop = nTop;

				for (x = 0; x < Griddle.patties.length; x += 1) {
					$(Griddle.patties[x].idHash).css("top", $(Griddle.patties[x].idHash).offset().top + topAdjust);
					Griddle.patties[x].posTop = $(Griddle.patties[x].idHash).offset().top;

					$(Griddle.patties[x].idHash).css("left", $(Griddle.patties[x].idHash).offset().left + leftAdjust);
					Griddle.patties[x].posLeft = $(Griddle.patties[x].idHash).offset().left;

					$(Griddle.patties[x].idHash).draggable("option", "containment", [$("#container").offset().left, $("#fullGriddle").offset().top + 1, $("#container").offset().left + $("#container").width() - 100, $("#fullGriddle").offset().top + $("#fullGriddle").height() - 100]);
				}

				for (x = 0; x < Griddle.crud.length; x += 1) {
					$(Griddle.crud[x].idHash).css("top", $(Griddle.crud[x].idHash).offset().top + topAdjust);
					$(Griddle.crud[x].idHash).css("left", $(Griddle.crud[x].idHash).offset().left + leftAdjust);
				}

				for (x = 0; x < Griddle.fires.length; x += 1) {
					$(Griddle.fires[x].idHash).css("top", $(Griddle.fires[x].idHash).offset().top + topAdjust);
					$(Griddle.fires[x].idHash).css("left", $(Griddle.fires[x].idHash).offset().left + leftAdjust);
				}
			}
		});

		// initialization (GAME START)
		Mechanics.nextOrder = window.setTimeout(function () {
			var order, val;

			order = Object.create(Order);
			val = Math.floor(Math.random() * (Mechanics.prepTableSlots[Player.upgrades.prepTableSize.level] - 1)) + 1;
			order.burgerCount = val;

			if (Mechanics.orderDebug) {
				console.log("Setting timer for the initial order of " + val + " burgers.");
			}

			order.maxAge = Math.floor(Math.random() * (Mechanics.orderMaxAgeUpper - Mechanics.orderMaxAgeLower)) + Mechanics.orderMaxAgeLower;
			orderCollection.addOrder(order);
		}, Math.floor(Math.random() * (Mechanics.initialOrderDelayUpper - Mechanics.initialOrderDelayLower)) + Mechanics.initialOrderDelayLower);

		PrepTable.draw();

		Player.dailyPatties = Mechanics.upgrades.pattiesPerDay[Player.upgrades.pattiesPerDay.level];
		Griddle.turnOn(Mechanics.griddleTemps[Player.upgrades.griddleTemp.level].low);

		Mechanics.gLeft = $("#activeGriddle").offset().left;
		Mechanics.gTop = $("#activeGriddle").offset().top;

		if (supports_html5_storage()) {
			// check to see if the user has a saved game
			if (Player.load()) {
				welcomeMsg = "Welcome back!  Your profile has been loaded.";
			} else {
				welcomeMsg = "<p>It appears that this is your first time playing!</p>";
				$("#activeGriddle").html("<center><span class='startText'>Click<br/>Here<br/>To<br/>Begin</span></center>");
			}
		} else {
			// no html5 localstorage.  can't save the game!
			welcomeMsg = "You appear to be using an older browser.  Saving your game will be disabled.";
		}

		$("#curBurgers").html(Player.dailyPatties);

		$("#welcome").html(welcomeMsg);
		$("#welcome").dialog({
			close: function (e, ui) {
				if (Mechanics.overlayPaused) {
					Mechanics.resume();

					Mechanics.overlayPaused = false;

					if (Player.daysPlayed.indexOf(getDate()) === -1) {
						Player.daysPlayed.push(getDate());

						if (Player.dailyPatties < Mechanics.upgrades.pattiesPerDay[Player.upgrades.pattiesPerDay.level]) {
							Player.dailyPatties = Mechanics.upgrades.pattiesPerDay[Player.upgrades.pattiesPerDay.level];
						}
					}
				}
			}
		}).dialog("open");

		//$("#expiringOrderToolTip").dialog("open");
	});
}());
