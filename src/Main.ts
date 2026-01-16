import * as Plugin from 'iitcpluginkit'
import {DialogHelper} from './ui/Dialog'

import {SidebarService} from './service/SidebarService'
import {StorageService} from './service/StorageService'
import {SorterGroup, SorterState} from './state/SorterState'

import plugin from '../plugin.json'

import './styles/styles.css'

const PLUGIN_NAME = (plugin as { name: string }).name.replace('IITC plugin: ', '')

class Main implements Plugin.Class {
    private readonly STORAGE_KEY = 'KuKu_SIDEBAR_ORGANIZER'

    private sidebar = new SidebarService()
    private storage = new StorageService<SorterGroup[]>(this.STORAGE_KEY)
    private state = new SorterState(this.sidebar)

    init() {
        console.log(`${PLUGIN_NAME} - ${VERSION}`)

        this.createButtons()

        // Disable sorting @todo this seems like a hack :(
        IITC.toolbox.setSortMethod(() => 0)

        window.addHook('iitcLoaded', this.onIitcLoaded)
    }

    private onIitcLoaded = () => {
        console.log(`${PLUGIN_NAME} - Starting`)

        const stored = this.storage.load()

        if (stored) {
            this.state.groups = stored
            this.sidebar.reorder(this.state.groups)
        } else {
            this.state.initFromSidebar()
        }
    }

    private createButtons(): void {
        IITC.toolbox.addButton({
            label: 'Organizer',
            title: 'Organize your sidebar [y]',
            accessKey: 'y',
            id: `${PLUGIN_NAME}-ToolboxButton`,
            action: this.showDialog
        })
    }

    private showDialog = (): void => {
        new DialogHelper(PLUGIN_NAME, 'Sidebar Organizer', this.state, this.storage, this.sidebar)
        .open()
    }
}

Plugin.Register(new Main, PLUGIN_NAME)
