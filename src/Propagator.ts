import { BaseTopology } from "./Topology";
import { AdjacencyModel } from "./AdjacencyModel";
import { Slot } from "./Slot";
import { Tile } from "./Tile";

import PropagatorOptions from "./Interfaces/PropagatorOptions";
import { Status } from "./Interfaces/StatusEnum";
export class Propagator<T extends BaseTopology> {
	slots: Array<Slot> = [];

	removalQueue: Array<{
		tile: Tile;
		slot: Slot;
	}> = [];

	history: Array<{
		RemovedTiles: Map<Slot, Array<Tile>>;
		Slot: Slot;
	}> = [];

	status: Status;

	step = 0;

	readonly random: Random;

	private initialTileHealth: {
		[direction: string]: {
			[Index: string]: number;
		};
	};

	constructor(public topology: T, public model: AdjacencyModel<T>, private options: PropagatorOptions) {
		this.initialTileHealth = this.CreateInitialTileHealth(model.tiles);

		for (const position of topology.slots) {
			this.slots.push(new Slot(position, model.tiles, this, Object.deepCopy(this.initialTileHealth)));
		}

		if (options.Seed !== undefined) {
			this.random = new Random(options.Seed);
		} else {
			this.random = new Random();
		}

		this.status = Status.Solving;
	}

	GetAvailableTilesLeft(): number {
		const collapseFiltered = this.slots.filter((slot) => {
			return !slot.confirmedTile;
		});

		return collapseFiltered.reduce((total, slot) => {
			return total + slot.tiles.size();
		}, 0);
	}

	Run() {
		let availableTilesLeft = this.GetAvailableTilesLeft();

		//this could be a bad idea in the future and result in infinite yielding
		while (availableTilesLeft > 0) {
			wait();

			this.step++;

			for (const slot of this.slots) {
				slot.entropy = slot.CalculateEntropy();
			}

			const lowestEntropy = this.FindLowestEntropy();
			lowestEntropy.CollapseRandom();

			availableTilesLeft = this.GetAvailableTilesLeft();

			if (this.options.Debug) {
				for (const slot of this.slots) {
					slot.tilesDisplay.Text = tostring(slot.tiles.size());
					slot.entropyDisplay.Text = tostring(slot.entropy);
				}
			}
			if (this.status === Status.Contradiction) {
				this.Undo(this.options.BacktrackDepth !== undefined ? this.options.BacktrackDepth : 4);
			}
		}

		if (this.options.Debug) {
			print("We finished!");
		}

		this.status = Status.Completed;
	}

	FinishRemovalQueue() {
		while (this.removalQueue.size() > 0) {
			const entry = this.removalQueue.pop();

			if (entry && !entry.slot.confirmedTile) {
				entry.slot.RemoveTiles([entry.tile], false);
			}
		}
	}

	SetContradiction() {
		this.status = Status.Contradiction;
	}

	Undo(amount: number) {
		for (let i = 0; i < amount; i++) {
			const stamp = this.history[this.step];

			for (const [slot, tiles] of stamp.RemovedTiles) {
				slot.AddTiles(tiles);
			}

			stamp.Slot.confirmedTile = undefined;

			this.step--;
		}
	}

	private FindLowestEntropy(): Slot {
		const sorted = this.slots.sort((a, b) => {
			return a.entropy < b.entropy;
		});

		return sorted.filter((slot) => {
			return slot.confirmedTile === undefined;
		})[0];
	}

	private CreateInitialTileHealth(tiles: Array<Tile>) {
		const initialTileHealth: {
			[direction: string]: {
				[Index: string]: number;
			};
		} = {};

		for (const [dirName, dirVector] of Object.entries(this.topology.Directions)) {
			const inverseDirName = this.model.GetInverseDirection(dirName);
			initialTileHealth[dirName] = {};

			for (const tile of tiles) {
				for (const possibleNeighborIndex of tile.possibleNeighbors[inverseDirName]) {
					if (initialTileHealth[dirName][possibleNeighborIndex] === undefined) {
						initialTileHealth[dirName][possibleNeighborIndex] = 0;
					}

					initialTileHealth[dirName][possibleNeighborIndex]++;
				}
			}
		}

		return initialTileHealth;
	}
}
