import React, { useState } from 'react';
import { Image, Layers, Binary, BarChart3, MessageSquare, Search, Pencil, ALargeSmall, ChevronDown } from 'lucide-react';

const FilterImageMockup = () => {
  const [openSections, setOpenSections] = useState({
    structures: true,
    graphemeDisplay: false,
    frequencies: false,
    syllables: false,
    search: true,
    graphemes: true,
    phonemes: true,
    imageFilter: true, // NEW
  });

  const [hasImage, setHasImage] = useState(null);

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const FilterSection = ({ title, icon, badge, isOpen, onToggle, children }) => (
    <div className="px-[22px] mb-2">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-2.5 group"
      >
        <div className="flex items-center gap-2.5">
          {icon}
          <span className="text-[13px] font-semibold text-gray-800">
            {title}
          </span>
          {badge > 0 && (
            <span className="bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="mt-1 mb-3">
          {children}
        </div>
      )}
    </div>
  );

  const FilterGroup = ({ label, variant }) => (
    <div className="px-[22px] mb-3 mt-4">
      <div className={`text-[10px] font-bold tracking-wider uppercase ${
        variant === 'primary' ? 'text-indigo-600' : 'text-orange-500'
      }`}>
        {label}
      </div>
      <div className="h-px bg-gray-200 mt-2" />
    </div>
  );

  const ImageFilterOption = ({ value, label, icon, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all ${
        isActive
          ? 'bg-indigo-50 border-2 border-indigo-500'
          : 'bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
        isActive
          ? 'border-indigo-500 bg-indigo-500'
          : 'border-gray-300 bg-white'
      }`}>
        <div className={`w-2 h-2 rounded-full bg-white transition-opacity ${
          isActive ? 'opacity-100' : 'opacity-0'
        }`} />
      </div>
      <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${
        value === true
          ? 'bg-green-100'
          : value === false
          ? 'bg-red-100'
          : 'bg-gray-100'
      }`}>
        {icon}
      </div>
      <span className={`text-sm font-medium ${
        isActive ? 'text-indigo-700 font-semibold' : 'text-gray-700'
      }`}>
        {label}
      </span>
    </button>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Filter Panel */}
      <aside className="w-[300px] min-w-[300px] h-full bg-white border-r border-gray-200 flex flex-col overflow-hidden shadow-lg">
        {/* Header */}
        <div className="px-[22px] pt-6 pb-2">
          <h2 className="font-bold text-lg text-gray-800 mb-[2px]">
            Filtres
          </h2>
          <p className="text-xs text-gray-500">
            Affinez votre recherche
          </p>
        </div>

        {/* Scrollable Sections */}
        <div className="flex-1 overflow-y-auto py-2 pb-6">

          {/* GROUP: FILTRES PRINCIPAUX */}
          <FilterGroup label="Filtres principaux" variant="primary" />

          {/* Structure syllabique */}
          <FilterSection
            title="Structures"
            icon={<Layers className="w-3.5 h-3.5 text-indigo-600" />}
            badge={2}
            isOpen={openSections.structures}
            onToggle={() => toggleSection('structures')}
          >
            <div className="space-y-1 text-xs text-gray-600">
              <div className="px-3 py-2 bg-indigo-50 rounded-lg">
                <span className="font-medium">✓ CV (consonne-voyelle)</span>
              </div>
              <div className="px-3 py-2 bg-indigo-50 rounded-lg">
                <span className="font-medium">✓ CVC (consonne-voyelle-consonne)</span>
              </div>
            </div>
          </FilterSection>

          {/* Complexité graphémique */}
          <FilterSection
            title="Complexité (G)"
            icon={<Binary className="w-3.5 h-3.5 text-indigo-600" />}
            badge={0}
            isOpen={openSections.graphemeDisplay}
            onToggle={() => toggleSection('graphemeDisplay')}
          >
            <div className="text-xs text-gray-500 px-3">
              Aucune sélection
            </div>
          </FilterSection>

          {/* Code appui lexical */}
          <FilterSection
            title="Code appui lexical"
            icon={<BarChart3 className="w-3.5 h-3.5 text-indigo-600" />}
            badge={0}
            isOpen={openSections.frequencies}
            onToggle={() => toggleSection('frequencies')}
          >
            <div className="flex flex-wrap gap-2 px-1">
              <button className="px-3 py-1.5 rounded-xl text-xs font-bold border-2 border-gray-200 text-gray-600 hover:border-gray-400">
                Très fréquent
              </button>
              <button className="px-3 py-1.5 rounded-xl text-xs font-bold border-2 border-gray-200 text-gray-600 hover:border-gray-400">
                Fréquent
              </button>
            </div>
          </FilterSection>

          {/* GROUP: FILTRES COMPLÉMENTAIRES */}
          <FilterGroup label="Filtres complémentaires" variant="secondary" />

          {/* Recherche */}
          <FilterSection
            title="Recherche"
            icon={<Search className="w-3.5 h-3.5 text-indigo-600" />}
            badge={0}
            isOpen={openSections.search}
            onToggle={() => toggleSection('search')}
          >
            <div className="px-1">
              <input
                type="text"
                placeholder="Rechercher un mot..."
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </FilterSection>

          {/* NEW: IMAGE FILTER - HIGHLIGHTED */}
          <div className="relative">
            {/* Highlight indicator */}
            <div className="absolute -left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-r-full" />
            <div className="bg-gradient-to-r from-emerald-50 to-transparent py-2">
              <FilterSection
                title="Image"
                icon={<Image className="w-3.5 h-3.5 text-emerald-600" />}
                badge={hasImage !== null ? 1 : 0}
                isOpen={openSections.imageFilter}
                onToggle={() => toggleSection('imageFilter')}
              >
                <div className="space-y-2 px-1">
                  <ImageFilterOption
                    value={true}
                    label="Avec image"
                    icon={<Image className="w-4 h-4 text-green-600" />}
                    isActive={hasImage === true}
                    onClick={() => setHasImage(hasImage === true ? null : true)}
                  />
                  <ImageFilterOption
                    value={false}
                    label="Sans image"
                    icon={<Image className="w-4 h-4 text-red-600" strokeWidth={1.5} />}
                    isActive={hasImage === false}
                    onClick={() => setHasImage(hasImage === false ? null : false)}
                  />
                  <ImageFilterOption
                    value={null}
                    label="Tous (indifférent)"
                    icon={<Image className="w-4 h-4 text-gray-400" />}
                    isActive={hasImage === null}
                    onClick={() => setHasImage(null)}
                  />
                </div>

                {hasImage !== null && (
                  <div className="mt-3 px-1">
                    <div className="bg-emerald-100 border-l-4 border-emerald-500 px-3 py-2 rounded-r-lg">
                      <p className="text-xs font-medium text-emerald-800">
                        ✓ Filtre appliqué : {hasImage ? 'Avec image' : 'Sans image'}
                      </p>
                    </div>
                  </div>
                )}
              </FilterSection>
            </div>
          </div>

          {/* Graphèmes */}
          <FilterSection
            title="Graphèmes"
            icon={<Pencil className="w-3.5 h-3.5 text-indigo-600" />}
            badge={0}
            isOpen={openSections.graphemes}
            onToggle={() => toggleSection('graphemes')}
          >
            <div className="px-1">
              <input
                type="text"
                placeholder="Saisir un graphème..."
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </FilterSection>

          {/* Phonèmes */}
          <FilterSection
            title="Phonèmes"
            icon={<ALargeSmall className="w-3.5 h-3.5 text-indigo-600" />}
            badge={0}
            isOpen={openSections.phonemes}
            onToggle={() => toggleSection('phonemes')}
          >
            <div className="px-1">
              <input
                type="text"
                placeholder="Saisir un phonème..."
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </FilterSection>

        </div>
      </aside>

      {/* Preview Panel */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-2xl bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Image className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Nouveau filtre : Image
              </h3>
              <p className="text-gray-600">
                Filtrez les mots selon la présence ou l'absence d'une image associée
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg">
              <h4 className="font-semibold text-emerald-900 mb-2 flex items-center gap-2">
                <span className="w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                Options disponibles
              </h4>
              <ul className="space-y-2 text-sm text-emerald-800">
                <li className="flex items-center gap-2">
                  <Image className="w-4 h-4 text-green-600" />
                  <strong>Avec image</strong> : Affiche uniquement les mots avec une illustration
                </li>
                <li className="flex items-center gap-2">
                  <Image className="w-4 h-4 text-red-600" />
                  <strong>Sans image</strong> : Affiche uniquement les mots sans illustration
                </li>
                <li className="flex items-center gap-2">
                  <Image className="w-4 h-4 text-gray-400" />
                  <strong>Tous (indifférent)</strong> : Affiche tous les mots (par défaut)
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <h4 className="font-semibold text-blue-900 mb-2">📍 Placement</h4>
              <p className="text-sm text-blue-800">
                Le filtre Image est placé dans la section <strong>"Filtres complémentaires"</strong>,
                après le filtre "Recherche" et avant "Graphèmes".
              </p>
            </div>

            <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
              <h4 className="font-semibold text-purple-900 mb-2">🎨 Design</h4>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Icône : <code className="bg-purple-100 px-1 rounded">Image</code> (Lucide)</li>
                <li>• Couleur accent : Émeraude (vert) pour se distinguer</li>
                <li>• Interaction : Options mutuellement exclusives</li>
                <li>• Badge : Affiche "1" quand un filtre est actif</li>
              </ul>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                💡 <strong>État actuel :</strong> {
                  hasImage === true ? 'Filtre "Avec image" activé' :
                  hasImage === false ? 'Filtre "Sans image" activé' :
                  'Aucun filtre image activé (par défaut)'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterImageMockup;