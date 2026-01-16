import * as Plugin from 'iitcpluginkit'
import {DialogHelper} from './ui/Dialog'

import {SidebarService} from './service/SidebarService'
import {StorageService} from './service/StorageService'
import {SorterGroup, SorterState} from './state/SorterState'

// @ts-expect-error we don't want to import JSON files :(
import plugin from '../plugin.json'

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
const PLUGIN_NAME = plugin.name.replace('IITC plugin: ', '') as string

class Main implements Plugin.Class {
    private readonly STORAGE_KEY = 'KuKu_SIDEBAR_SORTER'

    private sidebar = new SidebarService()
    private storage = new StorageService<SorterGroup[]>(this.STORAGE_KEY)
    private state = new SorterState(this.sidebar)

    init() {
        console.log(`${PLUGIN_NAME} - ${VERSION}`)

        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require('./styles.css')

        this.createButtons()

        // Disable sorting @todo this seems like a hack :(
        // IITC.toolbox.setSortMethod(() => 0)
        IITC.toolbox.setSortMethod(() => {
            console.log('Sorting disabled!')
            return 0
        })

        window.addHook('iitcLoaded', this.onIitcLoaded)
    }

    private onIitcLoaded = () => {
        console.log(`${PLUGIN_NAME} - Starting`)

        const stored = this.storage.load()
        console.log(stored)
        if (stored) {
            this.state.groups = stored
            this.sidebar.reorder(this.state.groups)
        } else {
            this.state.initFromSidebar()
        }
        console.log(this.state)
        console.log(this.state.groups)
    }

    private createButtons(): void {
        IITC.toolbox.addButton({
            label: 'Organizer',
            title: 'Organize your sidebar [y]',
            accessKey: 'y',
            id: `btn-${PLUGIN_NAME}`,
            action: this.showDialog
        })
    }

    private showDialog = (): void => {
        new DialogHelper(PLUGIN_NAME, 'Sidebar Organizer', this.state, this.storage, this.sidebar)
        .open()
    }
}

Plugin.Register(new Main, PLUGIN_NAME)
