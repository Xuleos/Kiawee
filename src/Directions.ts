export type DirectionNameUnion = "Left" | "Right" | "Front" | "Back" | "Top" | "Bottom";

export const DirectionNames: Array<DirectionNameUnion> = ["Left", "Right", "Front", "Back", "Top", "Bottom"];

export const directionVectors = [
	new Vector3(-1, 0, 0),
	new Vector3(1, 0, 0),
	new Vector3(0, 0, -1),
	new Vector3(0, 0, 1),
	new Vector3(0, 1, 0),
	new Vector3(0, -1, 0),
];

const inverseDirections: Array<Vector3> = [];

for (const dirVector of directionVectors) {
	// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
	inverseDirections.push((-dirVector as unknown) as Vector3);
}

export function getInverseDir(dirIndex: number): DirectionNameUnion {
	const inverseDir = inverseDirections[dirIndex];

	const inverseDirIndex = directionVectors.findIndex((value) => {
		return value === inverseDir;
	});

	// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
	return DirectionNames[inverseDirIndex] as DirectionNameUnion;
}
