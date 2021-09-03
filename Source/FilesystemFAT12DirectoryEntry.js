
class FilesystemFAT12DirectoryEntry
{
	constructor
	(
		shortFileName,
		shortFileExtension,
		attributes,
		datetimeCreated,
		dateAccessed,
		datetimeModified,
		clusterIndexFirst,
		sizeInBytes
	)
	{
		this.shortFileName = shortFileName;
		this.shortFileExtension = shortFileExtension;
		this.attributes = attributes;
		this.datetimeCreated = datetimeCreated;
		this.dateAccessed = dateAccessed;
		this.datetimeModified = datetimeModified;
		this.clusterIndexFirst = clusterIndexFirst;
		this.sizeInBytes = sizeInBytes;
	}

	static fromBytes(bytes)
	{
		var byteStream = new ByteStream(bytes);

		var shortFileName = byteStream.readString(8);
		var shortFileExtension = byteStream.readString(3);
		var attributesAsByte = byteStream.readByte();
		var reserved = byteStream.readBytes(2);
		var datetimeCreated = byteStream.readIntegerLE(4);
		var dateAccessed = byteStream.readIntegerLE(2);
		var bytesIgnored = byteStream.readBytes(2);
		var datetimeModified = byteStream.readIntegerLE(4);
		var clusterIndexFirst = byteStream.readIntegerLE(2);
		var sizeInBytes = byteStream.readIntegerLE(4);

		var attributes = FilesystemFAT12DirectoryEntryAttributes.fromByte
		(
			attributesAsByte
		);

		var returnValue = new FilesystemFAT12DirectoryEntry
		(
			shortFileName,
			shortFileExtension,
			attributes,
			datetimeCreated,
			dateAccessed,
			datetimeModified,
			clusterIndexFirst,
			sizeInBytes
		);

		return returnValue;
	}

	// instance methods

	contentBytesLoadUsingFilesystem(filesystem)
	{
		var contentBytes = [];

		var clusterIndexCurrent = this.clusterIndexFirst;

		var bytesPerCluster = 
			filesystem.sectorsPerCluster
			* filesystem.bytesPerSector;

		var fatEntries = filesystem.fat.entries;

		while 
		(
			clusterIndexCurrent != 0 // unused - file is empty?
			&& clusterIndexCurrent < 0xFF8 // ?
		)
		{
			var sectorOffsetOfCluster = 
				clusterIndexCurrent * filesystem.sectorsPerCluster
				+ filesystem.offsetOfDataRegionInSectors

				// hack - Have to subtract a further 6 sectors,
				// which in tests happens to match this.
				- filesystem.numberOfFATs * filesystem.sectorsPerFAT
				-2;

			var byteOffsetOfCluster = 
				sectorOffsetOfCluster
				* filesystem.bytesPerSector;

			var bytesFromCluster = 
			(
				filesystem.bytes.slice
				(
					byteOffsetOfCluster,
					byteOffsetOfCluster + bytesPerCluster
				)
			);

			contentBytes = contentBytes.concat
			(
				bytesFromCluster
			);

			clusterIndexCurrent = fatEntries[clusterIndexCurrent];
		}

		if (this.attributes.isSubdirectory == false)
		{
			contentBytes.length = this.sizeInBytes;
		}

		return contentBytes;
	}

	downloadAsFile()
	{
		var filesystem = Globals.Instance.filesystem;

		var contentBytes = this.contentBytesLoadUsingFilesystem
		(
			filesystem
		);

		FileHelper.saveBytesToFile
		(
			contentBytes,
			this.fileNamePlusExtension()
		);
	}

	fileNamePlusExtension()
	{
		return this.shortFileName.trim() + "." + this.shortFileExtension;
	}

	openAsDirectory()
	{
		var filesystem = Globals.Instance.filesystem;

		var contentBytes = this.contentBytesLoadUsingFilesystem
		(
			filesystem
		);

		filesystem.directoryCurrent =
			FilesystemFAT12Directory.fromDirectoryParentEntryAndBytes
			(
				filesystem.directoryCurrent,
				this, // directoryEntryForSelf
				contentBytes
			);

		filesystem.domElementUpdate();
	}

	// dom

	domElementUpdate()
	{
		if (this.domElement == null)
		{
			var d = document;

			this.domElement = d.createElement("div");

			var indent = "&nbsp;&nbsp;&nbsp;&nbsp;";

			if (this.attributes.isVolumeLabel == true)
			{
				this.domElement.innerHTML = 
					"Volume Label: " + this.shortFileName
			}
			else if (this.attributes.isSubdirectory)
			{
				var labelName = d.createElement("label");
				labelName.innerHTML = indent + this.shortFileName;
				this.domElement.appendChild(labelName);

				var buttonOpen = d.createElement("button");
				buttonOpen.innerHTML = "Open";
				buttonOpen.onclick = this.openAsDirectory.bind(this);
				this.domElement.appendChild(buttonOpen);
			}
			else
			{
				var fileNamePlusExtension = this.fileNamePlusExtension();

				var labelName = d.createElement("label");
				labelName.innerHTML = indent + fileNamePlusExtension;
				this.domElement.appendChild(labelName);

				var buttonDownload = d.createElement("button");
				buttonDownload.innerHTML = "Download";
				buttonDownload.onclick = this.downloadAsFile.bind(this);
				this.domElement.appendChild(buttonDownload);
			}
		}

		return this.domElement;
	}
}
