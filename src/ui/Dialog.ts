import Sortable from 'sortablejs'

import {SorterGroup, SorterState} from '../state/SorterState'
import {StorageService} from '../service/StorageService'
import {SidebarService} from '../service/SidebarService'

export class DialogHelper {

    private groupsRoot!: HTMLElement

    public constructor(
        private pluginName: string,
        private title: string,
        private state: SorterState,
        private storage: StorageService<SorterGroup[]>,
        private sidebar: SidebarService
    ) {}

    public open() {
        window.dialog({
            position: {my: 'top', at: 'top', of: window},
            id: `${this.pluginName}-Dialog`,
            title: this.title,
            html: `<div id="${this.pluginName}-Container"></div>`,
            width: 'auto',
            buttons: [
                {
                    text: 'Add Group',
                    click: () => {
                        this.state.groups.push({
                            id: SorterState.uid(),
                            name: 'New Group',
                            items: []
                        })
                        this.render()
                        this.sync()
                    }
                },
                {
                    text: 'Reset',
                    click: () => {
                        this.storage.clear()
                        this.state.initFromSidebar()
                        this.render()
                        this.sync()
                    }
                }
            ]
        })

        this.groupsRoot = document.querySelector(`#${this.pluginName}-Container`)!
        this.render()
    }

    private render(): void {
        this.groupsRoot.innerHTML = ''
        this.state.groups.forEach(g =>
            this.groupsRoot.appendChild(this.renderGroup(g))
        )
    }

    private renderGroup(group: SorterGroup): HTMLElement {
        const groupContainer = document.createElement('div')
        groupContainer.dataset.groupId = group.id

        let html = 'default' === group.name ? '' : `<input class="group-title" value="${group.name}">`

        html += '<div class="group-list"></div>'

        groupContainer.innerHTML = html

        const itemList = groupContainer.querySelector<HTMLElement>('.group-list')!

        group.items.forEach(item => {
            const itemContainer = document.createElement('div')
            itemContainer.dataset.id = item.id
            itemContainer.dataset.title = item.title
            itemContainer.classList.add('sortable-item')
            itemContainer.innerHTML = `
                <span class="drag-handle">☰</span>
                <span class="title">${item.title}</span>
            `
            itemList.appendChild(itemContainer)
        })

        if ('default' !== group.name) {
            groupContainer.querySelector<HTMLInputElement>('.group-title')!.addEventListener(
                'input',
                event => {
                    group.name = (event.target as HTMLInputElement).value
                    this.sync()
                }
            )
        }

        new Sortable(itemList, {
            group: 'shared',
            handle: '.drag-handle',
            animation: 150,
            onEnd: () => this.sync()
        })

        return groupContainer
    }

    private sync(): void {
        this.state.groups.forEach(group => {
            const root = document.querySelector(
                `[data-group-id="${group.id}"] .group-list`
            )!

            group.items = [...root.children]
            .map(li => ({
                id: (li as HTMLElement).dataset.id!,
                title: (li as HTMLElement).dataset.title!
            }))
        })

        this.storage.save(this.state.groups)
        this.sidebar.reorder(this.state.groups)
    }
}
