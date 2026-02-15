import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface NewListModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDownloadAndContinue: () => void;
    onContinueWithoutSaving: () => void;
}

export function NewListModal({ isOpen, onClose, onDownloadAndContinue, onContinueWithoutSaving }: NewListModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                className={cn(
                    "sm:max-w-[380px] p-8 !rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.15)]",
                    "border-none bg-white",
                    "data-[state=open]:animate-in data-[state=closed]:animate-out",
                    "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
                    "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
                    "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
                    "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]"
                )}
                style={{
                    borderRadius: '20px',
                    width: '380px',
                    maxWidth: '92vw',
                    padding: '32px 28px',
                    gap: '0'
                }}
            >
                <div className="flex flex-col items-center text-center">
                    {/* Icon */}
                    <div className="w-[44px] h-[44px] rounded-full bg-[#FFF8E1] flex items-center justify-center mb-5">
                        <AlertTriangle className="w-6 h-6 text-[#F59E0B]" strokeWidth={2.5} />
                    </div>

                    {/* Title */}
                    <h2 className="text-[17px] font-bold font-sora text-[#1A1A2E] mb-2 leading-tight">
                        Nouvelle liste
                    </h2>

                    {/* Description */}
                    <p className="text-[15px] font-medium font-['DM_Sans'] text-[#6B7280] mb-6 leading-relaxed">
                        La session en cours sera perdue.<br />Voulez-vous télécharger le rapport ?
                    </p>

                    {/* Actions */}
                    <div className="flex w-full gap-[10px] mt-2">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className={cn(
                                "flex-1 h-auto py-[11px] px-[16px]",
                                "border-[1.5px] border-[#E5E7EB] bg-white",
                                "text-[#9CA3AF] text-[14px] font-medium font-['DM_Sans']",
                                "rounded-[10px] hover:bg-gray-50 hover:text-[#9CA3AF] transition-colors"
                            )}
                        >
                            Annuler
                        </Button>
                        <Button
                            variant="outline"
                            onClick={onContinueWithoutSaving}
                            className={cn(
                                "flex-1 h-auto py-[11px] px-[16px]",
                                "border-[1.5px] border-[#6C5CE7] bg-white",
                                "text-[#6C5CE7] text-[14px] font-semibold font-['DM_Sans']",
                                "rounded-[10px] hover:bg-[#6C5CE7]/5 hover:text-[#6C5CE7] transition-colors"
                            )}
                        >
                            Continuer
                        </Button>
                        <Button
                            onClick={onDownloadAndContinue}
                            className={cn(
                                "flex-1 h-auto py-[11px] px-[16px]",
                                "bg-[#6C5CE7] text-white",
                                "text-[14px] font-semibold font-['DM_Sans']",
                                "rounded-[10px] shadow-[0_3px_10px_rgba(108,92,231,0.3)]",
                                "hover:bg-[#5a4ad1] transition-all hover:shadow-[0_5px_15px_rgba(108,92,231,0.4)]"
                            )}
                        >
                            <Download className="w-4 h-4 mr-1.5" />
                            Exporter
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
