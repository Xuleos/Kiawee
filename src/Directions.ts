export const DirectionNames = ["Left", "Right", "Front", "Back", "Top", "Bottom"];
export type DirectionNameUnion = typeof DirectionNames[number];

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

	return DirectionNames[inverseDirIndex];
}
