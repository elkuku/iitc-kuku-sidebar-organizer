import { SidebarService } from '../service/SidebarService';

export interface SorterItem {
    id: string;
    title: string;
}

export interface SorterGroup {
    id: string;
    name: string;
    items: SorterItem[];
}

export class SorterState {

    groups: SorterGroup[] = [];

    constructor(private sidebar: SidebarService) {}

    static uid(): string {
        return `grp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }

    initFromSidebar(): void {
        this.groups = [{
            id: SorterState.uid(),
            name: '',
            items: this.sidebar.readLinks().map(l => ({
                id: l.id,
                title: l.title
            }))
        }];
    }

    flattenIds(): string[] {
        return this.groups.flatMap(g => g.items.map(i => i.title));
    }
}
