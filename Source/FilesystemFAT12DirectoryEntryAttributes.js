
class FilesystemFAT12DirectoryEntryAttributes
{
	constructor
	(
		isReadOnly,
		isHidden,
		isSystem,
		isVolumeLabel,
		isSubdirectory,
		isArchive
	)
	{
		this.isReadOnly = isReadOnly;
		this.isHidden = isHidden;
		this.isSystem = isSystem;
		this.isVolumeLabel = isVolumeLabel;
		this.isSubdirectory = isSubdirectory;
		this.isArchive = isArchive;
	}

	static fromByte(attributesAsByte)
	{
		var returnValue = new FilesystemFAT12DirectoryEntryAttributes
		(
			(((attributesAsByte >> 0) & 1) == 1),
			(((attributesAsByte >> 1) & 1) == 1),
			(((attributesAsByte >> 2) & 1) == 1),
			(((attributesAsByte >> 3) & 1) == 1),
			(((attributesAsByte >> 4) & 1) == 1),
			(((attributesAsByte >> 5) & 1) == 1)
		);

		return returnValue;
	}
}
