'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Clock,
  DollarSign,
  Receipt,
  Calculator,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Play,
  Square,
  Users,
  ShoppingCart,
  CreditCard,
  Banknote,
  Smartphone,
  Building2
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export interface PosSession {
  id: string;
  sessionNumber: string;
  startTime: Date;
  endTime?: Date;
  openingCash: number;
  closingCash?: number;
  expectedCash?: number;
  variance?: number;
  status: 'ACTIVE' | 'CLOSED' | 'RECONCILED';
  totalSales: number;
  totalCashSales: number;
  totalCardSales: number;
  totalUpiSales: number;
  totalBankTransferSales: number;
  totalTransactions: number;
  openedBy: string;
  closedBy?: string;
}

interface PosSessionManagerProps {
  currentSession: PosSession | null;
  onStartSession: (openingCash: number) => void;
  onEndSession: (closingCash: number, notes?: string) => void;
  isLoading?: boolean;
}

export function PosSessionManager({
  currentSession,
  onStartSession,
  onEndSession,
  isLoading = false
}: PosSessionManagerProps) {
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [openingCash, setOpeningCash] = useState<string>('');
  const [closingCash, setClosingCash] = useState<string>('');
  const [endNotes, setEndNotes] = useState<string>('');

  const handleStartSession = () => {
    const amount = parseFloat(openingCash);
    if (amount >= 0) {
      onStartSession(amount);
      setOpeningCash('');
      setShowStartDialog(false);
    }
  };

  const handleEndSession = () => {
    const amount = parseFloat(closingCash);
    if (amount >= 0) {
      onEndSession(amount, endNotes || undefined);
      setClosingCash('');
      setEndNotes('');
      setShowEndDialog(false);
      setShowEndConfirm(false);
    }
  };

  const calculateExpectedCash = (session: PosSession) => {
    return session.openingCash + session.totalCashSales;
  };

  const calculateVariance = (session: PosSession, closingAmount: number) => {
    const expected = calculateExpectedCash(session);
    return closingAmount - expected;
  };

  const getSessionDuration = (session: PosSession) => {
    const start = session.startTime;
    const end = session.endTime || new Date();
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (!currentSession) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              POS Session
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <div className="text-muted-foreground mb-4">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No Active Session</p>
              <p className="text-sm">Start a new POS session to begin sales</p>
            </div>
            <Button 
              onClick={() => setShowStartDialog(true)}
              disabled={isLoading}
              size="lg"
              className="w-full max-w-xs"
            >
              <Play className="h-4 w-4 mr-2" />
              Start New Session
            </Button>
          </CardContent>
        </Card>

        {/* Start Session Dialog */}
        <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Start POS Session
              </DialogTitle>
              <DialogDescription>
                Enter the opening cash amount in the drawer to start your session.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="openingCash">Opening Cash Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="openingCash"
                    type="number"
                    value={openingCash}
                    onChange={(e) => setOpeningCash(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="pl-10"
                    autoFocus
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Count all cash currently in the drawer
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowStartDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleStartSession}
                disabled={!openingCash || parseFloat(openingCash) < 0}
              >
                Start Session
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  const expectedCash = calculateExpectedCash(currentSession);
  const variance = currentSession.closingCash !== undefined 
    ? calculateVariance(currentSession, currentSession.closingCash)
    : 0;

  return (
    <div className="space-y-4">
      {/* Session Status */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Current Session
            </CardTitle>
            <Badge 
              variant={currentSession.status === 'ACTIVE' ? 'default' : 'secondary'}
              className="flex items-center gap-1"
            >
              {currentSession.status === 'ACTIVE' ? (
                <CheckCircle className="h-3 w-3" />
              ) : (
                <Square className="h-3 w-3" />
              )}
              {currentSession.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-muted-foreground">Session #</Label>
              <p className="font-medium">{currentSession.sessionNumber}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Duration</Label>
              <p className="font-medium">{getSessionDuration(currentSession)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Opened By</Label>
              <p className="font-medium">{currentSession.openedBy}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Start Time</Label>
              <p className="font-medium">
                {currentSession.startTime.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>

          {currentSession.status === 'ACTIVE' && (
            <Button 
              onClick={() => setShowEndDialog(true)}
              variant="outline"
              className="w-full"
              disabled={isLoading}
            >
              <Square className="h-4 w-4 mr-2" />
              End Session
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Session Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <p className="text-lg font-semibold">
                  {formatCurrency(currentSession.totalSales)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Receipt className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Transactions</p>
                <p className="text-lg font-semibold">
                  {currentSession.totalTransactions}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Payment Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Banknote className="h-4 w-4 text-green-600" />
                <span className="text-sm">Cash</span>
              </div>
              <span className="font-medium">
                {formatCurrency(currentSession.totalCashSales)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Card</span>
              </div>
              <span className="font-medium">
                {formatCurrency(currentSession.totalCardSales)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-purple-600" />
                <span className="text-sm">UPI</span>
              </div>
              <span className="font-medium">
                {formatCurrency(currentSession.totalUpiSales)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-orange-600" />
                <span className="text-sm">Bank Transfer</span>
              </div>
              <span className="font-medium">
                {formatCurrency(currentSession.totalBankTransferSales)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cash Reconciliation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Cash Reconciliation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Opening Cash:</span>
            <span>{formatCurrency(currentSession.openingCash)}</span>
          </div>
          <div className="flex justify-between">
            <span>Cash Sales:</span>
            <span>{formatCurrency(currentSession.totalCashSales)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-medium">
            <span>Expected Cash:</span>
            <span>{formatCurrency(expectedCash)}</span>
          </div>
          {currentSession.closingCash !== undefined && (
            <>
              <div className="flex justify-between">
                <span>Actual Cash:</span>
                <span>{formatCurrency(currentSession.closingCash)}</span>
              </div>
              <div className="flex justify-between">
                <span>Variance:</span>
                <span className={variance === 0 ? 'text-green-600' : variance > 0 ? 'text-blue-600' : 'text-red-600'}>
                  {variance > 0 ? '+' : ''}{formatCurrency(variance)}
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* End Session Dialog */}
      <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Square className="h-5 w-5" />
              End POS Session
            </DialogTitle>
            <DialogDescription>
              Count the cash in the drawer to close your session.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Expected Cash Display */}
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Expected Cash</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(expectedCash)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Opening: {formatCurrency(currentSession.openingCash)} + 
                    Sales: {formatCurrency(currentSession.totalCashSales)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label htmlFor="closingCash">Actual Cash Count</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="closingCash"
                  type="number"
                  value={closingCash}
                  onChange={(e) => setClosingCash(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="pl-10"
                  autoFocus
                />
              </div>
              
              {closingCash && parseFloat(closingCash) >= 0 && (
                <div className="mt-2 p-2 bg-muted rounded text-sm">
                  <div className="flex justify-between">
                    <span>Variance:</span>
                    <span className={
                      calculateVariance(currentSession, parseFloat(closingCash)) === 0 
                        ? 'text-green-600' 
                        : calculateVariance(currentSession, parseFloat(closingCash)) > 0 
                        ? 'text-blue-600' 
                        : 'text-red-600'
                    }>
                      {calculateVariance(currentSession, parseFloat(closingCash)) > 0 ? '+' : ''}
                      {formatCurrency(calculateVariance(currentSession, parseFloat(closingCash)))}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endNotes">Notes (Optional)</Label>
              <Input
                id="endNotes"
                value={endNotes}
                onChange={(e) => setEndNotes(e.target.value)}
                placeholder="Any notes about the session..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEndDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => setShowEndConfirm(true)}
              disabled={!closingCash || parseFloat(closingCash) < 0}
            >
              End Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* End Session Confirmation */}
      <AlertDialog open={showEndConfirm} onOpenChange={setShowEndConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Session Confirmation</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Are you sure you want to end this POS session?</p>
              <div className="bg-muted p-3 rounded text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Expected Cash:</span>
                  <span>{formatCurrency(expectedCash)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Actual Cash:</span>
                  <span>{formatCurrency(parseFloat(closingCash) || 0)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Variance:</span>
                  <span className={
                    calculateVariance(currentSession, parseFloat(closingCash) || 0) === 0 
                      ? 'text-green-600' 
                      : calculateVariance(currentSession, parseFloat(closingCash) || 0) > 0 
                      ? 'text-blue-600' 
                      : 'text-red-600'
                  }>
                    {calculateVariance(currentSession, parseFloat(closingCash) || 0) > 0 ? '+' : ''}
                    {formatCurrency(calculateVariance(currentSession, parseFloat(closingCash) || 0))}
                  </span>
                </div>
              </div>
              <p className="text-xs">This action cannot be undone.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleEndSession}>
              End Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}