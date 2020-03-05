console.clear();

const GUI = new dat.GUI();

let settings = {
	text: "developer",
	textSize: 150,
	totalNumberOfParticles: 100,
	scale: 30,
	radius: {
		initial: 10,
		min: 10,
		max: 30,
	},
	colorConfig: {
		whiteOnBlack: true,
		blackOnWhite: false,
	},
	offsetAxis: {
		x: 0,
		y: 0,
	},
	noFill: false,
	randomRadius: false,
	redraw: () => {
		resetAndInit();
	},
	save: () => {
		saveCanvas(canvas);
	},
};

let colorConfig = {
	background: "rgb(0,0,0)",
	stroke: 0,
	fill: "rgb(0,0,0)",
};

let canvas,
	cols,
	scale,
	rows,
	particles = [],
	flowFields;

let font, fontPoints, textwidth;

function preload() {
	font = loadFont("fonts/font.ttf");
}

function setup() {
	canvas = createCanvas(innerWidth, innerHeight);
	resetAndInit();
}

function init() {
	scale = settings.scale;
	cols = floor(width / scale) + 2;
	rows = floor(height / scale) + 2;
	flowFields = new Array(cols * rows);

	textwidth = settings.textSize + settings.text.length;
	fontPoints = font.textToPoints(settings.text, 0, 0, settings.textSize);

	for (let i = 0; i < fontPoints.length; i++) {
		let point = fontPoints[i],
			x,
			y,
			radius;
		if (settings.randomRadius) {
			radius = randomIntegerFromRange(settings.radius.min, settings.radius.max);
		} else {
			radius = settings.radius.initial;
		}
		x = point.x + width / 2 - textwidth * 1.65 - settings.offsetAxis.x;
		y = point.y + height / 2 + textwidth / 3 - settings.offsetAxis.y;
		particles.push(new Particle(x, y, radius));
	}
}

let increment = 0.1,
	start = 0,
	zoffset = 0,
	framecount = 0;

function draw() {
	let xoffset = start;
	for (let x = 0; x < cols; x++) {
		let yoffset = start;
		for (let y = 0; y < rows; y++) {
			let index = x + y * cols;
			let angle = noise(xoffset, yoffset, zoffset) * TWO_PI * 2;
			let vector = p5.Vector.fromAngle(angle);
			flowFields[index] = vector;
			vector.setMag(1);
			yoffset += increment;
		}
		xoffset += increment;
		zoffset += 0.001;
	}
	particles.forEach(particle => {
		particle.update();
		particle.follow(flowFields);
		if (!particle.radius <= 0) {
			particle.draw(
				Math.abs(colorConfig.stroke - framecount * 15),
				settings.noFill == true ? null : colorConfig.fill
			);
		}
	});
	framecount++;
}

function windowResized() {
	resizeCanvas(innerWidth, innerHeight);
	resetAndInit();
}

function resetCanvas() {
	background(`${colorConfig.background}`);
	framecount = 0;
	particles = [];
}

function resetAndInit() {
	resetCanvas();
	init();
}

function checkColorConfig() {
	if (settings.colorConfig.whiteOnBlack) {
		colorConfig.background = "rgb(0,0,0)";
		colorConfig.fill = "rgb(0,0,0)";
		colorConfig.stroke = 0;
	}
	if (settings.colorConfig.blackOnWhite) {
		colorConfig.background = "rgb(255,255,255)";
		colorConfig.fill = "rgb(255,255,255)";
		colorConfig.stroke = 255;
	}
	background(`${colorConfig.background}`);
}

// All dat.GUI Code ----------

let colorFolder = GUI.addFolder("Color Config");
addCheckbox(colorFolder, settings.colorConfig, "whiteOnBlack", "White On Black");
addCheckbox(colorFolder, settings.colorConfig, "blackOnWhite", "Black On White");

let offsetAxisFolder = GUI.addFolder("Adjust Axis Offset");
offsetAxisFolder.add(settings.offsetAxis, "x", -innerWidth, innerWidth).onChange(resetAndInit);
offsetAxisFolder.add(settings.offsetAxis, "y", -innerHeight, innerHeight).onChange(resetAndInit);

GUI.add(settings, "text").onChange(resetAndInit);
GUI.add(settings, "textSize", 50, 800)
	.name("Text Size")
	.onChange(resetAndInit);
GUI.add(settings, "scale", 10, 50)
	.name("Scale")
	.onChange(resetAndInit);
GUI.add(settings.radius, "initial", settings.radius.min, settings.radius.max)
	.step(10)
	.name("Radius")
	.onChange(resetAndInit);
GUI.add(settings, "noFill")
	.name("No Fill")
	.onChange(resetAndInit);
GUI.add(settings, "randomRadius")
	.name("Random Radius")
	.onChange(resetAndInit);
GUI.add(settings, "redraw").name("RE-DRAW");
GUI.add(settings, "save").name("SAVE");

function addCheckbox(container, object, prop, name = prop) {
	container
		.add(object, prop)
		.name(name)
		.listen()
		.onChange(function() {
			setChecked(object, prop);
			resetAndInit();
			checkColorConfig();
		});
}

// UTILS ----------

function setChecked(parameter, prop) {
	for (let param in parameter) {
		if (typeof param != Function || typeof param != Number) {
			parameter[param] = false;
		}
	}
	parameter[prop] = true;
}

function saveCanvas(canvas) {
	saveCanvas(canvas, "flowfield_art", "jpg");
}

function randomIntegerFromRange(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

function addSpacesBetweenText(text) {
	return [...text].map((t, i) => (i != text.length - 1 ? t + " " : t)).join("");
}
