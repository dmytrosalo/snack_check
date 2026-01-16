import { User, Shirt, Crown, Glasses, Watch, Gem } from 'lucide-react';
import PainterlyFilter from './PainterlyFilter';

export const ITEMS = {
    1: { id: 1, name: 'White Tee', slot: 'body', icon: Shirt, color: 'white' },
    2: { id: 2, name: 'Blue Jeans', slot: 'bottom', icon: User, color: '#3b82f6' }, // Placeholder icon for pants
    3: { id: 3, name: 'Sneakers', slot: 'feet', icon: User, color: '#e5e7eb' },
    4: { id: 4, name: 'Cap', slot: 'head', icon: Crown, color: '#ef4444' },
    5: { id: 5, name: 'Shades', slot: 'face', icon: Glasses, color: '#1f2937' },
    6: { id: 6, name: 'Hoodie', slot: 'body', icon: Shirt, color: '#4b5563' },
    7: { id: 7, name: 'Shorts', slot: 'bottom', icon: User, color: '#f59e0b' },
    8: { id: 8, name: 'Gold Watch', slot: 'accessory', icon: Watch, color: '#fbbf24' },
    9: { id: 9, name: 'Jacket', slot: 'body', icon: Shirt, color: '#7c3aed' },
    10: { id: 10, name: 'Crown', slot: 'head', icon: Crown, color: '#fbbf24' }
};

export default function Avatar({ equipped, itemColors = {} }) {
    // Helper to get color: Custom or Default
    const getColor = (itemId) => itemColors[itemId] || ITEMS[itemId].color;

    // Simple "Paper Doll" using CSS composition
    return (
        <div className="relative w-64 h-96 mx-auto flex items-center justify-center overflow-hidden border-4 border-slate-700 bg-slate-900 shadow-2xl">
            <PainterlyFilter />

            {/* Background Texture */}
            <div
                className="absolute inset-0 bg-cover bg-center opacity-80 mix-blend-overlay"
                style={{ backgroundImage: 'url(/assets/backgrounds/thought_cabinet.png)' }}
            />

            {/* Noir Lighting Gradient */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-transparent to-orange-500/20 z-20 pointer-events-none" />

            {/* Base Body - Filtered */}
            <div className="absolute inset-0 flex items-center justify-center filter" style={{ filter: 'url(#painterly)' }}>
                {/* Character Scale Wrapper */}
                <div className="relative transform scale-125 translate-y-8">
                    {/* Character Base */}
                    <div className="relative z-10 flex flex-col items-center">
                        {/* Head */}
                        <div className="w-16 h-16 bg-amber-200 rounded-full relative mb-1 border-2 border-slate-900 overflow-hidden">
                            {/* Face Items */}
                            {equipped.face && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Glasses size={24} color={getColor(equipped.face)} fill={getColor(equipped.face)} />
                                </div>
                            )}
                            {/* Headgear */}
                            {equipped.head && (
                                <div className="absolute -top-3 left-0 w-full flex justify-center">
                                    <Crown size={24} color={getColor(equipped.head)} fill={getColor(equipped.head)} />
                                </div>
                            )}
                        </div>

                        {/* Torso */}
                        <div className="relative">
                            <div className="w-20 h-24 bg-slate-500 rounded-lg relative z-10">
                                {equipped.body && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-800 rounded-lg" style={{ backgroundColor: getColor(equipped.body) }}>
                                        <Shirt size={32} className="text-white/50" />
                                    </div>
                                )}
                            </div>

                            {/* Arms (Implied) */}
                            <div className="absolute -left-3 top-2 w-4 h-20 bg-amber-200 rounded-full transform rotate-12" />
                            <div className="absolute -right-3 top-2 w-4 h-20 bg-amber-200 rounded-full transform -rotate-12" />

                            {/* Accessory (Watch) */}
                            {equipped.accessory && (
                                <div className="absolute -right-4 top-14 bg-yellow-400 rounded-full p-1 z-20">
                                    <div className="w-3 h-3 bg-yellow-200 rounded-full animate-ping" />
                                </div>
                            )}
                        </div>

                        {/* Legs */}
                        <div className="flex gap-1 mt-1">
                            <div className="w-9 h-24 bg-slate-800 rounded-b-lg relative" style={{ backgroundColor: equipped.bottom ? getColor(equipped.bottom) : '#1e293b' }}>
                                {/* Feet */}
                                <div className="absolute bottom-0 w-full h-4 bg-slate-900 rounded-b-lg" style={{ backgroundColor: equipped.feet ? getColor(equipped.feet) : '#0f172a' }} />
                            </div>
                            <div className="w-9 h-24 bg-slate-800 rounded-b-lg relative" style={{ backgroundColor: equipped.bottom ? getColor(equipped.bottom) : '#1e293b' }}>
                                {/* Feet */}
                                <div className="absolute bottom-0 w-full h-4 bg-slate-900 rounded-b-lg" style={{ backgroundColor: equipped.feet ? getColor(equipped.feet) : '#0f172a' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Frame/Border Overlay */}
            <div className="absolute inset-0 border-[6px] border-slate-800/80 pointer-events-none z-30" />
        </div>
    );
}
