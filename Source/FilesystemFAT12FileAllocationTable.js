
class FilesystemFAT12FileAllocationTable
{
	constructor(entries)
	{
		this.entries = entries;
	}

	static BitsPerEntry = 12;

	static fromBytes(fatAsBytes)
	{
		var bitsPerEntry =
			FilesystemFAT12FileAllocationTable.BitsPerEntry;
		var numberOfEntries =
			fatAsBytes.length * 8 / bitsPerEntry;

		var bitStream = new BitStream(fatAsBytes);

		var entries = [];

		for (var i = 0; i < numberOfEntries; i++)
		{
			var entry = bitStream.readFAT12Entry();
			entries.push(entry);
		}

		var returnValue = new FilesystemFAT12FileAllocationTable
		(
			entries
		);

		return returnValue;
	}
}
