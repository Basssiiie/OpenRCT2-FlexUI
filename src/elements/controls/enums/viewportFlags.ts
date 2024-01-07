/**
 * Available visibility flags for the viewport.
 */
export enum ViewportFlags
{
	Gridlines = (1 << 7),
	UndergroundInside = (1 << 0),
	HideBase = (1 << 12),
	HideVertical = (1 << 13),

	SoundOn = (1 << 10),
	LandOwnership = (1 << 8),
	ConstructionRights = (1 << 9),
	InvisibleEntities = (1 << 14),
	ClipView = (1 << 17),
	HighlightPathIssues = (1 << 18),
	TransparentBackground = (1 << 19),

	LandHeights = (1 << 4),
	TrackHeights = (1 << 5),
	PathHeights = (1 << 6),

	SeeThroughRides = (1 << 1),
	SeeThroughVehicles = (1 << 20),
	SeeThroughVegetation = (1 << 21),
	SeeThroughScenery = (1 << 2),
	SeeThroughPaths = (1 << 16),
	SeeThroughSupports = (1 << 3),

	InvisibleGuests = (1 << 11),
	InvisibleStaff = (1 << 23),
	InvisibleRides = SeeThroughRides | (1 << 24),
    InvisibleVehicles = SeeThroughVehicles | (1 << 25),
    InvisibleVegetation = SeeThroughVegetation | (1 << 26),
    InvisibleScenery = SeeThroughScenery | (1 << 27),
    InvisiblePaths = SeeThroughPaths | (1 << 28),
    InvisibleSupports = SeeThroughSupports | (1 << 29),
}
