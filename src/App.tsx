import React, { useState, useEffect } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { HeaderNav } from './components/HeaderNav';
import { CharacterCreation } from './components/CharacterCreation';
import { CharacterSheet } from './components/CharacterSheet';
import { SkillsView } from './components/SkillsView';
import { SurvivalView } from './components/SurvivalView';
import { InventoryView } from './components/InventoryView';
import { CombatArena } from './components/CombatArena';
import { WastelandExplorer } from './components/WastelandExplorer';
import { CombatLogConsole } from './components/CombatLogConsole';
import { PrologueSequenceModal } from './components/PrologueSequenceModal';
import { CanonLoreView } from './components/CanonLoreView';
import { VillageTacticalMap } from './components/visuals/VillageTacticalMap';
import { FalloutBottomHUD } from './components/hud/FalloutBottomHUD';
import { InventoryModal } from './components/modals/InventoryModal';
import { CharacterSheetModal } from './components/modals/CharacterSheetModal';
import { RadialWorldMapModal } from './components/visuals/RadialWorldMapModal';
import { JournalModal } from './components/modals/JournalModal';
import { SketchGalleryModal } from './components/visuals/SketchGalleryModal';
import { CompanionCommandPanel } from './components/visuals/CompanionCommandPanel';
import { PET_DEFINITIONS } from './data/pets';
import { X, Dog } from 'lucide-react';

type ActiveTab = 'village_map' | 'character' | 'skills' | 'survival' | 'inventory' | 'combat' | 'explorer' | 'lore';

const MainAppContent: React.FC = () => {
  const {
    character,
    combatState,
    pendingFeatChoices,
    isPrologueActive,
    completePrologue,
    startCombatEncounter,
  } = useGame();

  // The game starts directly on the visual tactical map with the hero and companion
  const [activeTab, setActiveTab] = useState<ActiveTab>('village_map');

  // Fallout Modals state
  const [showInventoryModal, setShowInventoryModal] = useState<boolean>(false);
  const [showStatsModal, setShowStatsModal] = useState<boolean>(false);
  const [showMapModal, setShowMapModal] = useState<boolean>(false);
  const [showJournalModal, setShowJournalModal] = useState<boolean>(false);
  const [showGalleryModal, setShowGalleryModal] = useState<boolean>(false);
  const [showCompanionModal, setShowCompanionModal] = useState<boolean>(false);

  // Switch tab automatically when combat starts
  useEffect(() => {
    if (combatState.inCombat) {
      setActiveTab('combat');
    } else if (pendingFeatChoices > 0) {
      setShowStatsModal(true);
    }
  }, [combatState.inCombat, pendingFeatChoices]);

  // Global hotkeys (I for inventory, C for character, M for map, J for journal, G for gallery)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger hotkeys if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'Escape') {
        setShowInventoryModal(false);
        setShowStatsModal(false);
        setShowMapModal(false);
        setShowJournalModal(false);
        setShowGalleryModal(false);
        setShowCompanionModal(false);
        return;
      }

      const key = e.key.toLowerCase();
      if (key === 'i' || key === 'ш') {
        e.preventDefault();
        setShowInventoryModal((prev) => !prev);
      } else if (key === 'c' || key === 'с') {
        e.preventDefault();
        setShowStatsModal((prev) => !prev);
      } else if (key === 'm' || key === 'ь') {
        e.preventDefault();
        setShowMapModal((prev) => !prev);
      } else if (key === 'j' || key === 'о') {
        e.preventDefault();
        setShowJournalModal((prev) => !prev);
      } else if (key === 'g' || key === 'п') {
        e.preventDefault();
        setShowGalleryModal((prev) => !prev);
      } else if (key === 'p' || key === 'з') {
        e.preventDefault();
        setShowCompanionModal((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!character) {
    return <CharacterCreation />;
  }

  const selectedPet = PET_DEFINITIONS.find((p) => p.id === character.petId) || PET_DEFINITIONS[0];

  return (
    <div className="min-h-screen bg-neutral-950 text-amber-300 font-mono pb-24 selection:bg-amber-500 selection:text-neutral-950">
      {/* Optional Prologue Modal */}
      {isPrologueActive && <PrologueSequenceModal onComplete={completePrologue} />}

      {/* Top Header Navigation */}
      <HeaderNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main View Area */}
      <main className="py-4">
        {activeTab === 'village_map' && <VillageTacticalMap />}
        {activeTab === 'character' && <CharacterSheet />}
        {activeTab === 'skills' && <SkillsView />}
        {activeTab === 'survival' && <SurvivalView />}
        {activeTab === 'inventory' && <InventoryView />}
        {activeTab === 'combat' && <CombatArena />}
        {activeTab === 'explorer' && <WastelandExplorer />}
        {activeTab === 'lore' && <CanonLoreView />}
      </main>

      {/* Fixed Event & VATS Terminal Console */}
      <CombatLogConsole />

      {/* Retro Fallout 1/2 Bottom HUD Bar */}
      <FalloutBottomHUD
        onOpenInventory={() => setShowInventoryModal(true)}
        onOpenStats={() => setShowStatsModal(true)}
        onOpenMap={() => setShowMapModal(true)}
        onOpenJournal={() => setShowJournalModal(true)}
        onOpenCompanion={() => setShowCompanionModal(true)}
        onOpenGallery={() => setShowGalleryModal(true)}
        onStartCombat={() => {
          if (activeTab !== 'combat') {
            setActiveTab('combat');
          }
          startCombatEncounter();
        }}
      />

      {/* ================= MODAL MENUS ================= */}
      {/* 1. ИНВ - Inventory & Modular Paperdoll Modal */}
      {showInventoryModal && (
        <InventoryModal onClose={() => setShowInventoryModal(false)} />
      )}

      {/* 2. СТАТ - Character Sheet & Stats Modal (with customize tab) */}
      {showStatsModal && (
        <CharacterSheetModal onClose={() => setShowStatsModal(false)} />
      )}

      {/* 3. КАРТА - Radial World Map Modal */}
      {showMapModal && (
        <RadialWorldMapModal
          currentSectorId="village_hub"
          onSelectSector={() => {
            setShowMapModal(false);
            setActiveTab('village_map');
          }}
          onClose={() => setShowMapModal(false)}
        />
      )}

      {/* 4. ЖУРНАЛ - Journal, Lore & Objectives Modal */}
      {showJournalModal && (
        <JournalModal onClose={() => setShowJournalModal(false)} />
      )}

      {/* 5. СКЕТЧИ - Visual Sketches & Character Gallery */}
      {showGalleryModal && (
        <SketchGalleryModal
          character={character}
          onClose={() => setShowGalleryModal(false)}
        />
      )}

      {/* 6. СПУТНИК - Companion Command Quick Modal */}
      {showCompanionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-stone-950 border-2 border-amber-600/70 rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-800">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Dog className="w-5 h-5" />
                <h3 className="text-sm uppercase tracking-wider">
                  КОМАНДЫ СПУТНИКУ: {selectedPet.nameRu}
                </h3>
              </div>
              <button
                onClick={() => setShowCompanionModal(false)}
                className="p-1 rounded bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <CompanionCommandPanel
              pet={selectedPet}
              onExecuteCommand={() => {
                setShowCompanionModal(false);
              }}
              scoutRevealedTurns={0}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <GameProvider>
      <MainAppContent />
    </GameProvider>
  );
}
