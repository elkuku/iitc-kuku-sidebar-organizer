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

        html += `
        <div id="floatingMenu">
          <ul>
            <li>Edit</li>
            <li>Delete</li>
            <li>Share</li>
          </ul>
        </div>
        `

        groupContainer.innerHTML = html

        const itemList = groupContainer.querySelector<HTMLElement>('.group-list')!

        group.items.forEach(item => {
            const itemContainer = document.createElement('div')
            itemContainer.dataset.id = item.id
            itemContainer.dataset.title = item.title
            itemContainer.dataset.visible = item.options.visible ? 'true' : 'false'

            itemContainer.classList.add('sortable-item')
            let html = ''
            html += `<span class="drag-handle" title="Drag to move">☰</span>`
            html += `<span class="title">${item.title}</span>`
            // html += `<span class="context-menu" onclick="window.plugin.${this.pluginName}.openContextMenu('${item.title}', event)">O</span>`

            if ('Organizer' !== item.title) {
                const hidden = item.options.visible ? '' : ' item-hidden'
                html += `<span class="context-menu toggle-visible${hidden}" data-identifier="${item.title}" title="Show/hide">X</span>`
            }

            itemContainer.innerHTML = html
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

        const toggleButtons = groupContainer.querySelectorAll<HTMLElement>('.toggle-visible')

        for (const button of toggleButtons) {
            button.addEventListener('click', () => this.onToggleVisible(button))
        }

        new Sortable(itemList, {
            group: 'shared',
            handle: '.drag-handle',
            animation: 150,
            onEnd: () => this.sync()
        })

        return groupContainer
    }

    private onToggleVisible(button: HTMLElement) {
        const parent = button.parentElement!

        const visible = parent.dataset.visible!

        if ('false' == visible) {
            parent.dataset.visible = 'true'
            button.classList.remove('item-hidden')
        } else {
            parent.dataset.visible = 'false'
            button.classList.add('item-hidden')
        }

        this.sync()
    }

    private sync(): void {
        this.state.groups.forEach(group => {
            const root = document.querySelector(
                `[data-group-id="${group.id}"] .group-list`
            )!

            group.items = [...root.children]
            .map(li => ({
                id: (li as HTMLElement).dataset.id!,
                title: (li as HTMLElement).dataset.title!,
                options: {
                    visible: (li as HTMLElement).dataset.visible !== 'false',
                    icon: '', //@todo
                }
            }))
        })

        this.storage.save(this.state.groups)
        this.sidebar.reorder(this.state.groups)
    }

    public openContextMenu(item: string, event: PointerEvent) {
        console.log('Dialog - openContextMenu', item, event)

        const menu = document.getElementById('floatingMenu')

        if (!menu) return

        event.stopPropagation()

        const container = menu.parentElement

        if (!container) return

        const bounds = container.getBoundingClientRect()

        console.log(bounds)

        const x = event.clientX - bounds.left
        const y = event.clientY - bounds.top

        console.log('openContextMenu', event.clientX, event.clientY)
        console.log('openContextMenu', x, y)

        menu.style.left = `${x}px`
        menu.style.top = `${y}px`

        menu.classList.add('show')

        window.addEventListener('click', () => {
            menu.classList.remove('show')
        })
    }
}
