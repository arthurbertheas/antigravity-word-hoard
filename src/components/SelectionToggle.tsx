import { useSelection } from "@/contexts/SelectionContext";
import { List } from "lucide-react";

export function SelectionToggle() {
    const { setIsTrayOpen, selectedWords } = useSelection();

    return (
        <button
            onClick={() => setIsTrayOpen(true)}
            className="fixed top-6 right-6 z-40 bg-white border border-border rounded-full p-3 shadow-lg hover:shadow-xl hover:scale-105 transition-all group flex items-center justify-center"
            title="Ouvrir ma liste"
        >
            <div className="relative">
                <List className="w-5 h-5 text-neutral-700 group-hover:text-black" />
                {selectedWords.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white" />
                )}
            </div>
        </button>
    );
}
