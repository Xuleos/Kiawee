import { Workspace } from "@rbxts/services";
import { Generator } from "./Generator";
import { FaceConnectionModel } from "./AdjacencyModels";
import * as Options from "./types/Options";

function createFakeTileModel(): Model {
	const part = new Instance("Part");
	part.Size = new Vector3(5, 5, 5);
	part.Anchored = true;
	part.CanCollide = false;

	const model = new Instance("Model");

	part.Parent = model;

	model.Parent = Workspace;

	return model;
}

export = () => {
	const tiles = [
		{
			probability: 1,
			model: createFakeTileModel(),
			rules: {
				Left: "0",
				Right: "0",
				Front: "0",
				Back: "0",
				Top: "0",
				Bottom: "0",
			},
		},
	];
	const adjacency = new FaceConnectionModel(tiles);
	const gen = new Generator(
		{
			gridSize: new Vector3(3, 3, 3),
			slotSize: new Vector3(5, 5, 5),
		},
		adjacency,
	);
	it("correctly generates initial tile enablers", () => {
		const tileEnablers = gen["createInitialTileEnablers"](adjacency.tiles);
		expect(tileEnablers).to.be.a("table");

		for (const [dir, enablers] of Object.entries(tileEnablers)) {
			expect(dir).to.be.a("string");

			for (const [neighborIndex, enablerCount] of Object.entries(enablers)) {
				expect(neighborIndex).to.be.equal(1);
				expect(enablerCount).to.be.equal(1);
			}
		}
	});
};
