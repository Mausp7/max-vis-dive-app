import { GasMix } from "./GasMix";

export type TissueLoad = Partial<Record<"N2" | "He2", number>>;

export class Tissue {
	private _halfTime: number;
	private _mValue: number;
	private _gasMix: GasMix;
	private _tissueLoad: TissueLoad;
	private _ceiling: number = 0;

	constructor(halfTime: number, mValue: number = 2, startPressure: number = 1, gasMix: GasMix = new GasMix()) {
		this._halfTime = halfTime;
		this._mValue = mValue;
		this._gasMix = gasMix;
		this._tissueLoad = {"N2": startPressure * gasMix.fN2};
	};
	
	public get mValue():number {
		return this._mValue;
	}

	public get tissueLoad():TissueLoad {
		return this._tissueLoad;
	};

	public get ceiling():number {
		return this._ceiling;
	}

	public get gasMix(): GasMix {
		return this._gasMix;
	}
	
	public switchGasMix(gasMix: GasMix): Tissue {
		this._gasMix = gasMix;
		return this;
	}

	public saturate(ambientPressure: number, duration: number, gradFactor: number = 1): Tissue {
		this._tissueLoad.N2 += (ambientPressure * this._gasMix.fN2 - this._tissueLoad.N2) * (1 - 0.5 ** (duration / this._halfTime));
		const ceiling =  (this._tissueLoad.N2 / ((this._mValue - 1) + 1) - 1) * 10;
		this._ceiling = Math.max(ceiling, 0);

		return this;
	};

	public reset(startPressure = 1, inertGasStart: GasMix = new GasMix()): Tissue {
		this._tissueLoad.N2 = startPressure * inertGasStart.fN2;
		this._ceiling = 0;

		return this;
	}
}