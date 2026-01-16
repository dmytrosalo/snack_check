import { useState } from 'react';
import { useAppStore } from '../stores/appStore';
import Avatar, { ITEMS } from './Avatar';
import { X, Lock, Check, Palette } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const PALETTE = [
    '#3b82f6', // blue
    '#6366f1', // indigo
    '#8b5cf6', // violet
    '#a855f7', // purple (psyche)
    '#d946ef', // fuchsia
    '#ec4899', // pink
    '#f43f5e', // rose
    '#1f2937', // gray-800
    '#000000', // black
    '#ffffff', // white
];

export default function AvatarScreen({ onClose }) {
    const { unlockedItems, equippedItems, equipItem, itemColors, setItemColor } = useAppStore();
    const { t } = useTranslation();
    const [selectedItemForColor, setSelectedItemForColor] = useState(null);


    const handleEquip = (item) => {
        if (!unlockedItems.includes(item.id)) return;

        // Toggle logic: If already equipped, unequip it
        if (equippedItems[item.slot] === item.id) {
            equipItem(item.slot, null);
            setSelectedItemForColor(null);
        } else {
            equipItem(item.slot, item.id);
            // Open color picker for the newly equipped item
            setSelectedItemForColor(item.id);
        }
    };

    const handleColorSelect = (color) => {
        if (selectedItemForColor) {
            setItemColor(selectedItemForColor, color);
        }
    };

    const getSlotItem = (slot) => {
        const id = equippedItems[slot];
        return id ? ITEMS[id] : null;
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900 text-slate-200 overflow-y-auto font-serif">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-700 sticky top-0 z-10">
                <h2 className="text-2xl font-bold uppercase tracking-widest text-slate-400 italic">
                    {t('avatar.title')}
                </h2>
                <button
                    onClick={onClose}
                    className="p-2 border border-slate-600 hover:bg-slate-800 transition-colors rounded-sm"
                >
                    <X size={24} />
                </button>
            </div>

            <div className="max-w-md mx-auto p-6 space-y-8">
                {/* Avatar Display - Portrait Style */}
                <div className="relative">
                    <div className="absolute -inset-1 bg-slate-800 blur-sm"></div>
                    <Avatar equipped={equippedItems} itemColors={itemColors} />
                </div>

                {/* Color Palette (Dynamic) - Minimalist */}
                {selectedItemForColor && (
                    <div className="bg-slate-800/90 p-4 border border-slate-600 animate-slide-up shadow-lg">
                        <div className="flex items-center gap-2 mb-3 border-b border-slate-700 pb-2">
                            <Palette size={16} className="text-slate-400" />
                            <span className="text-sm font-bold uppercase tracking-wider text-slate-400">
                                PIGMENT: <span className="text-white italic">{ITEMS[selectedItemForColor].name}</span>
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {PALETTE.map(color => (
                                <button
                                    key={color}
                                    onClick={() => handleColorSelect(color)}
                                    className={`w-8 h-8 rounded-none border border-slate-500 transition-transform hover:scale-105 ${itemColors[selectedItemForColor] === color ? 'ring-2 ring-white border-white scale-105' : ''}`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Inventory Grid */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 border-b border-slate-700 pb-1">{t('avatar.wardrobe')}</h3>

                    <div className="grid grid-cols-4 gap-3">
                        {Object.values(ITEMS).map((item) => {
                            const isUnlocked = unlockedItems.includes(item.id);
                            const isEquipped = equippedItems[item.slot] === item.id;

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleEquip(item)}
                                    disabled={!isUnlocked}
                                    className={`
                relative aspect-square p-2 flex items-center justify-center transition-all border
                ${isUnlocked
                                            ? 'bg-slate-800 hover:bg-slate-700 border-slate-600'
                                            : 'bg-slate-900 border-slate-800 opacity-30 cursor-not-allowed grayscale'
                                        }
                ${isEquipped ? 'ring-1 ring-orange-500/50 border-orange-500' : ''}
              `}
                                >
                                    {isUnlocked ? (
                                        <div className="text-center">
                                            <item.icon size={24} color={itemColors[item.id] || item.color} className="mx-auto mb-1" />
                                            {/* <span className="text-[10px] text-slate-400 leading-none">{item.name}</span> */}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-1">
                                            <Lock size={20} className="text-slate-600" />
                                            <span className="text-[10px] font-bold text-slate-600">
                                                {/* Calculate unlock requirement: Level * 10 logs */}
                                                {item.id * 10} Logs
                                            </span>
                                        </div>
                                    )}

                                    {isEquipped && (
                                        <div className="absolute top-0 right-0 p-0.5 bg-orange-500">
                                            <Check size={8} className="text-slate-900" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
