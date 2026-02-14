import { db } from '$lib/db';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, url }) => {
    const { id } = params;
    const registryUrl = url.searchParams.get('registry');
    
    // 1. Try to get from local database
    let character = await db.getCharacter(id);
    
    // 2. If not found and we have a registry URL, fetch it on-the-fly
    if (!character && registryUrl) {
        try {
            const res = await fetch(registryUrl);
            if (res.ok) {
                const registry = await res.json();
                const char = registry.characters.find((c: any) => c.id === id);
                if (char) {
                    character = {
                        ...char,
                        registry_url: registryUrl
                    };
                }
            }
        } catch (e) {
            console.error('Failed to fetch character from registry on-the-fly:', e);
        }
    }
    
    if (!character) {
        throw error(404, 'Character not found');
    }
    
    return {
        character
    };
};
