import {SidebarLink, SidebarService} from '../service/SidebarService'

export interface SorterGroup {
    id: string;
    name: string;
    items: SorterItem[];
}

export interface SorterItem {
    id: string;
    title: string;
    options: SorterOptions
}

export interface SorterOptions {
    visible: boolean
    icon: string
}

export class SorterState {

    groups: SorterGroup[] = []

    constructor(private sidebar: SidebarService) {}

    static uid(): string {
        return `grp-${Date.now()}-${Math.random().toString(36).slice(2)}`
    }

    public initFromSidebar(): void {
        this.groups = [{
            id: SorterState.uid(),
            name: 'default',
            items: this.sidebar.readLinks().map(link => ({
                id: link.id,
                title: link.title,
                options: {visible: true, icon: ''}
            }))
        }]
    }

    public reconcileWithSidebar(links: SidebarLink[]): boolean {
        console.log('reconcileWithSidebar')
        const existingIds = new Set(
            this.groups.flatMap(g => g.items.map(i => i.title))
        )

        const currentIds = new Set(links.map(l => l.title))
        let changed = false

        // Removed links
        this.groups.forEach(group => {
            const before = group.items.length
            group.items = group.items.filter(i => currentIds.has(i.title))
            if (group.items.length !== before) changed = true
        })

        // Added links
        const ungrouped =
            this.groups.find(g => g.name === 'default') ??
            this.createUngrouped()

        links.forEach(link => {
            if (!existingIds.has(link.title)) {
                ungrouped.items.push({
                    id: link.id,
                    title: link.title,
                    options: {visible: true, icon: ''}
                })
                changed = true
            }
        })

        return changed
    }

    private createUngrouped(): SorterGroup {
        const group: SorterGroup = {
            id: SorterState.uid(),
            name: 'default',
            items: []
        }
        this.groups.unshift(group)
        return group
    }
}
