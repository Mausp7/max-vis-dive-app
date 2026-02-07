const GasMix = require("./GasMix");
const { getPressure, getDepthChange } = require("./Utils");

class Planner {
	createDiveTable(model, maxDepth = 40, steps = 3, gasMix = new GasMix(0.21), gradientFactor = 1) {
		const table = [];

		for (let depth = 6; depth <= maxDepth; depth += steps) {
			const limit = model.getNoDecompressionLimit(depth, gasMix, gradientFactor)

			if (depth > gasMix.diveMod) {
				break;
			} else {
				table.push({depth, limit})
			}
		}

		return table;
	};
	createDecoPlan(model, gases, startDepth, ascentSpeed = 9, gasConsumption = {dive: 18, deco: 16}, gradientFLow = 1, gradientFHigh = 1) {

			let lowestCeiling = model.ceiling;
			if (model.ceiling === 0) return [];

			let decoPlan = [];
			let decoStartDepth = Math.ceil(lowestCeiling / 3) * 3;

			let actualDepth = startDepth;
			let actualPressure = getPressure(actualDepth);

			let gradientF = gradientFLow;
			const gradientIncrement = (gradientFHigh - gradientFLow) / (decoStartDepth / 3);

			while (actualDepth > 0) {
				let decoTime = 0;
				gradientF += gradientIncrement;

				while (model.ceiling > decoStartDepth - 3) {
					const decoStartPressure = getPressure(decoStartDepth);
					const {depthChangeDuration, depthChangePressure} = getDepthChange(actualDepth, decoStartDepth, ascentSpeed, ascentSpeed);

					if (depthChangeDuration !== 0) {
						decoPlan.push({
							action: "ascent",
							depth: Number(decoStartDepth.toFixed(0)),
							duration: depthChangeDuration,
							gases: gases,
							gasConsumption: Math.ceil(gasConsumption.deco * depthChangeDuration * depthChangePressure)
						});

						model.saturateTissues(depthChangePressure, depthChangeDuration, gases.bottomMix.n2, gradientF)

						actualPressure = decoStartPressure;
						actualDepth = decoStartDepth;

					} else {
						model.saturateTissues(actualPressure, 1, gases.bottomMix.n2, gradientF)
						decoTime += 1;
					}

					if (decoStartDepth === 0) break;
				}

				if (decoTime > 0) {
					decoPlan.push({
						action: "stop",
						depth: Number(actualDepth.toFixed(0)),
						duration: decoTime,
						gases: gases,
						gasConsumption: Math.ceil(gasConsumption.deco * decoTime * actualPressure)
					});
				}

				decoStartDepth -= 3;
			}

			return decoPlan;
	}
}

module.exports = Planner;
