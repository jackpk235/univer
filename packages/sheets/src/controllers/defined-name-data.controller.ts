/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
    Disposable,
    ICommandService,
    IResourceManagerService,
    IUniverInstanceService,
    LifecycleStages,
    OnLifecycle,
} from '@univerjs/core';
import type { IDefinedNameMapItem } from '@univerjs/engine-formula';
import { IDefinedNamesService } from '@univerjs/engine-formula';
import { UniverType } from '@univerjs/protocol';

const SHEET_DEFINED_NAME_PLUGIN = 'SHEET_DEFINED_NAME_PLUGIN';

@OnLifecycle(LifecycleStages.Ready, DefinedNameDataController)
export class DefinedNameDataController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IDefinedNamesService private readonly _definedNamesService: IDefinedNamesService,
        @IResourceManagerService private _resourceManagerService: IResourceManagerService

    ) {
        super();

        this._initialize();
    }

    private _initialize(): void {
        this._initSnapshot();
    }

    private _initSnapshot() {
        const toJson = (unitID: string) => {
            const map = this._definedNamesService.getDefinedNameMap(unitID);
            if (map) {
                return JSON.stringify(map);
            }
            return '';
        };
        const parseJson = (json: string): IDefinedNameMapItem => {
            if (!json) {
                return {};
            }
            try {
                return JSON.parse(json);
            } catch (err) {
                return {};
            }
        };
        this.disposeWithMe(
            this._resourceManagerService.registerPluginResource<IDefinedNameMapItem>({
                pluginName: SHEET_DEFINED_NAME_PLUGIN,
                businesses: [UniverType.UNIVER_SHEET],
                toJson: (unitID) => toJson(unitID),
                parseJson: (json) => parseJson(json),
                onUnLoad: (unitID) => {
                    this._definedNamesService.removeUnitDefinedName(unitID);
                },
                onLoad: (unitID, value) => {
                    this._definedNamesService.registerDefinedNames(unitID, value);
                },
            })
        );
    }
}
