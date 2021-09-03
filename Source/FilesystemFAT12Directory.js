
class FilesystemFAT12Directory
{
	constructor
	(
		directoryParent,
		directoryEntryForSelf,
		entries
	)
	{
		this.directoryParent = directoryParent
		this.directoryEntryForSelf = directoryEntryForSelf;
		this.entries = entries;
	}

	static fromDirectoryParentEntryAndBytes
	(
		directoryParent,
		directoryEntryForSelf, 
		directoryAsBytes
	)
	{
		var byteStream = new ByteStream(directoryAsBytes);

		var directoryEntries = [];
		var directoryEntrySizeInBytes =
			FilesystemFAT12.DirectoryEntrySizeInBytes();

		while (true)
		{
			var bytesForDirectoryEntry = byteStream.readBytes
			(
				directoryEntrySizeInBytes
			);

			var entryType = bytesForDirectoryEntry[0];

			if (entryType == 0x00) // no more entries
			{
				break;
			}
			else if (entryType == 0xE5) // freed entry
			{
				// do nothing
			}
			else
			{
				var attributesAsByte = bytesForDirectoryEntry[11];
				if (attributesAsByte == 0xF)
				{
					// long file name
					// todo
				}
				else
				{

					var directoryEntry = FilesystemFAT12DirectoryEntry.fromBytes
					(
						bytesForDirectoryEntry
					);

					if 
					(
						directoryEntry.shortFileName.indexOf(".") == 0
					)
					{
						// self (".") or parent ("..")
						// todo
					}
					else
					{
						directoryEntries.push
						(
							directoryEntry
						);
					}
				}
			}
			
		}

		var returnValue = new FilesystemFAT12Directory
		(
			directoryParent,
			directoryEntryForSelf,
			directoryEntries
		);

		return returnValue;
	}

	directoryParentGoTo()
	{
		var filesystem = Globals.Instance.filesystem;
		filesystem.directoryCurrent = this.directoryParent;
		filesystem.domElementUpdate();
	}

	// dom

	domElementUpdate()
	{
		if (this.domElement == null)
		{
			var d = document;
			this.domElement = d.createElement("div");

			var divRoot = d.createElement("div");

			var labelName = d.createElement("label");
			labelName.innerHTML = 
				"Current Directory:"
				+ (
					this.directoryEntryForSelf == null 
					? "[root]"
					: this.directoryEntryForSelf.shortFileName
				);

			divRoot.appendChild(labelName);

			if (this.directoryEntryForSelf != null)
			{
				var buttonParent = d.createElement("button");
				buttonParent.innerHTML = "Up";
				buttonParent.onclick = this.directoryParentGoTo.bind(this);
				divRoot.appendChild(buttonParent);
			}

			this.domElement.appendChild(divRoot);

			for (var i = 0; i < this.entries.length; i++)
			{
				var entry = this.entries[i];
	
				this.domElement.appendChild
				(
					entry.domElementUpdate()
				);
			}
		}

		return this.domElement;
	}
}
