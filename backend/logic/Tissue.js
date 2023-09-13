class Tissue {
	constructor(halfTime, mValue = 2, startPressure = 1, fInertGasStart = 0.79) {
		this._halfTime = halfTime;
		this._mValue = mValue;
		this._tissueLoad = startPressure * fInertGasStart;
		this._ceiling = 0;
	};

	saturate(ambientPressure, duration, fInertGas) {
		this._tissueLoad += (ambientPressure * fInertGas - this._tissueLoad) * (1 - 0.5 ** (duration / this._halfTime));
		const ceiling =  (this._tissueLoad / ((this._mValue - 1) + 1) - 1) * 10;
		this._ceiling = Math.max(ceiling, 0);
	};

	get mValue() {
		return this._mValue;
	}
	get tissueLoad() {
		return this._tissueLoad;
	};

	get ceiling() {
		return this._ceiling;
	}

	reset() {
		this._tissueLoad = 0;
		this._ceiling = 0;
	}

}

module.exports = Tissue;