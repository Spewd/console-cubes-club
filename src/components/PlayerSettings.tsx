import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Settings, RotateCcw } from 'lucide-react';
import { PlayerSettings as PlayerSettingsType, usePlayerSettings, KeyBindings } from '@/hooks/usePlayerSettings';
import { KeyboardMapper } from './KeyboardMapper';

interface PlayerSettingsProps {
  settings: PlayerSettingsType;
  updateSetting: <K extends keyof PlayerSettingsType>(key: K, value: PlayerSettingsType[K]) => void;
  updateKeyBinding: (action: keyof KeyBindings, key: string) => void;
  resetToDefaults: () => void;
  applyPreset: (preset: 'default' | 'competitive' | 'casual') => void;
}

export const PlayerSettingsDialog = ({
  settings,
  updateSetting,
  updateKeyBinding,
  resetToDefaults,
  applyPreset,
}: PlayerSettingsProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Player Settings
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="handling" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="handling">Handling</TabsTrigger>
            <TabsTrigger value="controls">Controls</TabsTrigger>
          </TabsList>
          
          <TabsContent value="handling" className="space-y-6 pt-4">
            {/* Presets */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Presets</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => applyPreset('default')}>
                  Default
                </Button>
                <Button variant="outline" size="sm" onClick={() => applyPreset('competitive')}>
                  Competitive
                </Button>
                <Button variant="outline" size="sm" onClick={() => applyPreset('casual')}>
                  Casual
                </Button>
              </div>
            </div>

            {/* DAS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="das">DAS (Delayed Auto Shift)</Label>
                <span className="text-sm text-muted-foreground font-mono">{settings.das}ms</span>
              </div>
              <Slider
                id="das"
                value={[settings.das]}
                onValueChange={([value]) => updateSetting('das', value)}
                min={0}
                max={300}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Initial delay before auto-repeat starts when holding a direction
              </p>
            </div>

            {/* ARR */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="arr">ARR (Auto Repeat Rate)</Label>
                <span className="text-sm text-muted-foreground font-mono">
                  {settings.arr === 0 ? 'Instant' : `${settings.arr}ms`}
                </span>
              </div>
              <Slider
                id="arr"
                value={[settings.arr]}
                onValueChange={([value]) => updateSetting('arr', value)}
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Speed of repeated movements (0 = instant)
              </p>
            </div>

            {/* DCD */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="dcd">DCD (DAS Cut Delay)</Label>
                <span className="text-sm text-muted-foreground font-mono">{settings.dcd}ms</span>
              </div>
              <Slider
                id="dcd"
                value={[settings.dcd]}
                onValueChange={([value]) => updateSetting('dcd', value)}
                min={0}
                max={50}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Delay when switching directions
              </p>
            </div>

            {/* SDF */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="sdf">SDF (Soft Drop Factor)</Label>
                <span className="text-sm text-muted-foreground font-mono">
                  {settings.sdf === 'instant' ? 'Instant' : `${settings.sdf}x`}
                </span>
              </div>
              <Slider
                id="sdf"
                value={[settings.sdf === 'instant' ? 41 : settings.sdf]}
                onValueChange={([value]) => updateSetting('sdf', value >= 41 ? 'instant' : value)}
                min={1}
                max={41}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Soft drop speed multiplier (41 = instant)
              </p>
            </div>

            <Button variant="outline" className="w-full" onClick={resetToDefaults}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset All to Defaults
            </Button>
          </TabsContent>
          
          <TabsContent value="controls" className="pt-4">
            <KeyboardMapper 
              keyBindings={settings.keyBindings} 
              onUpdateBinding={updateKeyBinding} 
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
