import { ISlidePage, PLUGIN_NAMES } from '@univer/core';
import { SlidePlugin } from '../SlidePlugin';
import { SlideBar } from '../View/UI/SlideBar/SlideBar';

export class SlideBarController {
    private _plugin: SlidePlugin;

    private _slideBar: SlideBar;

    private _pages: ISlidePage[] = [];

    constructor(plugin: SlidePlugin) {
        this._plugin = plugin;

        this._init();
    }

    private _init() {
        const context = this._plugin.context;
        const manager = context.getObserverManager();

        this._generateModel();

        manager.requiredObserver<SlideBar>('onSlideBarDidMountObservable', PLUGIN_NAMES.SLIDE).add((component) => {
            this._slideBar = component;

            this._slideBar.setSlide(this._pages);

            this._plugin.getObserver('onSlideContainerDidMountObservable')?.add(() => {
                const canvasView = this._getCanvasView();

                canvasView.createSideThumb(this._slideBar, this._pages);
            });
        });
    }

    private _getCanvasView() {
        return this._plugin.getCanvasView();
    }

    private _generateModel() {
        const model = this._plugin.context.getSlide();
        const pages = model.getPages();
        const pageOrder = model.getPageOrder();
        if (!pages || !pageOrder) {
            return;
        }

        pageOrder.forEach((pageKey) => {
            this._pages.push(pages[pageKey]);
        });
    }

    addSlide() {
        const model = this._plugin.context.getSlide();
        const canvasView = this._getCanvasView();
        const newPage = model.addPage();
        this._pages.push(newPage);

        this._slideBar.setSlide(this._pages);

        canvasView.createSideThumb(this._slideBar, this._pages);
    }
}
