import {SorterGroup} from '../state/SorterState'

export interface SidebarLink {
    id: string;
    title: string;
    element: HTMLElement;
}

export class SidebarService {

    public readLinks(): SidebarLink[] {
        const root = this.getContainer()
        if (!root) return []

        return [...root.querySelectorAll<HTMLAnchorElement>('a[id]')]
        .map(link => ({
            id: link.id,
            title: link.textContent?.trim() ?? '',
            element: link
        }))
    }

    public reorder(groups: SorterGroup[]): void {
        const root = this.getContainer()
        if (!root) return

        this.clearHeaders()

        const linkMap = new Map<string, HTMLElement>()
        this.readLinks().forEach(link => linkMap.set(link.title, link.element))

        groups.forEach(group => {
            if ('default' !== group.name) {
                // Insert group header
                const header = document.createElement('div')

                header.className = 'iitc-toolbox-header'
                header.dataset.groupId = group.id
                header.textContent = group.name

                root.appendChild(header)
            }

            // Insert items
            group.items.forEach(item => {
                const element = linkMap.get(item.title)
                element?.classList.toggle('item-hidden', !item.options.visible)
                if (element) root.appendChild(element)
            })
        })
    }

    private getContainer(): HTMLElement | null {
        return document.querySelector('#toolbox_component')
    }

    private clearHeaders(): void {
        this.getContainer()
        ?.querySelectorAll('.iitc-toolbox-header')
        .forEach(header => header.remove())
    }
}
