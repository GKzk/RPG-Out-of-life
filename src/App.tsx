import React, { useState } from 'react';
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

type ActiveTab = 'character' | 'skills' | 'survival' | 'inventory' | 'combat' | 'explorer' | 'lore' | 'village_map';

const MainAppContent: React.FC = () => {
  const { character, combatState, pendingFeatChoices, isPrologueActive, completePrologue } = useGame();
  const [activeTab, setActiveTab] = useState<ActiveTab>('character');

  // Switch tab automatically when combat starts
  React.useEffect(() => {
    if (combatState.inCombat) {
      setActiveTab('combat');
    } else if (pendingFeatChoices > 0) {
      setActiveTab('character');
    }
  }, [combatState.inCombat, pendingFeatChoices]);

  if (!character) {
    return <CharacterCreation />;
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-amber-300 font-mono pb-48 selection:bg-amber-500 selection:text-neutral-950">
      {isPrologueActive && <PrologueSequenceModal onComplete={completePrologue} />}

      <HeaderNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="py-6">
        {activeTab === 'character' && <CharacterSheet />}
        {activeTab === 'skills' && <SkillsView />}
        {activeTab === 'survival' && <SurvivalView />}
        {activeTab === 'inventory' && <InventoryView />}
        {activeTab === 'combat' && <CombatArena />}
        {activeTab === 'village_map' && <VillageTacticalMap />}
        {activeTab === 'explorer' && <WastelandExplorer />}
        {activeTab === 'lore' && <CanonLoreView />}
      </main>

      <CombatLogConsole />
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
