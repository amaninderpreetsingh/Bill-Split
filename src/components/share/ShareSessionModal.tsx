import { useState } from 'react';
import QRCode from 'react-qr-code';
import { Copy, Check, Share2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { generateShareableLink } from '@/utils/shareCode';

interface ShareSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  shareCode: string;
  onEndSession?: () => void;
}

export function ShareSessionModal({
  isOpen,
  onClose,
  sessionId,
  shareCode,
  onEndSession,
}: ShareSessionModalProps) {
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const shareableLink = generateShareableLink(sessionId, shareCode);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(shareCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my bill splitting session',
          text: `Join my collaborative bill session with code: ${shareCode}`,
          url: shareableLink,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Collaborative Session
          </DialogTitle>
          <DialogDescription>
            Share this QR code or link with others to collaborate on this bill
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* QR Code */}
          <div className="flex justify-center p-6 bg-white rounded-lg">
            <QRCode value={shareableLink} size={200} level="H" />
          </div>

          {/* Share Code */}
          <div className="space-y-2">
            <Label htmlFor="share-code">Share Code</Label>
            <div className="flex gap-2">
              <Input
                id="share-code"
                value={shareCode}
                readOnly
                className="font-mono text-xl text-center tracking-wider"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyCode}
                className="shrink-0"
              >
                {copiedCode ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Others can enter this code manually to join
            </p>
          </div>

          {/* Shareable Link */}
          <div className="space-y-2">
            <Label htmlFor="share-link">Shareable Link</Label>
            <div className="flex gap-2">
              <Input
                id="share-link"
                value={shareableLink}
                readOnly
                className="text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            {navigator.share && (
              <Button onClick={handleNativeShare} variant="info" className="w-full">
                <Share2 className="w-4 h-4 mr-2" />
                Share via...
              </Button>
            )}

            {onEndSession && (
              <Button onClick={onEndSession} variant="destructive" className="w-full">
                <X className="w-4 h-4 mr-2" />
                End Session for Everyone
              </Button>
            )}

            <Button onClick={onClose} variant="outline" className="w-full">
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
