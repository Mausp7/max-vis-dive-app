const TissueSettings = require('./TissueSettings');
const Tissue = require('./Tissue');
const GasMix = require('./GasMix');

class Model {
	constructor() {
		this._tissues = this.setTissues();
	}

	setTissues(tissueSettings = TissueSettings) {
		const tissues = [];

		for (const t of tissueSettings) {
			tissues.push(new Tissue(t.halfTime, t.mValue));
		}

		return tissues;
	}

	saturateTissues(ambientPressure, duration, fInertGas, gradFactor = 1) {
		for (const tissue of this._tissues) {
			tissue.saturate(ambientPressure, duration, fInertGas, gradFactor);
		}
	}

	getNoDecompressionLimit (depth,  gasMix = new GasMix(0.21), gradientFactor = 1) {
		this.reset();

		const ambientPressure = (depth / 10) + 1;
		const limits = [];

		for (const tissue of this._tissues) {
			if (ambientPressure * gasMix.n2 > tissue.mValue * gradientFactor) {
				let limit = -1;
				while (tissue.tissueLoad <= tissue.mValue * gradientFactor) {
					tissue.saturate(ambientPressure, 1, gasMix.n2);
					limit += 1;
				}

				limits.push(limit > -1 ? limit : null);
			}
		}

		return limits.length === 0 ? null : limits.reduce((min, limit) => limit < min ? limit : min);
	};

	get tissues() {
		return this._tissues;
	}

	get ceiling() {
		return Number(this._tissues.reduce((lowest, tissue) => tissue.ceiling > lowest ? tissue.ceiling : lowest, 0).toFixed(1));
	}

	reset() {
		for (const tissue of this._tissues) {
			tissue.reset();
		}
	};
}

module.exports = Model;
