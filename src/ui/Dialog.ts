import Sortable from 'sortablejs'

import {SorterGroup, SorterState} from '../state/SorterState'
import {StorageService} from '../service/StorageService'
import {SidebarService} from '../service/SidebarService'

export class DialogHelper {

    private groupsRoot!: HTMLElement

    public constructor(
        //private pluginName: string,
        //private title: string,
        private state: SorterState,
        private storage: StorageService<SorterGroup[]>,
        private sidebar: SidebarService
    ) {}

    public open() {
        const root = document.createElement('div')
        root.innerHTML = `
      <button id="add-group">Add Group</button>
      <button id="reset-groups">Reset</button>
      <div id="groups"></div>
    `

        window.dialog({
            position: {my: 'top', at: 'top', of: window},
            id: 'sidebar-sorter',
            title: 'Sidebar Organizer',
            html: root,
            width: 'auto',
            buttons: []
        })

        this.groupsRoot = root.querySelector('#groups')!
        this.render()

        root.querySelector<HTMLButtonElement>('#add-group')!.addEventListener('click', () => {
            this.state.groups.push({
                id: SorterState.uid(),
                name: 'New Group',
                items: []
            })
            this.render()
            this.sync()
        })

        root.querySelector<HTMLButtonElement>('#reset-groups')!.addEventListener('click', () => {
            this.storage.clear()
            this.state.initFromSidebar()
            this.render()
            this.sync()
        })
    }

    private render(): void {
        this.groupsRoot.innerHTML = ''
        this.state.groups.forEach(g =>
            this.groupsRoot.appendChild(this.renderGroup(g))
        )
    }

    private renderGroup(group: SorterGroup): HTMLElement {
        const element = document.createElement('div')
        element.dataset.groupId = group.id

        element.innerHTML = `
      <input class="group-title" value="${group.name}">
      <div class="group-list"></div>
    `

        const ul = element.querySelector<HTMLElement>('.group-list')!

        group.items.forEach(item => {
            const li = document.createElement('div')
            li.dataset.id = item.id
            li.dataset.title = item.title;
            li.classList.add('sortable-item')
            li.innerHTML = `
                <span class="drag-handle">☰</span>
                <span class="title">${item.title}</span>
            `
            ul.appendChild(li)
        })

        element.querySelector<HTMLInputElement>('.group-title')!.addEventListener(
            'change',
            event => {
                group.name = (event.target as HTMLInputElement).value
                this.sync()
            }
        )

        new Sortable(ul, {
            group: 'sidebar',
            handle: '.drag-handle',
            animation: 150,
            onEnd: () => this.sync()
        })

        return element
    }

    private sync(): void {
        this.state.groups.forEach(g => {
            const root = document.querySelector(
                `[data-group-id="${g.id}"] .group-list`
            )!

            g.items = [...root.children]
            .map(li => ({
                id: (li as HTMLElement).dataset.id!,
                title: (li as HTMLElement).dataset.title!
            }));
        })

        this.storage.save(this.state.groups)
        this.sidebar.reorder(this.state.groups)
    }
/*
    public getDialog(): JQuery {
        this.handlebars = window.plugin.HelperHandlebars

        if (!this.handlebars) {
            alert(`${this.pluginName} - Handlebars helper not found`)
            throw new Error(`${this.pluginName} - Handlebars helper not found`)
        }

        const template = this.handlebars.compile(dialogTemplate)

        const data = {
            plugin: 'window.plugin.' + this.pluginName,
            prefix: this.pluginName,
        }

        return window.dialog({
            // position: {my: 'top', at: 'top', of: window},
            id: this.pluginName,
            title: this.title,
            html: template(data),
            width: 'auto',
            height: 'auto',
            buttons: [],
        }).parent()
    }

    public updateDialog() {
        console.log('DialogHelper.updateDialog')
        const element = document.getElementById('items')!
        const element2 = document.getElementById('items2')!
        //const sortable =
        // xeslint-disable-next-line @typescript-eslint/no-unsafe-call
        //  Sortable.create(element)

        new Sortable(element, {
            group: 'shared', // set both lists to same group
            handle: '.drag-handle',
        })

        new Sortable(element2, {
            group: 'shared',
            handle: '.drag-handle',
        })
    }

    */
}
