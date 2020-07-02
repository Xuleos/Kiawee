import { DirectionNameUnion } from "../Directions";
import { Tile } from "./Options";

export interface InternalTile<T> extends Tile<T> {
	pLogP: number;
	index: number;
}

export type possibleNeighborsType = {
	[dir in DirectionNameUnion]: Array<number>;
};

export type TileEnablers = {
	[dirtype in DirectionNameUnion]: {
		[index: number]: number;
	};
};

export type Neighbors = {
	[dir in DirectionNameUnion]?: number;
};
