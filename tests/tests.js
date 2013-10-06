test("hello test", function () {
	ok(1 == "1", "Passed!");
});

test("getDate()", function() {
	var val = getDate();

	ok(typeof val === "string", "Return is a string!");
	ok(val.length === 10, "Returned date is 10 characters long!");
	ok(val.match(/\d{4}-\d{2}\d{2}/) !== null, "Matches \d{4}-\d{2}-\d{2} pattern.");	
});

test("supports_html5_storage()", function() {
	var val = supports_html5_storage();

	ok(typeof val === "boolean", "Return is a boolean!");
});

test("fullStars()", function() {
	//fullStars(value, max)

	// returns a string
	// contains #max img tags
});

test("stars()", function() {
	// sets the width of #starMask to param * 18px;
});
function stars(number) {
      $("#starMask").css("width", (number * 18) + "px");
   }

test("formatDollars()", function() {
	// takes an integer and return s decimal dollar amount
});
