import { openDB, type DBSchema } from 'idb';
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
	};
}

let dbPromise: Promise<any>;

if (typeof window !== 'undefined') {
	dbPromise = openDB<OpenFableDB>(DB_NAME, DB_VERSION, {
		upgrade(db) {
			if (!db.objectStoreNames.contains(DB_STORES.REGISTRIES)) {
				db.createObjectStore(DB_STORES.REGISTRIES, { keyPath: 'url' });
			}
			if (!db.objectStoreNames.contains(DB_STORES.CHARACTERS)) {
				db.createObjectStore(DB_STORES.CHARACTERS, { keyPath: 'id' });
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

	async getRegistries(): Promise<(Registry & { url: string; added_at: number })[]> {
		const db = await dbPromise;
		return db.getAll(DB_STORES.REGISTRIES);
	},

	async removeRegistry(url: string): Promise<void> {
		const db = await dbPromise;
		const tx = db.transaction([DB_STORES.REGISTRIES, DB_STORES.CHARACTERS], 'readwrite');
		
		// Get all characters from this registry to delete them?
		// IndexedDB doesn't support "delete where" easily without index.
		// For now simple removal of registry.
		// Use cursor or getAll to find chars.
		// Ideally we need an index on registry_url for characters.
		
		await tx.objectStore(DB_STORES.REGISTRIES).delete(url);
		
		// TODO: Clean up characters. This requires an index.
		// For MVP, we might leave orphans or handle it later.
		
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
