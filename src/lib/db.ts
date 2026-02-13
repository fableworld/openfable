import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import { DB_NAME, DB_VERSION, DB_STORES } from './constants';
import type { Registry, Character } from './schemas';

interface OpenFableDB extends DBSchema {
	[DB_STORES.REGISTRIES]: {
		key: string; // URL
		value: Registry & { url: string; added_at: number };
	};
	[DB_STORES.CHARACTERS]: {
		key: string; // ID
		value: Character & { registry_url: string };
		indexes: { 'registry_url': string };
	};
}

let dbPromise: Promise<IDBPDatabase<OpenFableDB>>;

if (typeof window !== 'undefined') {
	dbPromise = openDB<OpenFableDB>(DB_NAME, DB_VERSION, {
		upgrade(db, oldVersion, newVersion, transaction) {
			if (!db.objectStoreNames.contains(DB_STORES.REGISTRIES)) {
				db.createObjectStore(DB_STORES.REGISTRIES, { keyPath: 'url' });
			}
			if (!db.objectStoreNames.contains(DB_STORES.CHARACTERS)) {
				const charStore = db.createObjectStore(DB_STORES.CHARACTERS, { keyPath: 'id' });
				charStore.createIndex('registry_url', 'registry_url');
			} else if (oldVersion < 2) {
				const charStore = transaction.objectStore(DB_STORES.CHARACTERS);
				if (!charStore.indexNames.contains('registry_url')) {
					charStore.createIndex('registry_url', 'registry_url');
				}
			}
		}
	});
}

export const db = {
	async addRegistry(url: string, registry: Registry): Promise<void> {
		const db = await dbPromise;
		const tx = db.transaction([DB_STORES.REGISTRIES, DB_STORES.CHARACTERS], 'readwrite');
		
		await tx.objectStore(DB_STORES.REGISTRIES).put({
			...registry,
			url,
			added_at: Date.now()
		});

		for (const char of registry.characters) {
			await tx.objectStore(DB_STORES.CHARACTERS).put({
				...char,
				registry_url: url
			});
		}

		await tx.done;
	},

	async addCharacters(url: string, characters: Character[]): Promise<void> {
		const db = await dbPromise;
		const tx = db.transaction(DB_STORES.CHARACTERS, 'readwrite');
		const charStore = tx.objectStore(DB_STORES.CHARACTERS);

		for (const char of characters) {
			await charStore.put({
				...char,
				registry_url: url
			});
		}

		await tx.done;
	},

	async getRegistries(): Promise<(Registry & { url: string; added_at: number })[]> {
		const db = await dbPromise;
		return db.getAll(DB_STORES.REGISTRIES);
	},

	async removeRegistry(url: string): Promise<void> {
		const db = await dbPromise;
		const tx = db.transaction([DB_STORES.REGISTRIES, DB_STORES.CHARACTERS], 'readwrite');
		
		const charStore = tx.objectStore(DB_STORES.CHARACTERS);
		const index = charStore.index('registry_url');
		let cursor = await index.openKeyCursor(IDBKeyRange.only(url));

		while (cursor) {
			await charStore.delete(cursor.primaryKey);
			cursor = await cursor.continue();
		}
		
		await tx.objectStore(DB_STORES.REGISTRIES).delete(url);
		
		await tx.done;
	},

	async getAllCharacters(): Promise<Character[]> {
		const db = await dbPromise;
		return db.getAll(DB_STORES.CHARACTERS);
	},
	
	async getCharacter(id: string): Promise<Character | undefined> {
		const db = await dbPromise;
		return db.get(DB_STORES.CHARACTERS, id);
	}
};
