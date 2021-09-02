
class FilesystemFAT12
{
	constructor
	(
		bytesPerSector,
		sectorsPerCluster,
		numberOfReservedSectors,
		numberOfFATs,
		rootDirectoryEntriesMax,
		sectorsTotal,
		sectorsPerFAT,
		sectorsPerTrack,
		numberOfHeads,
		volumeID,
		volumeLabel,

		fat, // "fat" = "file allocation table"

		directoryRoot,

		bytes
	)
	{
		this.bytesPerSector = bytesPerSector;
		this.sectorsPerCluster = sectorsPerCluster;
		this.numberOfReservedSectors = numberOfReservedSectors;
		this.numberOfFATs = numberOfFATs;
		this.rootDirectoryEntriesMax = rootDirectoryEntriesMax;
		this.sectorsTotal = sectorsTotal;	
		this.sectorsPerFAT = sectorsPerFAT;
		this.sectorsPerTrack = sectorsPerTrack;
		this.numberOfHeads = numberOfHeads;
		this.volumeID = volumeID;
		this.volumeLabel = volumeLabel;

		this.fat = fat;

		this.directoryRoot = directoryRoot;

		this.bytes = bytes;

		this.offsetOfDataRegionInSectors = 
			this.numberOfReservedSectors
			+ 
			(
				this.numberOfFATs
				* this.sectorsPerFAT
			)
			+ 
			(
				this.rootDirectoryEntriesMax 
				* FilesystemFAT12.DirectoryEntrySizeInBytes()
			)
			/ this.bytesPerSector
			- 2; // hack - Not sure why I have to subtract 2.

		this.directoryCurrent = this.directoryRoot;
	}
	// constants

	static DirectoryEntrySizeInBytes() { return 32 };

	// static methods

	static fromBytes(filesystemAsBytes)
	{
		// Based on descriptions of the FAT12 filesystem found at the URLs:
		// https://en.wikipedia.org/wiki/Design_of_the_FAT_file_system
		// and
		// http://www.eit.lth.se/fileadmin/eit/courses/eitn50/Projekt1/FAT12Description.pdf

		var byteStream = new ByteStream(filesystemAsBytes);

		var descriptorOffsetInBytes = 11;
		var bytesIgnored = byteStream.readBytes(descriptorOffsetInBytes);

		var bytesPerSector = byteStream.readIntegerLE(2);
		var sectorsPerCluster = byteStream.readIntegerLE(1);
		var numberOfReservedSectors = byteStream.readIntegerLE(2);
		var numberOfFATs = byteStream.readIntegerLE(1);
		var rootDirectoryEntriesMax = byteStream.readIntegerLE(2);
		var sectorsTotal = byteStream.readIntegerLE(2);
		bytesIgnored = byteStream.readBytes(1);
		var sectorsPerFAT = byteStream.readIntegerLE(2);
		var sectorsPerTrack = byteStream.readIntegerLE(2);
		var numberOfHeads = byteStream.readIntegerLE(2);
		bytesIgnored = byteStream.readBytes(4);
		var sectorsTotalForFAT32 = byteStream.readIntegerLE(4); // ignore for FAT12
		bytesIgnored = byteStream.readBytes(2);
		var bootSignatureExtended = byteStream.readBytes(1);
		var volumeID = byteStream.readIntegerLE(4);
		var volumeLabel = byteStream.readString(11);
		var filesystemType = byteStream.readString(8);

		var byteOffsetOfFAT = numberOfReservedSectors * bytesPerSector;
		byteStream.byteIndexCurrent = byteOffsetOfFAT;
		var bytesPerFAT = sectorsPerFAT * bytesPerSector;
		var bytesForFAT = byteStream.readBytes(bytesPerFAT);

		var fat = FilesystemFAT12FileAllocationTable.fromBytes
		(
			bytesForFAT
		);

		var sectorOffsetOfDirectoryRoot = 
			numberOfReservedSectors
			+ (numberOfFATs * sectorsPerFAT);

		var byteOffsetOfDirectoryRoot = 
			sectorOffsetOfDirectoryRoot
			* bytesPerSector;

		var directoryRoot = FilesystemFAT12Directory.fromDirectoryParentEntryAndBytes
		(
			null, // directorParent
			null, // directoryEntryForSelf
			filesystemAsBytes.slice
			(
				byteOffsetOfDirectoryRoot,
				byteOffsetOfDirectoryRoot
					+ rootDirectoryEntriesMax 
					* FilesystemFAT12.DirectoryEntrySizeInBytes()
			)
		);

		var returnValue = new FilesystemFAT12
		(
			bytesPerSector,
			sectorsPerCluster,
			numberOfReservedSectors,
			numberOfFATs,
			rootDirectoryEntriesMax,
			sectorsTotal,
			sectorsPerFAT,
			sectorsPerTrack,
			numberOfHeads,
			volumeID,
			volumeLabel,

			fat,

			directoryRoot,

			filesystemAsBytes
		);

		return returnValue;	
	}

	// instance methods

	// dom

	domElementUpdate()
	{
		if (this.domElement == null)
		{
			this.domElement = document.createElement("div");
		}

		this.domElement.innerHTML = "";

		this.domElement.appendChild
		(
			this.directoryCurrent.domElementUpdate()
		);

		return this.domElement;
	}

	// string

	toString()
	{
		return JSON.stringify(this).split(",").join(",\n");
	}
}
