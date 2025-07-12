import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Twitter, MessageSquare, Youtube, Instagram } from "lucide-react"

interface CredentialsModalProps {
  isOpen: boolean
  onClose: () => void
  platform: string
  onSave: (platform: string, credentials: Record<string, string>) => void
  currentCredentials?: Record<string, string>
}

const platformConfig = {
  Twitter: {
    icon: Twitter,
    color: "text-blue-400",
    fields: [
      { key: "username", label: "Twitter Username", placeholder: "@your_username" }
    ]
  },
  Telegram: {
    icon: MessageSquare,
    color: "text-blue-400",
    fields: [
      { key: "channelId", label: "Telegram Channel ID", placeholder: "@your_channel" }
    ]
  },
  YouTube: {
    icon: Youtube,
    color: "text-red-400",
    fields: [
      { key: "channelUrl", label: "YouTube Channel URL", placeholder: "https://youtube.com/@your_channel" }
    ]
  },
  Instagram: {
    icon: Instagram,
    color: "text-pink-400",
    fields: [
      { key: "username", label: "Instagram Username", placeholder: "@your_username" }
    ]
  }
}

export function CredentialsModal({ isOpen, onClose, platform, onSave, currentCredentials }: CredentialsModalProps) {
  const config = platformConfig[platform as keyof typeof platformConfig]
  const [formData, setFormData] = useState<Record<string, string>>(() => {
    const initialData: Record<string, string> = {}
    config?.fields.forEach(field => {
      initialData[field.key] = currentCredentials?.[field.key] || ""
    })
    return initialData
  })
  const [isSaving, setIsSaving] = useState(false)

  if (!config) return null

  const Icon = config.icon

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      onSave(platform.toLowerCase(), formData)
      onClose()
    } catch (error) {
      console.error('Error saving credentials:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const isFormValid = config.fields.every(field => formData[field.key]?.trim())

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <Icon className={`w-6 h-6 ${config.color}`} />
            <DialogTitle className="text-foreground">Connect {platform}</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            Enter your {platform} credentials to connect your account
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {config.fields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key} className="text-foreground">
                {field.label}
              </Label>
              <Input
                id={field.key}
                value={formData[field.key]}
                onChange={(e) => setFormData((prev: Record<string, string>) => ({
                  ...prev,
                  [field.key]: e.target.value
                }))}
                placeholder={field.placeholder}
                className="bg-muted border-border text-foreground"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isFormValid || isSaving}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {isSaving ? "Connecting..." : "Connect"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 