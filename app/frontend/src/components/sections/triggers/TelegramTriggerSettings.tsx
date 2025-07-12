// ⚠️ CRITICAL SECURITY WARNING ⚠️
// This component currently has NO user authentication!
// Any user can modify any agent's Telegram triggers.
// TODO: Add proper user authentication and authorization checks
// before allowing trigger modifications.

import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

import type { Agent } from '@/types/index';
import { Dispatch, SetStateAction } from 'react';
import { SERVER_URL } from '@/config/config';

interface TelegramTriggerSettingsProps {
  agent: Agent;
  connected: Record<string, boolean>;
  setConnected: Dispatch<SetStateAction<Record<string, boolean>>>;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  onStatusChange?: () => void;
}

export default function TelegramTriggerSettings({
  agent,
  connected,
  setConnected,
  loading,
  setLoading,
  onStatusChange,
}: TelegramTriggerSettingsProps) {
  const [shouldAnswerEnabled, setShouldAnswerEnabled] = useState(false);
  const [shouldAnswerInstruction, setShouldAnswerInstruction] = useState('');
  const [telegramTrigger, setTelegramTrigger] = useState<any>(null);
  // Secrets are now managed in backend via .env

  // Load telegram trigger
  useEffect(() => {
    if (!agent?.id) return;

    const loadData = async () => {
      try {
        // Load triggers
        const triggersResponse = await fetch(
          `${SERVER_URL}/api/triggers?agentId=${agent.id}`,
        );
        if (triggersResponse.ok) {
          const triggersData = await triggersResponse.json();
          const telegramTrigger = triggersData.triggers?.find(
            (t: any) => t.type === 'telegram',
          );
          setTelegramTrigger(telegramTrigger);

          if (telegramTrigger) {
            setShouldAnswerEnabled(
              telegramTrigger.config.shouldAnswer?.enabled || false,
            );
            setShouldAnswerInstruction(
              telegramTrigger.config.shouldAnswer?.instruction || '',
            );
            // Update connected state to reflect current trigger status
            setConnected((prev) => ({
              ...prev,
              Telegram: telegramTrigger.enabled,
            }));
          }
        }
      } catch (error) {
        console.error('Error loading telegram data:', error);
      }
    };

    loadData();
  }, [agent?.id]);

  // Secrets check removed - handled in backend

  const saveTriggerConfig = async (
    enabled?: boolean,
    shouldAnswerEnabledOverride?: boolean,
  ) => {
    if (!agent?.id) {
      toast.error('No agent selected');
      return false;
    }

    try {
      const triggerData = {
        id: telegramTrigger?.id,
        agent_id: agent.id,
        type: 'telegram',
        enabled:
          enabled !== undefined ? enabled : connected['Telegram'] || false,
        config: {
          shouldAnswer: {
            enabled:
              shouldAnswerEnabledOverride !== undefined
                ? shouldAnswerEnabledOverride
                : shouldAnswerEnabled,
            instruction: shouldAnswerInstruction,
          },
          // Secrets managed in backend
        },
      };

      const response = await fetch(`${SERVER_URL}/api/triggers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(triggerData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update trigger');
      }

      // Refresh trigger state from database to ensure UI is in sync
      const triggersResponse = await fetch(
        `${SERVER_URL}/api/triggers?agentId=${agent.id}`,
      );
      if (triggersResponse.ok) {
        const triggersData = await triggersResponse.json();
        const updatedTelegramTrigger = triggersData.triggers?.find(
          (t: any) => t.type === 'telegram',
        );
        if (updatedTelegramTrigger) {
          setTelegramTrigger(updatedTelegramTrigger);
        }
      }

      return true;
    } catch (error) {
      console.error('Error saving trigger config:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await saveTriggerConfig();
      toast.success('Telegram settings saved successfully');
    } catch (error) {
      toast.error('Failed to save Telegram settings');
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTelegramSwitch = async (checked: boolean) => {
    console.log('🔄 handleTelegramSwitch called with:', checked);

    // Secrets validation removed - handled in backend

    console.log('⏳ Starting telegram switch operation...');
    setLoading(true);
    try {
      await saveTriggerConfig(checked);

      // Notify parent to refresh both trigger and bot status
      onStatusChange?.();

      console.log('🎉 Operation completed successfully');
      toast.success(
        `Telegram ${checked ? 'enabled' : 'disabled'} successfully`,
      );
    } catch (error) {
      console.error('❌ Error in handleTelegramSwitch:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to update Telegram status',
      );
    } finally {
      console.log('🏁 Setting loading to false');
      setLoading(false);
    }
  };

  const handleShouldAnswerSwitch = async (checked: boolean) => {
    setShouldAnswerEnabled(checked);

    // Auto-save when should answer filter is toggled
    try {
      await saveTriggerConfig(undefined, checked);
      toast.success('Should answer filter updated successfully');
    } catch (error) {
      toast.error('Failed to update should answer filter');
      console.error('Error updating should answer filter:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Toggle */}
      <div className="flex items-center gap-4">
        <Switch
          id="telegram-enabled"
          checked={connected['Telegram'] || false}
          onCheckedChange={handleTelegramSwitch}
          disabled={loading}
        />
        <Label htmlFor="telegram-enabled" className="text-sm text-slate-200">
          {connected['Telegram'] ? 'Enabled' : 'Disabled'}
        </Label>

      </div>

      {/* Telegram secrets are now managed in backend via .env */}

      {/* Should Answer Filter */}
      <Card className="bg-slate-800 border-slate-600">
        <CardHeader>
          <CardTitle className="text-slate-100">Should Answer Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-400">
            Configure custom rules for when the bot should respond to messages.
          </p>

          <div className="flex items-center space-x-2">
            <Switch
              id="shouldAnswer"
              checked={shouldAnswerEnabled}
              onCheckedChange={handleShouldAnswerSwitch}
            />
            <Label htmlFor="shouldAnswer" className="text-slate-200">Enable should answer filter</Label>
          </div>

          {shouldAnswerEnabled && (
            <div className="space-y-2">
              <Label htmlFor="shouldAnswerInstruction" className="text-slate-200">
                Filter instruction
              </Label>
              <Textarea
                id="shouldAnswerInstruction"
                placeholder="Example: Only respond to messages about crypto trading, market analysis, or when someone asks about buying/selling cryptocurrencies. Ignore general chat and off-topic discussions."
                value={shouldAnswerInstruction}
                onChange={(e) => setShouldAnswerInstruction(e.target.value)}
                rows={4}
                className="bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400"
              />
              <p className="text-xs text-slate-400">
                Describe when the bot should respond to messages. Be specific
                about the topics or types of messages you want the bot to
                handle.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button
        type="button"
        onClick={handleSave}
        disabled={loading}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white border-0"
      >
        {loading ? 'Saving...' : 'Save Settings'}
      </Button>
    </div>
  );
}