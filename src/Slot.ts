import * as InternalTypes from "./types/Internal";

export default class Slot<T> {
	public entropyOutdated = true;

	private entropy?: number;

	private tiles: Array<InternalTypes.InternalTile<T>>;
	public constructor(
		pos: Vector3,
		tiles: Array<InternalTypes.InternalTile<T>>,
		initialTileEnablers: InternalTypes.TileEnablers,
	) {
		this.tiles = tiles;
	}

	public getEntroy(): number {
		if (this.entropyOutdated === true || this.entropy === undefined) {
			this.entropy = this.calculateEntropy();
			this.entropyOutdated = false;
		}

		return this.entropy;
	}

	private calculateEntropy(): number {
		const totals = this.tiles.reduce(
			(accum, tile) => {
				return {
					probability: accum.probability + tile.probability,
					pLogP: accum.pLogP + tile.pLogP,
				};
			},
			{
				probability: 0,
				pLogP: 0,
			},
		);

		return (-1 / totals.probability) * totals.pLogP + math.log(totals.probability);
	}
}
