//Plan to support both face and corner connections by default hopefully

import { DirectionNames, DirectionNameUnion, getInverseDir } from "./Directions";
import { possibleNeighborsType, InternalTile } from "./types/Internal";
import * as Options from "./types/Options";

export const STARTING_POSSIBLE_NEIGHBORS = {
	Left: [],
	Right: [],
	Front: [],
	Back: [],
	Top: [],
	Bottom: [],
};

export abstract class AdjacencyModel<T> {
	public tiles: Array<InternalTile<T>>;

	public cachedPossibleNeighbors: Array<possibleNeighborsType>;

	public constructor(tileSet: Array<Options.Tile<T>>) {
		this.tiles = [];
		this.cachedPossibleNeighbors = [];
		for (const tile of tileSet) {
			this.tiles.push({
				probability: tile.probability,
				model: tile.model,
				rules: tile.rules,
				index: this.tiles.size(),
				pLogP: tile.probability * math.log(tile.probability),
			});
		}
	}

	public abstract getPossibleNeighbors(tileIndex: number): possibleNeighborsType;
}

type FaceConnectionRules = {
	[dir in DirectionNameUnion]: string;
};

export class FaceConnectionModel extends AdjacencyModel<FaceConnectionRules> {
	public constructor(tileSet: Array<Options.Tile<FaceConnectionRules>>) {
		super(tileSet);
	}

	public getPossibleNeighbors(tileIndex: number): possibleNeighborsType {
		if (this.cachedPossibleNeighbors[tileIndex] !== undefined) {
			return this.cachedPossibleNeighbors[tileIndex];
		} else {
			const thisTile = this.tiles[tileIndex];

			const possibleNeighbors: possibleNeighborsType = Object.deepCopy(STARTING_POSSIBLE_NEIGHBORS);

			for (let i = 0; i < 6; i++) {
				const dirName = DirectionNames[i];
				const inverseDir = getInverseDir(i);

				for (const [index, tile] of Object.entries(this.tiles)) {
					if (tile.rules[inverseDir] === thisTile.rules[dirName]) {
						possibleNeighbors[dirName].push(index);
					}
				}
			}

			this.cachedPossibleNeighbors[tileIndex] = possibleNeighbors;

			return possibleNeighbors;
		}
	}
}
