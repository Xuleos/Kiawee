import * as InternalTypes from "./types/Internal";
import { Generator } from "./Generator";
import { DirectionNames, DirectionIndexFromName, getInverseDir } from "./Directions";
import { Workspace } from "@rbxts/services";

type RemovalEntry<T> = {
	tile: InternalTypes.InternalTile<T>;
	slot: Slot<T>;
};
type RemovalArray<T> = Array<RemovalEntry<T>>;
export default class Slot<T> {
	//Tile index
	public confirmedTile?: InternalTypes.InternalTile<T>;
	public entropyOutdated = true;
	public index: number;
	public position: Vector3;
	public tileEnablers: InternalTypes.TileEnablers;

	public debugParts?: {
		part: Part;
		tileDisplay: TextLabel;
	};

	private entropy?: number;

	private tiles: Array<InternalTypes.InternalTile<T>>;
	private random: Random;
	private generator: Generator<T>;

	private neighbors?: InternalTypes.Neighbors;

	public constructor(
		pos: Vector3,
		index: number,
		generator: Generator<T>,
		tiles: Array<InternalTypes.InternalTile<T>>,
		initialTileEnablers: InternalTypes.TileEnablers,
		random: Random,
		debugPart?: boolean,
	) {
		this.position = pos;
		this.tiles = tiles;
		this.random = random;
		this.index = index;
		this.generator = generator;
		this.tileEnablers = initialTileEnablers;

		if (debugPart === true) {
			const part = new Instance("Part");
			part.Size = generator.gridOptions.slotSize;
			part.Position = pos;
			part.Anchored = true;
			part.CanCollide = false;
			part.Transparency = 0.8;
			part.Parent = Workspace;

			const surfaceGui = new Instance("SurfaceGui");
			surfaceGui.Face = Enum.NormalId.Top;
			surfaceGui.Parent = part;

			const textLabel = new Instance("TextLabel");
			textLabel.TextScaled = true;
			textLabel.Size = new UDim2(1, 0, 1, 0);
			textLabel.Text = tostring(tiles.size());
			textLabel.Parent = surfaceGui;

			this.debugParts = {
				part: part,
				tileDisplay: textLabel,
			};
		}
	}

	public getEntroy(): number {
		if (this.entropyOutdated === true || this.entropy === undefined) {
			this.entropy = this.calculateEntropy();
			this.entropyOutdated = false;
		}

		return this.entropy;
	}

	public collapseRandom(): void {
		if (this.tiles.size() <= 0) {
			//! CONTRADICTION
			return;
		}

		if (this.confirmedTile !== undefined) {
			error("This slot has already been collapsed");
		}

		let totalWeight = 0;

		for (const tile of this.tiles) {
			totalWeight += tile.probability;
		}

		let randomNum = this.random.NextInteger(1, totalWeight);

		for (const tile of this.tiles) {
			if (randomNum <= tile.probability) {
				//Collapse
				this.collapse(tile);
				return;
			} else {
				randomNum -= tile.probability;
			}
		}

		//Collapse first tile
		const firstTile = this.tiles[0];

		if (firstTile) {
			this.collapse(firstTile);
		} else {
			error("No first tile");
		}
	}

	public containsTile(tileIndex: number): boolean {
		return (
			this.tiles.find((tile) => {
				return tile.index === tileIndex;
			}) !== undefined
		);
	}

	private collapse(tile: InternalTypes.InternalTile<T>) {
		this.confirmedTile = tile;

		this.generator.history[this.generator.currentStep] = {
			removedTiles: new Map<number, Array<InternalTypes.InternalTile<T>>>(),
			slotIndex: this.index,
		};

		const excessTiles = this.tiles.filter((tile) => {
			return tile !== this.confirmedTile;
		});

		let removalArray: RemovalArray<T> = [];

		this.removeTiles(excessTiles, removalArray, () => {
			for (const entry of removalArray) {
				if (entry.slot.confirmedTile === undefined) {
					entry.slot.removeTiles([entry.tile], removalArray);
				}
			}
		});

		removalArray = [];

		this.generator.buildQueue.push({
			slot: this,
			tile: tile,
		});
	}

	private getNeighborsOfSlot() {
		if (this.neighbors === undefined) {
			this.neighbors = this.generator.getNeighbors(this.position);
		}

		return this.neighbors;
	}

	private removeTiles(
		tilesToRemove: Array<InternalTypes.InternalTile<T>>,
		removalArray: RemovalArray<T>,
		finish?: () => void,
	) {
		const stepHistory = this.generator.history[this.generator.currentStep];

		const removedTilesHere = stepHistory.removedTiles.get(this.index);

		if (removedTilesHere === undefined) {
			stepHistory.removedTiles.set(this.index, tilesToRemove.copy());
		} else {
			removedTilesHere.push(...tilesToRemove);
		}

		for (const [dir, neighborIndex] of Object.entries(this.getNeighborsOfSlot())) {
			const neighbor = this.generator.slots[neighborIndex];

			const dirIndex = DirectionIndexFromName[dir];
			const inverseDirName = getInverseDir(dirIndex - 1);

			for (const tile of tilesToRemove) {
				const possibleNeighbors = this.generator.adjacencyModel.getPossibleNeighbors(tile.index)[dir];
				for (const possibleNeighbor of possibleNeighbors) {
					const containsPossibleNeighbor = neighbor.containsTile(possibleNeighbor);

					if (neighbor.tileEnablers[inverseDirName][possibleNeighbor] === 1 && containsPossibleNeighbor) {
						//TODO: Removaleoe
						removalArray.push({
							tile: this.generator.adjacencyModel.tiles[possibleNeighbor],
							slot: neighbor,
						});
					}

					neighbor.tileEnablers[inverseDirName][possibleNeighbor]--;
				}
			}
		}

		for (const tile of tilesToRemove) {
			const tileIndex = this.tiles.indexOf(tile);
			this.tiles.remove(tileIndex);
		}

		if (this.tiles.size() <= 0) {
			//!CONTRADICTION
			error("CONTRADICTION");
		}

		if (finish !== undefined) {
			finish();
		}
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
