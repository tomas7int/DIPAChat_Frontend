import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/Common/Modal';
import { useChat } from '@/contexts/ChatContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface AITrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const providers = {
  openai: {
    name: 'OpenAI',
    models: [
      { value: 'gpt-4o', label: 'GPT-4o', description: 'Latest GPT-4 optimized model' },
      { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', description: 'Fast GPT-4 variant' },
      { value: 'gpt-4', label: 'GPT-4', description: 'Standard GPT-4' },
      { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', description: 'Fast and efficient' },
    ],
  },
  claude: {
    name: 'Claude (Anthropic)',
    models: [
      { value: 'claude-3.5-sonnet', label: 'Claude 3.5 Sonnet', description: 'Latest Claude model' },
      { value: 'claude-3-opus', label: 'Claude 3 Opus', description: 'Most capable Claude 3' },
      { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet', description: 'Balanced performance' },
      { value: 'claude-3-haiku', label: 'Claude 3 Haiku', description: 'Fast and efficient' },
    ],
  },
  google: {
    name: 'Google',
    models: [
      { value: 'gemini-pro', label: 'Gemini Pro', description: 'Google Gemini Pro' },
      { value: 'gemini-ultra', label: 'Gemini Ultra', description: 'Most capable Gemini' },
    ],
  },
};

const defaultAgents = [
  { id: 'filter', name: 'Filter Agent', role: 'Filters and preprocesses user queries', enabled: true },
  { id: 'search', name: 'Search Agent', role: 'Searches and retrieves relevant documents', enabled: true },
  { id: 'critic', name: 'Critic Agent', role: 'Validates and verifies response accuracy', enabled: true },
];

export const AITrainingModal: React.FC<AITrainingModalProps> = ({ isOpen, onClose }) => {
  const { aiPreferences, setAIPreferences } = useChat();
  const { t } = useLanguage();
  const [mode, setMode] = useState<'simple' | 'multi-agent'>(aiPreferences?.mode || 'simple');
  const [outputFormat, setOutputFormat] = useState(aiPreferences?.outputFormat || 'text');
  const [outputLanguage, setOutputLanguage] = useState(aiPreferences?.outputLanguage || 'en');
  const [customInstructions, setCustomInstructions] = useState(aiPreferences?.customInstructions || '');
  const [provider, setProvider] = useState<keyof typeof providers>(aiPreferences?.provider || 'openai');
  const [model, setModel] = useState(aiPreferences?.model || 'gpt-4o');
  const [agents, setAgents] = useState(aiPreferences?.agents || defaultAgents);

  useEffect(() => {
    if (aiPreferences) {
      setMode(aiPreferences.mode || 'simple');
      setOutputFormat(aiPreferences.outputFormat || 'text');
      setOutputLanguage(aiPreferences.outputLanguage || 'en');
      setCustomInstructions(aiPreferences.customInstructions || '');
      setProvider(aiPreferences.provider || 'openai');
      setModel(aiPreferences.model || 'gpt-4o');
      setAgents(aiPreferences.agents || defaultAgents);
    }
  }, [aiPreferences, isOpen]);

  // Reset model when provider changes
  useEffect(() => {
    const providerModels = providers[provider].models;
    if (providerModels.length > 0 && !providerModels.some(m => m.value === model)) {
      setModel(providerModels[0].value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider]);

  const handleSave = () => {
    setAIPreferences({
      mode,
      outputFormat,
      outputLanguage,
      customInstructions,
      provider,
      model,
      agents: mode === 'multi-agent' ? agents : undefined,
    });
    onClose();
  };

  const handleReset = () => {
    setMode('simple');
    setOutputFormat('text');
    setOutputLanguage('en');
    setCustomInstructions('');
    setProvider('openai');
    setModel('gpt-4o');
    setAgents(defaultAgents);
    setAIPreferences({
      mode: 'simple',
      outputFormat: 'text',
      outputLanguage: 'en',
      customInstructions: '',
      provider: 'openai',
      model: 'gpt-4o',
    });
  };

  const toggleAgent = (agentId: string) => {
    setAgents(agents.map(agent => 
      agent.id === agentId ? { ...agent, enabled: !agent.enabled } : agent
    ));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('trainAIPreferences')} size="xl">
      <div className="flex flex-col h-full min-h-0">
        <div className="space-y-4 flex-1 overflow-y-auto pr-2 min-h-0">
        {/* Mode Selection: Simple AI vs Multi-Agent */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            {t('aiMode')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setMode('simple')}
              className={cn(
                "p-3 rounded-lg border text-left transition-colors",
                mode === 'simple'
                  ? "bg-purple-500/20 border-purple-400/50 text-gray-100"
                  : "bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600"
              )}
            >
              <div className="font-medium mb-0.5 text-sm">{t('simpleAI')}</div>
              <div className="text-xs text-gray-400">{t('simpleAIDescription')}</div>
            </button>
            <button
              onClick={() => setMode('multi-agent')}
              className={cn(
                "p-3 rounded-lg border text-left transition-colors",
                mode === 'multi-agent'
                  ? "bg-purple-500/20 border-purple-400/50 text-gray-100"
                  : "bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600"
              )}
            >
              <div className="font-medium mb-0.5 text-sm">{t('multiAgent')}</div>
              <div className="text-xs text-gray-400">{t('multiAgentDescription')}</div>
            </button>
          </div>
        </div>

        {/* Multi-Agent Configuration */}
        {mode === 'multi-agent' && (
          <div className="space-y-3 p-3 bg-gray-900/50 border border-gray-800 rounded-lg">
            <label className="block text-sm font-medium text-gray-200 mb-2">
              {t('agentConfiguration')}
            </label>
            <div className="space-y-2">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-start justify-between p-2.5 bg-gray-900 border border-gray-800 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <input
                        type="checkbox"
                        checked={agent.enabled}
                        onChange={() => toggleAgent(agent.id)}
                        className="flex-shrink-0"
                        aria-label={`Toggle ${agent.name}`}
                      />
                      <span className="font-medium text-gray-200 text-sm">{agent.name}</span>
                    </div>
                    <p className="text-xs text-gray-400 ml-6">{agent.role}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              {t('agentThoughtsDescription')}
            </p>
          </div>
        )}

        {/* Simple AI Configuration - Only show when mode is simple */}
        {mode === 'simple' && (
          <>
            {/* Provider Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                {t('aiProvider')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(providers).map(([key, providerData]) => (
                  <button
                    key={key}
                    onClick={() => setProvider(key as keyof typeof providers)}
                    className={cn(
                      "p-3 rounded-lg border text-left transition-colors",
                      provider === key
                        ? "bg-blue-500/20 border-blue-400/50 text-gray-100"
                        : "bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600"
                    )}
                  >
                    <div className="font-medium mb-0.5 text-sm">{providerData.name}</div>
                    <div className="text-xs text-gray-400">{providerData.models.length} models available</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Model Selection */}
            {provider && (
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  {providers[provider].name} Models
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {providers[provider].models.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => setModel(m.value)}
                      className={cn(
                        "p-2.5 rounded-lg border text-left transition-colors",
                        model === m.value
                          ? "bg-indigo-500/20 border-indigo-400/50 text-gray-100"
                          : "bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600"
                      )}
                    >
                      <div className="font-medium mb-0.5 text-sm">{m.label}</div>
                      <div className="text-xs text-gray-400">{m.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Output Format */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                {t('outputFormat')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'text', label: t('plainText'), description: t('plainTextDescription') },
                  { value: 'table', label: t('table'), description: t('tableDescription') },
                  { value: 'list', label: t('list'), description: t('listDescription') },
                  { value: 'json', label: t('json'), description: t('jsonDescription') },
                ].map((format) => (
                  <button
                    key={format.value}
                    onClick={() => setOutputFormat(format.value)}
                    className={cn(
                      "p-3 rounded-lg border text-left transition-colors",
                      outputFormat === format.value
                        ? "bg-pink-500/20 border-pink-400/50 text-gray-100"
                        : "bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600"
                    )}
                  >
                    <div className="font-medium mb-0.5 text-sm">{format.label}</div>
                    <div className="text-xs text-gray-400">{format.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Output Language */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                {t('outputLanguage')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'en', label: t('english'), flag: '🇺🇸' },
                  { value: 'lt', label: t('lithuanian'), flag: '🇱🇹' },
                ].map((lang) => (
                  <button
                    key={lang.value}
                    onClick={() => setOutputLanguage(lang.value)}
                    className={cn(
                      "p-3 rounded-lg border text-left transition-colors flex items-center gap-2",
                      outputLanguage === lang.value
                        ? "bg-teal-500/20 border-teal-400/50 text-gray-100"
                        : "bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600"
                    )}
                  >
                    <span className="text-xl">{lang.flag}</span>
                    <span className="font-medium text-sm">{lang.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                {t('customInstructions')}
              </label>
              <textarea
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder={t('customInstructionsPlaceholder')}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 resize-none text-sm"
                rows={3}
              />
              <p className="mt-1.5 text-xs text-gray-400">
                {t('customInstructionsHelper')}
              </p>
            </div>
          </>
        )}
        </div>
        
        {/* Actions - Fixed Footer */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-800 flex-shrink-0">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
          >
            {t('resetToDefault')}
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-300 hover:text-gray-100 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm bg-gray-800 text-gray-100 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors"
            >
              {t('savePreferences')}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

