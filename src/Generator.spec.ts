import Generator from "./Generator";
import { FaceConnectionModel } from "./AdjacencyModels";

export = () => {
	const adjacency = new FaceConnectionModel([]);
	const gen = new Generator(
		{
			gridSize: new Vector3(3, 3, 3),
			slotSize: new Vector3(5, 5, 5),
		},
		adjacency,
	);
	it("correctly generates initial tile enablers", () => {
		gen["createInitialTileEnablers"]();
	});
};
