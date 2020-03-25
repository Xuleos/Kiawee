import ITile from "./Interfaces/ITile";
import { Tile } from "./Tile";
import { BaseTopology } from "./Topology";

export class AdjacencyModel<T extends BaseTopology> {
	tiles: Array<Tile> = [];
	constructor(public topology: T, public tileDefinitions: Array<ITile<string>>) {
		for (const definition of tileDefinitions) {
			const possibleNeighbors = this.GetPossibleNeighbors(definition);
			this.tiles.push(new Tile(definition.model, definition.probability, definition.index, possibleNeighbors));
		}
	}

	//This is gross
	GetInverseDirection(direction: string): string {
		const dirVector = this.topology.Directions[direction];
		if (dirVector) {
			//There isn't a unary datatype math method thing so we have to make ugly assertions ;(
			// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
			const inverseVector = (-dirVector as unknown) as Vector3;

			const inverseDirectionSet = Object.entries(this.topology.Directions).find(
				// eslint-disable-next-line roblox-ts/no-object-math
				([key, value]) => value === inverseVector,
			);

			if (inverseDirectionSet) {
				return inverseDirectionSet[0];
			} else {
				error(`Could not get inverse direction set`);
			}
		} else {
			error(`${direction} is not a valid direction of this.topology.Directions`);
		}
	}

	private GetPossibleNeighbors(tileDefinition: ITile<string>) {
		const possibleNeighbors: {
			[direction: string]: Array<string>; //Array of tile indexes
		} = {};

		for (const [dirName, dirVector] of Object.entries(this.topology.Directions)) {
			possibleNeighbors[dirName] = [];

			const inverseDirName = this.GetInverseDirection(dirName);
			for (const definition of this.tileDefinitions) {
				if (definition.rules[inverseDirName] === tileDefinition.rules[dirName]) {
					possibleNeighbors[dirName].push(definition.index);
				}
			}
		}

		return possibleNeighbors;
	}
}
