//Plan to support both face and corner connections by default hopefully

import { DirectionNames } from "./Directions";

interface Tile<Rules> {
	probability: number;
	model: Model;
	rules: Rules;
}

interface InternalTile<T> extends Tile<T> {
	pLogP: number;
}

export abstract class AdjacencyModel<T> {
	public tiles: Array<InternalTile<T>>;

	public constructor(tileSet: Array<Tile<T>>) {
		this.tiles = [];
		for (const tile of tileSet) {
			this.tiles.push({
				probability: tile.probability,
				model: tile.model,
				rules: tile.rules,
				pLogP: tile.probability * math.log(tile.probability),
			});
		}
	}
}

type FaceConnectionRules = {
	[dir in typeof DirectionNames[number]]: string;
};

export class FaceConnectionModel extends AdjacencyModel<FaceConnectionRules> {
	public constructor(tileSet: Array<Tile<FaceConnectionRules>>) {
		super(tileSet);
	}
}
