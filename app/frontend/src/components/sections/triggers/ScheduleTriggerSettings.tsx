import type { Agent } from '@/types/index';
import { Dispatch, SetStateAction, useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { SERVER_URL } from '@/config/config'

interface ScheduleTriggerSettingsProps {
  agent: Agent;
  connected: Record<string, boolean>;
  setConnected: Dispatch<SetStateAction<Record<string, boolean>>>;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  onTriggerSaved?: () => void;
}

export default function ScheduleTriggerSettings({
  agent,
  setConnected,
  loading,
  setLoading,
  onTriggerSaved,
}: ScheduleTriggerSettingsProps) {
  const [enabled, setEnabled] = useState(false);
  const [schedule, setSchedule] = useState<string>('');
  const [timezone, setTimezone] = useState<string>('');
  const [message, setMessage] = useState('');
  const [existingTriggers, setExistingTriggers] = useState<any[]>([]);
  const [fetchingTriggers, setFetchingTriggers] = useState(false);

  // Secrets are now managed in backend via .env

  // Secrets loading removed - handled in backend

  // Load existing triggers
  useEffect(() => {
    if (!agent?.id) return;

    const loadExistingTriggers = async () => {
      setFetchingTriggers(true);
      try {
        const response = await fetch(
          `${SERVER_URL}/api/triggers?agentId=${agent.id}`,
        );
        if (response.ok) {
          const data = await response.json();
          const scheduleTriggersData =
            data.triggers?.filter((t: any) => t.type === 'scheduled') || [];
          // Transform the generic trigger format to the expected schedule format
          const transformedTriggers = scheduleTriggersData.map((t: any) => ({
            id: t.id,
            agent_id: t.agent_id,
            enabled: t.enabled,
            message: t.config.message,
            schedule: t.config.schedule,
            timezone: t.config.timezone,
            secrets: t.config.secrets || {},
          }));
          setExistingTriggers(transformedTriggers);
        }
      } catch (error) {
        console.error('Error loading existing triggers:', error);
      } finally {
        setFetchingTriggers(false);
      }
    };

    loadExistingTriggers();
  }, [agent?.id]);

  const resetForm = () => {
    setEnabled(false);
    setSchedule('0 10 * * *');
    setTimezone('Europe/London');
    setMessage('');
  };

  // Secrets validation removed - handled in backend

  // Dynamic toggle for existing triggers
  const handleToggleExistingTrigger = async (
    trigger: any,
    enabled: boolean,
  ) => {
    try {
      console.log(
        `🔄 [ScheduleTrigger] Toggling trigger ${trigger.id} to ${enabled ? 'enabled' : 'disabled'}`,
      );
      const response = await fetch(`${SERVER_URL}/api/triggers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: trigger.id,
          agent_id: trigger.agent_id,
          type: 'scheduled',
          enabled,
          config: {
            schedule: trigger.schedule,
            timezone: trigger.timezone,
            message: trigger.message,
            secrets: trigger.secrets || {},
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update trigger');
      }

      // Update local state
      setExistingTriggers((prev) =>
        prev.map((t) => (t.id === trigger.id ? { ...t, enabled } : t)),
      );

      toast.success(`Trigger ${enabled ? 'enabled' : 'disabled'} successfully`);
      console.log(
        `✅ [ScheduleTrigger] Successfully toggled trigger ${trigger.id}`,
      );
    } catch (error) {
      console.error('❌ [ScheduleTrigger] Error toggling trigger:', error);
      toast.error('Failed to update trigger');
    }
  };

  // Delete existing trigger
  const handleDeleteExistingTrigger = async (trigger: any) => {
    try {
      console.log(`🗑️ [ScheduleTrigger] Deleting trigger ${trigger.id}`);

      const response = await fetch(`${SERVER_URL}/api/triggers`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: trigger.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete trigger');
      }

      // Update local state
      setExistingTriggers((prev) => prev.filter((t) => t.id !== trigger.id));

      toast.success('Trigger deleted successfully');
      console.log(
        `✅ [ScheduleTrigger] Successfully deleted trigger ${trigger.id}`,
      );
    } catch (error) {
      console.error('❌ [ScheduleTrigger] Error deleting trigger:', error);
      toast.error('Failed to delete trigger');
    }
  };

  const handleSave = async () => {
    if (!agent?.id) return;

    setLoading(true);
    try {
      // Secrets validation removed - handled in backend

      const triggerConfig = {
        agent_id: agent.id,
        type: 'scheduled',
        enabled: true,
        config: {
          schedule,
          timezone,
          message,
          // Secrets managed in backend
        },
      };

      console.log(
        '📤 [ScheduleTrigger] Sending trigger config:',
        triggerConfig,
      );

      const response = await fetch(`${SERVER_URL}/api/triggers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(triggerConfig),
      });

      console.log('📥 [ScheduleTrigger] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [ScheduleTrigger] Save failed:', errorData);
        throw new Error('API error');
      }

      const responseData = await response.json();
      console.log('✅ [ScheduleTrigger] Save successful:', responseData);

      // Refresh the existing triggers list
      const refreshResponse = await fetch(
        `${SERVER_URL}/api/triggers?agentId=${agent.id}`,
      );
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        const scheduleTriggersData =
          data.triggers?.filter((t: any) => t.type === 'scheduled') || [];
        const transformedTriggers = scheduleTriggersData.map((t: any) => ({
          id: t.id,
          agent_id: t.agent_id,
          enabled: t.enabled,
          message: t.config.message,
          schedule: t.config.schedule,
          timezone: t.config.timezone,
          secrets: t.config.secrets || {},
        }));
        setExistingTriggers(transformedTriggers);
      }

      toast.success('Schedule trigger saved!');
      setConnected((prev) => ({ ...prev, Schedule: true }));
      resetForm();
      if (typeof onTriggerSaved === 'function') onTriggerSaved();
    } catch (err) {
      console.error('❌ [ScheduleTrigger] Save error:', err);
      toast.error('Failed to save schedule trigger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Existing Scheduled Triggers */}
      <Card className="bg-slate-800 border-slate-600">
        <CardHeader>
          <CardTitle className="text-slate-100">Existing Scheduled Triggers</CardTitle>
        </CardHeader>
        <CardContent>
          {fetchingTriggers ? (
            <div className="text-slate-400">Loading triggers...</div>
          ) : existingTriggers.length === 0 ? (
            <div className="text-slate-400">
              No scheduled triggers found.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {existingTriggers.map((trigger) => (
                <div
                  key={trigger.id}
                  className="flex items-center gap-4 p-3 bg-slate-700 border border-slate-600 rounded-lg"
                >
                  <span
                    className={`inline-block w-3 h-3 rounded-full flex-shrink-0 ${
                      trigger.enabled ? 'bg-green-500' : 'bg-orange-500'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-sm text-slate-100">{trigger.schedule}</div>
                    <div className="text-sm text-slate-300 truncate">
                      {trigger.message}
                    </div>
                    <div className="text-xs text-slate-400">
                      Timezone: {trigger.timezone}
                    </div>
                  </div>
                  <Switch
                    checked={trigger.enabled}
                    onCheckedChange={(checked) =>
                      handleToggleExistingTrigger(trigger, checked)
                    }
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="bg-red-600 hover:bg-red-700 text-white border-0"
                    onClick={() => handleDeleteExistingTrigger(trigger)}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Create New Scheduled Trigger */}
      <Card className="bg-slate-800 border-slate-600">
        <CardHeader>
          <CardTitle className="text-slate-100">Create New Scheduled Trigger</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <Switch
                id="schedule-switch"
                checked={enabled}
                onCheckedChange={setEnabled}
                disabled={loading}
              />
              <Label htmlFor="schedule-switch" className="text-sm text-slate-200">
                {enabled ? 'Enabled' : 'Disabled'}
              </Label>
            </div>

            {/* Secrets are now managed in backend via .env */}

            <div className="flex flex-col gap-2">
              <Label htmlFor="schedule-hour" className="text-slate-200">Schedule (cron expression)</Label>
              <Input
                id="schedule-hour"
                type="text"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                placeholder="0 10 * * * (every day at 10:00)"
                disabled={loading}
                className="bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="schedule-minute" className="text-slate-200">Timezone</Label>
              <Input
                id="schedule-minute"
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="Europe/London"
                disabled={loading}
                className="bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="schedule-message" className="text-slate-200">Message to send</Label>
              <Textarea
                id="schedule-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={loading}
                className="bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400"
              />
            </div>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700 text-white border-0"
            >
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}