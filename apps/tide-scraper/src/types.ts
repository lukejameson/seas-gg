export type TideData = {
	time: string;
	height: number;
};

export type VerboseTideData = {
	typeof?: string | null;
	time: string;
	height: number;
};

export type Tide = {
	id: string;
	date: string;
	basicTides: VerboseTideData[] | null;
	hourlyTides: TideData[] | null;
};
