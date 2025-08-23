
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";

export interface BaseDeleteConfig {
    title: string;
    description: string;
    itemName: string;
    itemType: string;
    confirmButtonText?: string;
}

export interface RelationshipDeleteConfig extends BaseDeleteConfig {
    hasRelationships: boolean;
    relationshipDetails: {
        products?: number;
        purchases?: number;
        items?: number;
    };
    relationshipMessage?: string;
}

export type DeleteDialogConfig = BaseDeleteConfig | RelationshipDeleteConfig;

interface GlobalDeleteConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    config: DeleteDialogConfig;
    isLoading?: boolean;
}

// type guard to check if config has relationships
function hasRelationships(config: DeleteDialogConfig): config is RelationshipDeleteConfig {
    return 'hasRelationships' in config;
}

function generateRelationshipMessage(
  config: RelationshipDeleteConfig,
  itemType: string
): string {
  if (config.relationshipMessage) {
    return config.relationshipMessage;
  }

  const { products = 0, purchases = 0, items = 0 } = config.relationshipDetails;
  const parts: string[] = [];

  if (products > 0) {
    parts.push(`${products} associated product${products !== 1 ? 's' : ''}`);
  }
  if (purchases > 0) {
    parts.push(`${purchases} purchase${purchases !== 1 ? 's' : ''}`);
  }
  if (items > 0) {
    parts.push(`${items} item${items !== 1 ? 's' : ''}`);
  }

  const relationshipText = parts.join(' and ');
  return `This ${itemType} cannot be deleted because it has ${relationshipText}. Please remove or reassign all associated data before deleting.`;
}

function generateWarningMessage(itemType: string): string {
  return `This action cannot be undone. This will permanently delete the ${itemType} and remove all associated data.`;
}

export default function GlobalDeleteConfirmationDialog({
    isOpen,
    onClose,
    onConfirm,
    config,
    isLoading = false
}: GlobalDeleteConfirmationDialogProps) {
    const hasRelationshipsData = hasRelationships(config) && config.hasRelationships;
    const confirmButtonText = config.confirmButtonText || `Delete ${config.itemType}`

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                            {config.title}
                    </DialogTitle>
                    <DialogDescription className="text-left">
                        {config.description}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="font-medium text-sm">
                            You are about to delete: <span className="font-bold">"{config.itemName}"</span>
                        </p>
                    </div>

                    {hasRelationshipsData && hasRelationships(config) && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                {generateRelationshipMessage(config, config.itemType)}
                            </AlertDescription>
                        </Alert>
                    )}

                    {!hasRelationshipsData && (
                        <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                {generateWarningMessage(config.itemType)}
                            </AlertDescription>
                        </Alert>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isLoading || hasRelationshipsData}
                    >
                        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {confirmButtonText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
