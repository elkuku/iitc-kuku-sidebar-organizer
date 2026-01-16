import { SidebarService } from '../service/SidebarService';

export interface SorterGroup {
    id: string;
    name: string;
    items: SorterItem[];
}

export interface SorterItem {
    id: string;
    title: string;
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
            name: 'default',
            items: this.sidebar.readLinks().map(link => ({
                id: link.id,
                title: link.title
            }))
        }];
    }
}
