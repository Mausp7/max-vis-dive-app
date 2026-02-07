import {TissueProperty, TissueSettings} from './TissueSettings';
import {Tissue} from './Tissue';
import {GasMix} from './GasMix';

export class Diver {
	private _tissues: Tissue[];
	private _gasMix: GasMix;

	constructor(startPressure: number = 1, gasMix: GasMix = new GasMix, tissueSettings: TissueProperty[] = TissueSettings) {
		this._gasMix = gasMix;
		this._tissues = this.initTissues(startPressure, tissueSettings);
	}

	private initTissues(startPressure: number, tissueSettings: TissueProperty[]): Tissue[] {
		const tissues = [];

		for (const t of tissueSettings) {
			tissues.push(new Tissue(t.halfTime, t.mValue, startPressure, this._gasMix));
		}

		return tissues;
	}

	public switchGasMix(gasMix: GasMix): Diver {
		this._gasMix = gasMix;

		for (const tissue of this._tissues)
		{
			tissue.switchGasMix(this._gasMix);
		}

		return this;
	}

	public saturateTissues(ambientPressure: number, duration: number, gradFactor = 1): Diver {
		for (const tissue of this._tissues)
		{
			tissue.saturate(ambientPressure, duration, gradFactor);
		}

		return this;
	}

	public getNoDecompressionLimit (depth: number, gradientFactor: number = 1): number {
		this.reset();

		const ambientPressure = (depth / 10) + 1;
		const limits = [];

		for (const tissue of this._tissues) {
			if (ambientPressure * this._gasMix.fN2 > tissue.mValue * gradientFactor) {
				let limit = -1;
				while (tissue.tissueLoad.N2 <= tissue.mValue * gradientFactor) {
					tissue.saturate(ambientPressure, 1, this._gasMix.fN2);
					limit += 1;
				}

				limits.push(limit > -1 ? limit : null);
			}
		}

		return limits.length === 0 ? null : limits.reduce((min, limit) => limit < min ? limit : min);
	};

	public get ceiling() {
		return Number(this._tissues.reduce((lowest, tissue) => tissue.ceiling > lowest ? tissue.ceiling : lowest, 0).toFixed(1));
	}

	public reset(): Diver {
		for (const tissue of this._tissues) {
			tissue.reset();
		}

		return this;
	};
}